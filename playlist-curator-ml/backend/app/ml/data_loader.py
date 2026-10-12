import pandas as pd
import numpy as np
import os
from typing import Dict, Any, Tuple, List

EXPECTED_AUDIO_FEATURES = [
    "danceability", "energy", "key", "loudness", "mode",
    "speechiness", "acousticness", "instrumentalness", "liveness",
    "valence", "tempo"
]

DEFAULT_TARGET = "playlist"

class DataLoader:
    def __init__(self, filepath: str = None):
        self.filepath = filepath
        self.df = None
        if filepath and os.path.exists(filepath):
            self.load_data(filepath)

    def load_data(self, filepath: str) -> pd.DataFrame:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset file not found at {filepath}")
        
        self.filepath = filepath
        self.df = pd.read_csv(filepath)
        return self.df

    def validate_dataset(self, target_col: str = DEFAULT_TARGET) -> Tuple[bool, List[str]]:
        if self.df is None or self.df.empty:
            return False, ["Dataset is empty or not loaded."]
        
        missing_cols = []
        # Check target
        if target_col not in self.df.columns:
            missing_cols.append(f"Target column '{target_col}' missing.")

        # Check numerical audio features
        available_numeric = [col for col in EXPECTED_AUDIO_FEATURES if col in self.df.columns]
        if len(available_numeric) < 3:
            missing_cols.append(f"At least 3 audio features required. Found: {available_numeric}")

        return len(missing_cols) == 0, missing_cols

    def get_column_types(self) -> Dict[str, List[str]]:
        if self.df is None:
            return {"numerical": [], "categorical": [], "target": []}
        
        numeric_cols = list(self.df.select_dtypes(include=[np.number]).columns)
        categorical_cols = list(self.df.select_dtypes(include=['object', 'category']).columns)
        return {
            "numerical": numeric_cols,
            "categorical": categorical_cols
        }

    def get_summary(self, target_col: str = DEFAULT_TARGET) -> Dict[str, Any]:
        if self.df is None:
            return {}
        
        num_rows, num_cols = self.df.shape
        numeric_cols = list(self.df.select_dtypes(include=[np.number]).columns)
        categorical_cols = list(self.df.select_dtypes(include=['object', 'category']).columns)
        
        playlists = []
        playlist_counts = {}
        if target_col in self.df.columns:
            playlists = list(self.df[target_col].dropna().unique())
            playlist_counts = self.df[target_col].value_counts().to_dict()

        missing_values = int(self.df.isnull().sum().sum())
        duplicate_rows = int(self.df.duplicated().sum())

        audio_features = [col for col in EXPECTED_AUDIO_FEATURES if col in self.df.columns]

        return {
            "total_songs": num_rows,
            "total_columns": num_cols,
            "num_playlists": len(playlists),
            "playlists": playlists,
            "playlist_distribution": playlist_counts,
            "audio_features": audio_features,
            "num_audio_features": len(audio_features),
            "numerical_features": numeric_cols,
            "categorical_features": categorical_cols,
            "missing_values": missing_values,
            "duplicate_rows": duplicate_rows
        }

    def get_preview(self, page: int = 1, page_size: int = 20, search: str = "") -> Dict[str, Any]:
        if self.df is None:
            return {"data": [], "total": 0, "page": page, "page_size": page_size}

        data_df = self.df.copy()
        if search:
            search_str = str(search).lower()
            mask = data_df.apply(lambda row: row.astype(str).str.lower().str.contains(search_str).any(), axis=1)
            data_df = data_df[mask]

        total_records = len(data_df)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        paginated_df = data_df.iloc[start_idx:end_idx].fillna("")
        records = paginated_df.to_dict(orient="records")
        for rec in records:
            audio_url = None
            audio_available = False
            for key in ["audio_url", "preview_url", "audio", "sample_url"]:
                if key in rec and rec[key] and str(rec[key]).strip():
                    url_candidate = str(rec[key]).strip()
                    if url_candidate.startswith("http://") or url_candidate.startswith("https://") or url_candidate.startswith("/"):
                        audio_url = url_candidate
                        audio_available = True
                        break
            
            external_url = None
            for key in ["spotify_url", "track_url", "external_url", "uri"]:
                if key in rec and rec[key] and str(rec[key]).strip():
                    url_candidate = str(rec[key]).strip()
                    if url_candidate.startswith("http://") or url_candidate.startswith("https://"):
                        external_url = url_candidate
                        break

            rec["audio_available"] = audio_available
            rec["audio_url"] = audio_url
            rec["external_url"] = external_url
        
        return {
            "data": records,
            "columns": list(self.df.columns),
            "total": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": int(np.ceil(total_records / page_size)) if total_records > 0 else 1
        }
