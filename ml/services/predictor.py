import numpy as np
import json
import os

BASE_PATH = os.path.dirname(__file__)

class KMeansPredictor:
    def __init__(self):
        
        centroid_path = os.path.join(BASE_PATH, "..", "models", "centroids.npy")

        # === FIX ERROR .npy pickle ===
        self.centroids = np.load(centroid_path, allow_pickle=True).astype("float32")

        # Load scaler params
        with open(os.path.join(BASE_PATH, "..", "configs", "scaler_params.json")) as f:
            cfg = json.load(f)

        self.feature_order = cfg["feature_order"]
        self.median = np.array(cfg["median"], dtype="float32")
        self.iqr = np.array(cfg["iqr"], dtype="float32")

        # Avoid division by zero
        self.iqr[self.iqr == 0] = 1.0

    def scale(self, X):
        return (X - self.median) / self.iqr

    def predict_dict(self, feat_dict):
        """Predict berdasarkan dictionary fitur"""
        X = np.array([feat_dict[f] for f in self.feature_order], dtype="float32")
        X_scaled = self.scale(X)

        # hitung jarak ke centroid
        distances = np.sum((self.centroids - X_scaled) ** 2, axis=1)
        return int(np.argmin(distances))

# instance global
predictor = KMeansPredictor()
