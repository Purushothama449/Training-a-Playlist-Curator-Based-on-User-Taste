from fastapi import APIRouter, HTTPException
from app.schemas.api_schemas import RecommendRequest
from app.services.state import app_state
from app.services.music_preview_service import music_preview_service

router = APIRouter(prefix="/api/recommend", tags=["recommend"])

@router.post("")
async def get_recommendations(req: RecommendRequest):
    if app_state.data_loader.df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded for recommendations.")

    recommendations = app_state.recommender.recommend_similar_songs(
        input_features=req.features,
        seed_track_id=req.seed_track_id,
        top_n=req.top_n
    )

    enriched_recommendations = []
    for rec in recommendations:
        rec_copy = dict(rec)
        # If dataset didn't provide a direct audio_url, resolve from Jamendo
        if not rec_copy.get("audio_url"):
            preview_meta = music_preview_service.resolve_preview_for_track(rec_copy)
            rec_copy.update(preview_meta)
        else:
            rec_copy.setdefault("music_source", "Dataset")
            rec_copy.setdefault("is_exact_match", True)

        enriched_recommendations.append(rec_copy)

    return {
        "count": len(enriched_recommendations),
        "recommendations": enriched_recommendations
    }

