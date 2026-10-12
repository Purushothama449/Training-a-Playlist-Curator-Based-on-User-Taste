from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class TrainRequest(BaseModel):
    target_col: str = "playlist"
    feature_cols: List[str] = [
        "danceability", "energy", "key", "loudness", "mode",
        "speechiness", "acousticness", "instrumentalness", "liveness",
        "valence", "tempo"
    ]
    test_size: float = Field(0.2, ge=0.1, le=0.5)
    random_state: int = 42
    scaling: bool = True
    selected_models: Optional[List[str]] = [
        "Logistic Regression",
        "K-Nearest Neighbors",
        "Random Forest",
        "SVM (RBF)",
        "Neural Network"
    ]

class PredictRequest(BaseModel):
    features: Dict[str, float] = Field(
        default_factory=lambda: {
            "danceability": 0.72,
            "energy": 0.81,
            "key": 5.0,
            "loudness": -5.2,
            "mode": 1.0,
            "speechiness": 0.04,
            "acousticness": 0.08,
            "instrumentalness": 0.00,
            "liveness": 0.12,
            "valence": 0.75,
            "tempo": 128.0
        }
    )
    track_id: Optional[str] = None

class RecommendRequest(BaseModel):
    features: Optional[Dict[str, float]] = None
    seed_track_id: Optional[str] = None
    top_n: int = Field(5, ge=1, le=20)
