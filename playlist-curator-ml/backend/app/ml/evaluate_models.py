import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from typing import Dict, Any, List

def evaluate_classifier(
    model,
    X_test: np.ndarray,
    y_test: np.ndarray,
    class_names: List[str]
) -> Dict[str, Any]:
    y_pred = model.predict(X_test)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    
    cm = confusion_matrix(y_test, y_pred)
    
    report_dict = classification_report(
        y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0
    )

    per_playlist = []
    for cls in class_names:
        if cls in report_dict:
            stats = report_dict[cls]
            per_playlist.append({
                "playlist": cls,
                "precision": round(float(stats.get("precision", 0.0)), 4),
                "recall": round(float(stats.get("recall", 0.0)), 4),
                "f1_score": round(float(stats.get("f1-score", 0.0)), 4),
                "support": int(stats.get("support", 0))
            })

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm.tolist(),
        "class_names": class_names,
        "per_playlist_metrics": per_playlist,
        "classification_report": report_dict
    }
