from fastapi import APIRouter, HTTPException
from app.schemas.api_schemas import PredictRequest
from app.services.state import app_state
from app.services.music_preview_service import music_preview_service

router = APIRouter(prefix="/api/predict", tags=["predict"])

@router.post("")
async def predict_playlist(req: PredictRequest):
    if not app_state.predictor.is_loaded:
        app_state.predictor.load_artifacts()
        if not app_state.predictor.is_loaded:
            raise HTTPException(
                status_code=400,
                detail="No trained model available. Please train a model or upload a dataset first."
            )

    feature_values = req.features.copy()

    # If track_id specified, load features from dataset
    if req.track_id and app_state.data_loader.df is not None:
        df = app_state.data_loader.df
        matches = df[df["track_id"] == req.track_id]
        if not matches.empty:
            row = matches.iloc[0]
            for col in app_state.predictor.feature_names:
                if col in row:
                    feature_values[col] = float(row[col])

    if app_state.recommender.df is None and app_state.data_loader.df is not None:
        app_state.recommender.fit(app_state.data_loader.df)

    try:
        prediction_result = app_state.predictor.predict(feature_values)
        
        # Also compute song recommendations automatically
        recommendations = app_state.recommender.recommend_similar_songs(
            input_features=feature_values,
            seed_track_id=req.track_id,
            top_n=5
        )

        enriched_recommendations = []
        for rec in recommendations:
            rec_copy = dict(rec)
            if not rec_copy.get("audio_url"):
                preview_meta = music_preview_service.resolve_preview_for_track(rec_copy)
                rec_copy.update(preview_meta)
            else:
                rec_copy.setdefault("music_source", "Dataset")
                rec_copy.setdefault("is_exact_match", True)

            enriched_recommendations.append(rec_copy)

        return {
            "prediction": prediction_result,
            "recommendations": enriched_recommendations,
            "similar_songs": enriched_recommendations,
            "input_features": feature_values
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

