from fastapi import APIRouter, HTTPException
from app.schemas.api_schemas import TrainRequest
from app.services.state import app_state

router = APIRouter(prefix="/api/models", tags=["models"])

@router.post("/train")
async def train_models(req: TrainRequest):
    df = app_state.data_loader.df
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset loaded. Please upload a dataset first.")

    # Validate columns
    if req.target_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{req.target_col}' not found in dataset.")

    avail_features = [f for f in req.feature_cols if f in df.columns]
    if len(avail_features) < 2:
        raise HTTPException(status_code=400, detail="At least 2 valid feature columns required.")

    app_state.preprocessor.scaling = req.scaling

    data_dict = app_state.preprocessor.prepare_data(
        df=df,
        feature_cols=avail_features,
        target_col=req.target_col,
        test_size=req.test_size,
        random_state=req.random_state
    )

    results = app_state.model_trainer.train_and_eval_all(
        X_train=data_dict["X_train"],
        X_test=data_dict["X_test"],
        y_train=data_dict["y_train"],
        y_test=data_dict["y_test"],
        class_names=data_dict["classes"],
        feature_names=avail_features,
        selected_models=req.selected_models,
        scaler=data_dict["scaler"],
        label_encoder=data_dict["label_encoder"],
        random_state=req.random_state
    )

    app_state.last_train_results = results
    app_state.is_trained = True
    app_state.predictor.load_artifacts()

    return {
        "message": "Models trained successfully!",
        "results": results
    }

@router.get("")
async def list_models():
    meta = app_state.predictor.metadata
    return {
        "is_trained": app_state.is_trained,
        "best_model": meta.get("best_model", "None"),
        "feature_names": meta.get("feature_names", []),
        "class_names": meta.get("class_names", []),
        "available_models": list(meta.get("results", {}).keys())
    }

@router.get("/comparison")
async def get_model_comparison():
    meta = app_state.predictor.metadata
    results = meta.get("results", {})
    if not results and app_state.last_train_results:
        results = app_state.last_train_results.get("models", {})

    if not results:
        return {
            "comparison_table": [],
            "best_model": None,
            "metrics_available": False
        }

    comparison_table = []
    for name, metrics in results.items():
        comparison_table.append({
            "model_name": name,
            "accuracy": metrics.get("accuracy", 0.0),
            "precision": metrics.get("precision", 0.0),
            "recall": metrics.get("recall", 0.0),
            "f1_score": metrics.get("f1_score", 0.0),
            "cv_mean": metrics.get("cv_mean", 0.0),
            "training_time": metrics.get("training_time", 0.0)
        })

    # Sort descending by accuracy
    comparison_table.sort(key=lambda x: x["accuracy"], reverse=True)

    return {
        "comparison_table": comparison_table,
        "best_model": meta.get("best_model", comparison_table[0]["model_name"] if comparison_table else None),
        "metrics_available": True
    }

@router.get("/{model_name}/metrics")
async def get_model_metrics(model_name: str):
    meta = app_state.predictor.metadata
    results = meta.get("results", {})
    if model_name not in results:
        raise HTTPException(status_code=404, detail=f"Metrics for model '{model_name}' not found.")
    return results[model_name]
