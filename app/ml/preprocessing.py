import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from typing import Dict, Any, Tuple, List

class DataPreprocessor:
    def __init__(self, scaling: bool = True):
        self.scaling = scaling
        self.scaler = StandardScaler() if scaling else None
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        self.target_col = "playlist"
        self.classes_ = []

    def prepare_data(
        self,
        df: pd.DataFrame,
        feature_cols: List[str],
        target_col: str = "playlist",
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict[str, Any]:
        self.feature_names = feature_cols
        self.target_col = target_col
        
        # Clean dataframe
        clean_df = df.dropna(subset=feature_cols + [target_col]).copy()

        X = clean_df[feature_cols].values
        y_raw = clean_df[target_col].values

        # Encode target classes
        y_encoded = self.label_encoder.fit_transform(y_raw)
        self.classes_ = list(self.label_encoder.classes_)

        # Train / Test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
        )

        # Scaling: IMPORTANT - fit ONLY on train set to prevent data leakage!
        if self.scaling:
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
        else:
            X_train_scaled = X_train
            X_test_scaled = X_test

        return {
            "X_train": X_train_scaled,
            "X_test": X_test_scaled,
            "y_train": y_train,
            "y_test": y_test,
            "X_train_unscaled": X_train,
            "X_test_unscaled": X_test,
            "scaler": self.scaler,
            "label_encoder": self.label_encoder,
            "classes": self.classes_,
            "feature_names": self.feature_names,
            "target_col": self.target_col
        }

    def transform_single_sample(self, sample_dict: Dict[str, float]) -> np.ndarray:
        # Extract features in exact order
        vec = []
        for col in self.feature_names:
            val = sample_dict.get(col, 0.0)
            vec.append(float(val))
        
        arr = np.array(vec).reshape(1, -1)
        if self.scaling and self.scaler is not None:
            arr = self.scaler.transform(arr)
        return arr
