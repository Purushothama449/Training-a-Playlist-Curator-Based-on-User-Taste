import os
import joblib
import json
import numpy as np
from typing import Dict, Any, List

class PlaylistPredictor:
    def __init__(self, model_dir: str = "trained_models"):
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.metadata = {}
        self.feature_names = []
        self.class_names = []
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self) -> bool:
        model_path = os.path.join(self.model_dir, "best_model.joblib")
        scaler_path = os.path.join(self.model_dir, "scaler.joblib")
        encoder_path = os.path.join(self.model_dir, "label_encoder.joblib")
        meta_path = os.path.join(self.model_dir, "metadata.json")

        if not (os.path.exists(model_path) and os.path.exists(encoder_path) and os.path.exists(meta_path)):
            self.is_loaded = False
            return False

        try:
            self.model = joblib.load(model_path)
            self.label_encoder = joblib.load(encoder_path)
            self.class_names = list(self.label_encoder.classes_)
            
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)

            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
            
            self.feature_names = self.metadata.get("feature_names", [])
            self.is_loaded = True
            return True
        except Exception as e:
            print(f"Error loading prediction artifacts: {e}")
            self.is_loaded = False
            return False

    def predict(self, feature_values: Dict[str, float]) -> Dict[str, Any]:
        if not self.is_loaded:
            loaded = self.load_artifacts()
            if not loaded:
                raise ValueError("No trained model artifacts available. Please train a model first.")

        # Build feature vector in exact order
        vec = []
        for feat in self.feature_names:
            val = feature_values.get(feat, 0.5)
            vec.append(float(val))

        arr = np.array(vec).reshape(1, -1)
        if self.scaler is not None:
            arr = self.scaler.transform(arr)

        pred_idx = self.model.predict(arr)[0]
        predicted_playlist = str(self.label_encoder.inverse_transform([pred_idx])[0])

        probs = None
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(arr)[0]
        elif hasattr(self.model, "decision_function"):
            df = self.model.decision_function(arr)[0]
            # Softmax on decision function for SVMS without direct proba
            exp_df = np.exp(df - np.max(df))
            probs = exp_df / exp_df.sum()
        else:
            probs = np.zeros(len(self.class_names))
            probs[pred_idx] = 1.0

        top_predictions = []
        for i, p in enumerate(probs):
            cls_name = str(self.label_encoder.inverse_transform([i])[0])
            top_predictions.append({
                "playlist": cls_name,
                "probability": round(float(p), 4),
                "percentage": round(float(p) * 100, 1)
            })

        # Sort descending by probability
        top_predictions.sort(key=lambda x: x["probability"], reverse=True)
        best_prob = top_predictions[0]["probability"]

        return {
            "predicted_playlist": predicted_playlist,
            "confidence": round(float(best_prob), 4),
            "confidence_percentage": round(float(best_prob) * 100, 1),
            "model_used": self.metadata.get("best_model", "Selected Model"),
            "top_predictions": top_predictions[:5],
            "all_predictions": top_predictions
        }
