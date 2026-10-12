import time
import os
import joblib
import json
import numpy as np
from typing import Dict, Any, List
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import cross_val_score

from app.ml.evaluate_models import evaluate_classifier

MODEL_FACTORY = {
    "Logistic Regression": lambda random_state=42: LogisticRegression(max_iter=1000, random_state=random_state),
    "K-Nearest Neighbors": lambda random_state=42: KNeighborsClassifier(n_neighbors=5),
    "Random Forest": lambda random_state=42: RandomForestClassifier(n_estimators=100, random_state=random_state),
    "SVM (RBF)": lambda random_state=42: SVC(kernel="rbf", probability=True, C=1.0, random_state=random_state),
    "Neural Network": lambda random_state=42: MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=random_state)
}

class ModelTrainer:
    def __init__(self, output_dir: str = "trained_models"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.trained_models = {}
        self.model_results = {}
        self.best_model_name = None

    def train_and_eval_all(
        self,
        X_train: np.ndarray,
        X_test: np.ndarray,
        y_train: np.ndarray,
        y_test: np.ndarray,
        class_names: List[str],
        feature_names: List[str],
        selected_models: List[str] = None,
        scaler = None,
        label_encoder = None,
        random_state: int = 42
    ) -> Dict[str, Any]:
        if not selected_models:
            selected_models = list(MODEL_FACTORY.keys())

        self.model_results = {}
        self.trained_models = {}

        best_score = -1.0
        self.best_model_name = None

        for name in selected_models:
            if name not in MODEL_FACTORY:
                continue
            
            clf = MODEL_FACTORY[name](random_state=random_state)
            
            start_time = time.time()
            clf.fit(X_train, y_train)
            train_time = round(time.time() - start_time, 3)

            # 5-fold Cross Validation on training set
            cv_scores = cross_val_score(clf, X_train, y_train, cv=min(5, max(2, len(np.unique(y_train)))))
            cv_mean = round(float(np.mean(cv_scores)), 4)
            cv_std = round(float(np.std(cv_scores)), 4)

            # Evaluation on test set
            eval_metrics = evaluate_classifier(clf, X_test, y_test, class_names)
            eval_metrics["training_time"] = train_time
            eval_metrics["cv_mean"] = cv_mean
            eval_metrics["cv_std"] = cv_std

            self.trained_models[name] = clf
            self.model_results[name] = eval_metrics

            # Determine best model based on F1 / Accuracy
            score = eval_metrics["accuracy"]
            if score > best_score:
                best_score = score
                self.best_model_name = name

        # Save artifacts to trained_models
        if self.best_model_name:
            self.save_artifacts(scaler, label_encoder, feature_names, class_names)

        return {
            "models": self.model_results,
            "best_model": self.best_model_name,
            "best_accuracy": best_score,
            "trained_count": len(self.trained_models)
        }

    def save_artifacts(self, scaler, label_encoder, feature_names: List[str], class_names: List[str]):
        # Save best model
        best_clf = self.trained_models[self.best_model_name]
        joblib.dump(best_clf, os.path.join(self.output_dir, "best_model.joblib"))
        
        # Save all trained models
        for name, clf in self.trained_models.items():
            filename = name.lower().replace(" ", "_").replace("(", "").replace(")", "") + ".joblib"
            joblib.dump(clf, os.path.join(self.output_dir, filename))

        if scaler:
            joblib.dump(scaler, os.path.join(self.output_dir, "scaler.joblib"))
        if label_encoder:
            joblib.dump(label_encoder, os.path.join(self.output_dir, "label_encoder.joblib"))

        metadata = {
            "best_model": self.best_model_name,
            "feature_names": feature_names,
            "class_names": class_names,
            "results": self.model_results
        }
        with open(os.path.join(self.output_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
