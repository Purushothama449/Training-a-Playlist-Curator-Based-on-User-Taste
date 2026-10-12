import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List

class PlaylistRecommender:
    def __init__(self, df: pd.DataFrame = None, feature_names: List[str] = None):
        self.df = df
        self.feature_names = feature_names if feature_names else [
            "danceability", "energy", "key", "loudness", "mode",
            "speechiness", "acousticness", "instrumentalness", "liveness",
            "valence", "tempo"
        ]
        self.scaler = StandardScaler()
        self.scaled_matrix = None
        if df is not None:
            self.fit(df)

    def fit(self, df: pd.DataFrame):
        self.df = df.copy()
        avail_features = [f for f in self.feature_names if f in self.df.columns]
        self.feature_names = avail_features

        X = self.df[self.feature_names].fillna(0).values
        self.scaled_matrix = self.scaler.fit_transform(X)

    def recommend_similar_songs(
        self,
        input_features: Dict[str, float] = None,
        seed_track_id: str = None,
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        if self.df is None or self.scaled_matrix is None:
            return []

        if seed_track_id and "track_id" in self.df.columns:
            matches = self.df[self.df["track_id"] == seed_track_id]
            if not matches.empty:
                seed_idx = matches.index[0]
                target_vector = self.scaled_matrix[seed_idx].reshape(1, -1)
            else:
                target_vector = self._vector_from_dict(input_features)
        elif input_features:
            target_vector = self._vector_from_dict(input_features)
        else:
            # Default fallback: mean of dataset
            target_vector = np.mean(self.scaled_matrix, axis=0).reshape(1, -1)

        sim_scores = cosine_similarity(target_vector, self.scaled_matrix)[0]

        # Add scores to dataframe copy
        df_copy = self.df.copy()
        df_copy["similarity_score"] = sim_scores

        if seed_track_id and "track_id" in df_copy.columns:
            df_copy = df_copy[df_copy["track_id"] != seed_track_id]

        top_tracks = df_copy.sort_values(by="similarity_score", ascending=False).head(top_n)

        recommendations = []
        for _, row in top_tracks.iterrows():
            score = float(row["similarity_score"])
            pct = int(np.clip(round(score * 100), 1, 99))
            
            # Check for playable audio preview URL in dataset row
            audio_url = None
            audio_available = False
            for key in ["audio_url", "preview_url", "audio", "sample_url"]:
                if key in row and pd.notna(row[key]) and str(row[key]).strip():
                    url_candidate = str(row[key]).strip()
                    if url_candidate.startswith("http://") or url_candidate.startswith("https://") or url_candidate.startswith("/"):
                        audio_url = url_candidate
                        audio_available = True
                        break

            # Check for external song URL in dataset row
            external_url = None
            for key in ["spotify_url", "track_url", "external_url", "uri"]:
                if key in row and pd.notna(row[key]) and str(row[key]).strip():
                    url_candidate = str(row[key]).strip()
                    if url_candidate.startswith("http://") or url_candidate.startswith("https://"):
                        external_url = url_candidate
                        break

            rec = {
                "track_id": str(row.get("track_id", "")),
                "track_name": str(row.get("track_name", "Unknown Track")),
                "artist_name": str(row.get("artist_name", "Unknown Artist")),
                "genre": str(row.get("genre", "")),
                "playlist": str(row.get("playlist", "")),
                "similarity_score": round(score, 4),
                "similarity_percentage": f"{pct}%",
                "audio_available": audio_available,
                "audio_url": audio_url,
                "external_url": external_url,
                "features": {f: float(row[f]) for f in self.feature_names if f in row}
            }
            recommendations.append(rec)

        return recommendations

    def _vector_from_dict(self, input_features: Dict[str, float]) -> np.ndarray:
        vec = []
        for f in self.feature_names:
            val = input_features.get(f, 0.5) if input_features else 0.5
            vec.append(float(val))
        arr = np.array(vec).reshape(1, -1)
        return self.scaler.transform(arr)
