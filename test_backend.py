from fastapi.testclient import TestClient
from app.main import app

def test_all_endpoints():
    print("Testing backend API endpoints...")
    with TestClient(app) as client:
        # 1. Health
        r = client.get("/api/health")
        assert r.status_code == 200, f"Health error: {r.text}"
        print("[PASS] GET /api/health passed:", r.json())

        # 2. Config
        r = client.get("/api/config")
        assert r.status_code == 200
        print("[PASS] GET /api/config passed:", r.json())

        # 3. Dataset Summary
        r = client.get("/api/dataset/summary")
        assert r.status_code == 200
        print("[PASS] GET /api/dataset/summary passed:", r.json().get("total_songs"), "songs")

        # 4. Dataset Preview
        r = client.get("/api/dataset/preview?page=1&page_size=5")
        assert r.status_code == 200
        print("[PASS] GET /api/dataset/preview passed:", len(r.json().get("data")), "rows")

        # 5. EDA Playlist Distribution
        r = client.get("/api/eda/playlist-distribution")
        assert r.status_code == 200
        print("[PASS] GET /api/eda/playlist-distribution passed:", len(r.json().get("distribution")), "playlists")

        # 6. EDA Correlation
        r = client.get("/api/eda/correlation")
        assert r.status_code == 200
        print("[PASS] GET /api/eda/correlation passed")

        # 7. EDA PCA
        r = client.get("/api/eda/pca?max_samples=100")
        assert r.status_code == 200
        print("[PASS] GET /api/eda/pca passed")

        # 8. Model Comparison
        r = client.get("/api/models/comparison")
        assert r.status_code == 200
        print("[PASS] GET /api/models/comparison passed:", r.json().get("best_model"))

        # 9. Predict Playlist
        pred_payload = {
            "features": {
                "danceability": 0.72,
                "energy": 0.81,
                "loudness": -5.2,
                "speechiness": 0.04,
                "acousticness": 0.08,
                "instrumentalness": 0.00,
                "liveness": 0.12,
                "valence": 0.75,
                "tempo": 128,
                "key": 5
            }
        }
        r = client.post("/api/predict", json=pred_payload)
        assert r.status_code == 200
        print("[PASS] POST /api/predict passed:", r.json().get("prediction", {}).get("predicted_playlist"), r.json().get("prediction", {}).get("confidence_percentage"))

        # 10. Recommend
        r = client.post("/api/recommend", json={"features": pred_payload["features"], "top_n": 5})
        assert r.status_code == 200
        print("[PASS] POST /api/recommend passed:", len(r.json().get("recommendations")), "recommendations")

        # 11. Model Insights
        r = client.get("/api/model/insights")
        assert r.status_code == 200
        print("[PASS] GET /api/model/insights passed")

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all_endpoints()
