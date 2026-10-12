import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List

def compute_pca_2d(
    df: pd.DataFrame,
    feature_names: List[str] = None,
    max_samples: int = 800
) -> Dict[str, Any]:
    if df is None or df.empty:
        return {"data": [], "explained_variance": [0.0, 0.0], "total_variance": 0.0}

    if not feature_names:
        feature_names = [
            "danceability", "energy", "key", "loudness", "mode",
            "speechiness", "acousticness", "instrumentalness", "liveness",
            "valence", "tempo"
        ]

    avail_features = [f for f in feature_names if f in df.columns]
    if len(avail_features) < 2:
        return {"data": [], "explained_variance": [0.0, 0.0], "total_variance": 0.0}

    clean_df = df.dropna(subset=avail_features).copy()
    if len(clean_df) > max_samples:
        clean_df = clean_df.sample(n=max_samples, random_state=42)

    X = clean_df[avail_features].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_scaled)
    exp_var = [round(float(v), 4) for v in pca.explained_variance_ratio_]

    results = []
    for i, (_, row) in enumerate(clean_df.iterrows()):
        results.append({
            "pc1": round(float(coords[i, 0]), 3),
            "pc2": round(float(coords[i, 1]), 3),
            "playlist": str(row.get("playlist", "Unknown")),
            "track_name": str(row.get("track_name", "Track")),
            "artist_name": str(row.get("artist_name", "Artist"))
        })

    return {
        "data": results,
        "explained_variance": exp_var,
        "total_variance_explained": round(float(sum(exp_var)), 4),
        "num_components": 2,
        "features_used": avail_features
    }
