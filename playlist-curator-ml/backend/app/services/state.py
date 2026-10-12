import os
import pandas as pd
from typing import Dict, Any
from app.ml.data_loader import DataLoader
from app.ml.preprocessing import DataPreprocessor
from app.ml.train_models import ModelTrainer
from app.ml.predictor import PlaylistPredictor
from app.ml.recommender import PlaylistRecommender

class AppState:
    def __init__(self):
        self.data_loader = DataLoader()
        self.preprocessor = DataPreprocessor(scaling=True)
        self.model_trainer = ModelTrainer(output_dir="trained_models")
        self.predictor = PlaylistPredictor(model_dir="trained_models")
        self.recommender = PlaylistRecommender()
        self.is_trained = False
        self.last_train_results = {}
        self.dataset_path = None

    def initialize_default_dataset(self):
        candidate_paths = [
            os.path.join("data", "raw", "spotify_playlists.csv"),
            os.path.join("backend", "data", "raw", "spotify_playlists.csv"),
            os.path.join("datasets", "spotify_playlists.csv"),
            os.path.join("..", "datasets", "spotify_playlists.csv")
        ]
        default_csv = None
        for path in candidate_paths:
            if os.path.exists(path):
                default_csv = path
                break
        
        if os.path.exists(default_csv):
            try:
                self.dataset_path = default_csv
                self.data_loader.load_data(default_csv)
                self.recommender.fit(self.data_loader.df)
                print(f"Loaded default dataset from {default_csv} ({len(self.data_loader.df)} songs)")
                
                # Check if model artifacts already exist, if not train default
                if not self.predictor.is_loaded:
                    print("No pre-trained model found. Training initial models...")
                    self.train_default_models()
                else:
                    self.is_trained = True
            except Exception as e:
                print(f"Error initializing default dataset: {e}")

    def train_default_models(self):
        if self.data_loader.df is None or self.data_loader.df.empty:
            return

        feature_cols = [
            "danceability", "energy", "key", "loudness", "mode",
            "speechiness", "acousticness", "instrumentalness", "liveness",
            "valence", "tempo"
        ]
        avail_features = [f for f in feature_cols if f in self.data_loader.df.columns]

        data_dict = self.preprocessor.prepare_data(
            df=self.data_loader.df,
            feature_cols=avail_features,
            target_col="playlist",
            test_size=0.2,
            random_state=42
        )

        results = self.model_trainer.train_and_eval_all(
            X_train=data_dict["X_train"],
            X_test=data_dict["X_test"],
            y_train=data_dict["y_train"],
            y_test=data_dict["y_test"],
            class_names=data_dict["classes"],
            feature_names=avail_features,
            scaler=data_dict["scaler"],
            label_encoder=data_dict["label_encoder"]
        )

        self.last_train_results = results
        self.is_trained = True
        self.predictor.load_artifacts()
        print(f"Training complete! Best model: {results.get('best_model')} with {results.get('best_accuracy') * 100:.1f}% accuracy.")

app_state = AppState()
