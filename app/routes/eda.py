import numpy as np
from fastapi import APIRouter, HTTPException, Query
from app.services.state import app_state
from app.ml.pca_engine import compute_pca_2d

router = APIRouter(prefix="/api/eda", tags=["eda"])

@router.get("/playlist-distribution")
async def get_playlist_distribution():
    df = app_state.data_loader.df
    if df is None or "playlist" not in df.columns:
        raise HTTPException(status_code=404, detail="Dataset or playlist column unavailable.")

    counts = df["playlist"].value_counts().to_dict()
    data = [{"playlist": k, "count": int(v)} for k, v in counts.items()]
    return {"distribution": data, "total_playlists": len(data)}

@router.get("/correlation")
async def get_correlation_matrix():
    df = app_state.data_loader.df
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset unavailable.")

    feature_cols = [
        "danceability", "energy", "key", "loudness", "mode",
        "speechiness", "acousticness", "instrumentalness", "liveness",
        "valence", "tempo"
    ]
    avail_features = [f for f in feature_cols if f in df.columns]

    if len(avail_features) < 2:
        raise HTTPException(status_code=400, detail="Insufficient numerical features for correlation.")

    corr_df = df[avail_features].corr().fillna(0)
    
    matrix = []
    for r_idx, feat1 in enumerate(avail_features):
        row = []
        for c_idx, feat2 in enumerate(avail_features):
            row.append(round(float(corr_df.iloc[r_idx, c_idx]), 3))
        matrix.append(row)

    return {
        "features": avail_features,
        "matrix": matrix
    }

@router.get("/pca")
async def get_pca_analysis(max_samples: int = Query(600, ge=100, le=2000)):
    df = app_state.data_loader.df
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset unavailable.")

    pca_results = compute_pca_2d(df, max_samples=max_samples)
    return pca_results

@router.get("/scatter")
async def get_scatter_data(
    feature_x: str = Query("valence", description="X-axis feature"),
    feature_y: str = Query("energy", description="Y-axis feature"),
    sample_size: int = Query(500, ge=50, le=2000)
):
    df = app_state.data_loader.df
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset unavailable.")

    if feature_x not in df.columns or feature_y not in df.columns:
        raise HTTPException(status_code=400, detail=f"Features '{feature_x}' or '{feature_y}' not found.")

    sample_df = df.dropna(subset=[feature_x, feature_y, "playlist"])
    if len(sample_df) > sample_size:
        sample_df = sample_df.sample(n=sample_size, random_state=42)

    points = []
    for _, row in sample_df.iterrows():
        points.append({
            "x": float(row[feature_x]),
            "y": float(row[feature_y]),
            "playlist": str(row["playlist"]),
            "track_name": str(row.get("track_name", "Track")),
            "artist_name": str(row.get("artist_name", "Artist"))
        })

    return {
        "feature_x": feature_x,
        "feature_y": feature_y,
        "points": points
    }

@router.get("/feature-distributions")
async def get_feature_distributions(feature: str = Query("danceability")):
    df = app_state.data_loader.df
    if df is None or feature not in df.columns:
        raise HTTPException(status_code=404, detail=f"Feature '{feature}' unavailable.")

    vals = df[feature].dropna().values
    hist, bin_edges = np.histogram(vals, bins=15)

    histogram_data = []
    for i in range(len(hist)):
        bin_label = f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}"
        histogram_data.append({
            "range": bin_label,
            "count": int(hist[i]),
            "bin_start": round(float(bin_edges[i]), 3),
            "bin_end": round(float(bin_edges[i+1]), 3)
        })

    return {
        "feature": feature,
        "mean": round(float(np.mean(vals)), 4),
        "std": round(float(np.std(vals)), 4),
        "min": round(float(np.min(vals)), 4),
        "max": round(float(np.max(vals)), 4),
        "histogram": histogram_data
    }

@router.get("/feature-stats")
async def get_playlist_feature_stats():
    df = app_state.data_loader.df
    if df is None or "playlist" not in df.columns:
        raise HTTPException(status_code=404, detail="Dataset unavailable.")

    feature_cols = [
        "danceability", "energy", "key", "loudness",
        "speechiness", "acousticness", "valence", "tempo"
    ]
    avail_features = [f for f in feature_cols if f in df.columns]

    grouped = df.groupby("playlist")[avail_features].mean().round(3).reset_index()
    return {"stats": grouped.to_dict(orient="records")}
