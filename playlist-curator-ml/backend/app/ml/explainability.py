import numpy as np
from sklearn.inspection import permutation_importance
from typing import Dict, Any, List

def compute_feature_importance(
    model,
    X_val: np.ndarray,
    y_val: np.ndarray,
    feature_names: List[str]
) -> List[Dict[str, Any]]:
    importances = []
    
    # Tree native importance
    if hasattr(model, "feature_importances_"):
        raw_imp = model.feature_importances_
        for name, val in zip(feature_names, raw_imp):
            importances.append({"feature": name, "importance": round(float(val), 4)})
    # Linear coefficients magnitude
    elif hasattr(model, "coef_"):
        raw_imp = np.mean(np.abs(model.coef_), axis=0)
        norm_imp = raw_imp / np.sum(raw_imp) if np.sum(raw_imp) > 0 else raw_imp
        for name, val in zip(feature_names, norm_imp):
            importances.append({"feature": name, "importance": round(float(val), 4)})
    # Permutation importance fallback
    else:
        try:
            r = permutation_importance(model, X_val, y_val, n_repeats=5, random_state=42)
            raw_imp = r.importances_mean
            raw_imp = np.clip(raw_imp, 0, None)
            norm_imp = raw_imp / np.sum(raw_imp) if np.sum(raw_imp) > 0 else raw_imp
            for name, val in zip(feature_names, norm_imp):
                importances.append({"feature": name, "importance": round(float(val), 4)})
        except Exception:
            # Fallback uniform
            for name in feature_names:
                importances.append({"feature": name, "importance": round(1.0 / len(feature_names), 4)})

    importances.sort(key=lambda x: x["importance"], reverse=True)
    return importances

def explain_prediction(
    predicted_playlist: str,
    feature_values: Dict[str, float],
    importances: List[Dict[str, Any]]
) -> Dict[str, Any]:
    top_features = importances[:4]
    
    insights = []
    for item in top_features:
        feat = item["feature"]
        val = feature_values.get(feat, 0.5)
        imp = item["importance"]
        
        desc = "moderate"
        if val > 0.7:
            desc = "high"
        elif val < 0.3:
            desc = "low"
            
        insights.append(f"{desc.capitalize()} {feat} ({val}) had a major influence ({round(imp * 100, 1)}% relative importance).")

    summary_text = f"The selected model classified this track into '{predicted_playlist}' primarily due to key characteristic audio features."

    return {
        "predicted_playlist": predicted_playlist,
        "summary": summary_text,
        "top_influencing_features": top_features,
        "key_insights": insights
    }
