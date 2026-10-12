import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.services.state import app_state

router = APIRouter(prefix="/api/dataset", tags=["dataset"])

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

    upload_dir = os.path.join("data", "raw")
    os.makedirs(upload_dir, exist_ok=True)
    target_path = os.path.join(upload_dir, f"uploaded_{file.filename}")

    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Load and validate
        df = app_state.data_loader.load_data(target_path)
        is_valid, errors = app_state.data_loader.validate_dataset()
        if not is_valid:
            os.remove(target_path)
            raise HTTPException(status_code=400, detail=f"Dataset validation failed: {'; '.join(errors)}")

        app_state.dataset_path = target_path
        app_state.recommender.fit(df)
        
        # Trigger re-train on new dataset
        app_state.train_default_models()

        summary = app_state.data_loader.get_summary()
        return {
            "message": "Dataset uploaded and validated successfully!",
            "filename": file.filename,
            "summary": summary
        }
    except Exception as e:
        if os.path.exists(target_path):
            os.remove(target_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
async def get_dataset_summary(target_col: str = "playlist"):
    summary = app_state.data_loader.get_summary(target_col=target_col)
    if not summary:
        raise HTTPException(status_code=404, detail="Dataset not loaded.")
    return summary

@router.get("/preview")
async def get_dataset_preview(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Search term")
):
    preview = app_state.data_loader.get_preview(page=page, page_size=page_size, search=search)
    return preview
