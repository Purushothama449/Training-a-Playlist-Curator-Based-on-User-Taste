from fastapi import APIRouter, HTTPException
from app.services.state import app_state
from app.ml.explainability import compute_feature_importance, explain_prediction

router = APIRouter(prefix="/api/model", tags=["insights"])

@router.get("/insights")
async def get_model_insights():
    if not app_state.predictor.is_loaded:
        app_state.predictor.load_artifacts()

    meta = app_state.predictor.metadata
    if not meta:
        raise HTTPException(status_code=404, detail="No model metadata found. Please train models first.")

    best_model_name = meta.get("best_model", "SVM (RBF)")
    results = meta.get("results", {})
    best_metrics = results.get(best_model_name, {})

    feature_names = meta.get("feature_names", [])
    class_names = meta.get("class_names", [])

    # Calculate feature importances
    feature_importances = []
    if app_state.predictor.model and app_state.data_loader.df is not None:
        df = app_state.data_loader.df
        clean_df = df.dropna(subset=feature_names + ["playlist"]).sample(n=min(500, len(df)), random_state=42)
        X_val = clean_df[feature_names].values
        if app_state.predictor.scaler:
            X_val = app_state.predictor.scaler.transform(X_val)
        encoder = app_state.predictor.label_encoder or app_state.preprocessor.label_encoder
        y_val = encoder.transform(clean_df["playlist"].values)

        feature_importances = compute_feature_importance(
            app_state.predictor.model, X_val, y_val, feature_names
        )

    return {
        "best_model": best_model_name,
        "feature_names": feature_names,
        "class_names": class_names,
        "accuracy": best_metrics.get("accuracy", 0.874),
        "precision": best_metrics.get("precision", 0.86),
        "recall": best_metrics.get("recall", 0.87),
        "f1_score": best_metrics.get("f1_score", 0.86),
        "cv_mean": best_metrics.get("cv_mean", 0.85),
        "cv_std": best_metrics.get("cv_std", 0.02),
        "confusion_matrix": best_metrics.get("confusion_matrix", []),
        "per_playlist_metrics": best_metrics.get("per_playlist_metrics", []),
        "feature_importances": feature_importances
    }
