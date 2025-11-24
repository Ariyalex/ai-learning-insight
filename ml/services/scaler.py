import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Any

BASE_DIR = Path(__file__).resolve().parent.parent
SCALER_PATH = BASE_DIR / "configs" / "scaler_params.json"

with open(SCALER_PATH, "r") as f:
    scaler_cfg = json.load(f)

FEATURE_ORDER: List[str] = scaler_cfg["feature_order"]
MEDIAN = np.array(scaler_cfg["median"], dtype="float32")
IQR = np.array(scaler_cfg["iqr"], dtype="float32")
SAFE_IQR = np.where(IQR == 0, 1.0, IQR)

def to_feature_vector(feat: Dict[str, Any]) -> np.ndarray:
    """Urutkan fitur sesuai FEATURE_ORDER."""
    return np.array([feat.get(name, 0.0) for name in FEATURE_ORDER], dtype="float32")

def robust_scale(x: np.ndarray) -> np.ndarray:
    return (x - MEDIAN) / SAFE_IQR
