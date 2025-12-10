from typing import Dict, Tuple

from .db import get_connection

import json
import os

# Load quantile dari file
BASE_DIR = os.path.dirname(__file__)
QUANTILE_PATH = os.path.join(BASE_DIR, "quantiles.json")

with open(QUANTILE_PATH, "r") as f:
    Q = json.load(f)

CLUSTER_LABELS = {
    0: "Reflective Learner",
    1: "Consistent Learner",
    2: "Fast Learner",
}

def compute_activity_academic_scores(feat: Dict[str, float]) -> Tuple[float, float]:
    # Normalisasi EXACT seperti notebook
    exam_score_norm = feat["avg_exam_score"] / 100
    pass_rate_norm = feat["exam_pass_rate"]  # sudah 0–1
    submit_rating_norm = feat["avg_submission_rating"] / 100  # penting!

    activity_score = (
        feat["total_materials_opened"] * 0.3 +
        feat["total_active_days"] * 0.2 +
        feat["total_completed"] * 0.3 +
        feat["total_study_duration"] * 0.2
    )

    academic_score = (
        exam_score_norm * 0.4 +
        pass_rate_norm * 0.3 +
        submit_rating_norm * 0.1
    )

    return activity_score, academic_score

def label_activity(score: float) -> str:
    q33 = Q["activity"]["q33"]
    q66 = Q["activity"]["q66"]

    if score > q66:
        return "Sangat Aktif & Konsisten"
    elif score > q33:
        return "Cukup Aktif"
    else:
        return "Kurang Aktif"

def label_academic(score: float) -> str:
    q33 = Q["academic"]["q33"]
    q66 = Q["academic"]["q66"]

    if score > q66:
        return "Performa Akademik Tinggi"
    elif score > q33:
        return "Performa Stabil"
    else:
        return "Performa Rendah"

def map_cluster_label(cluster_id: int) -> str:
    return CLUSTER_LABELS.get(cluster_id, "Unknown")

def upsert_process_ml_user(data: dict):
    """
    Insert
    Return:
        "Insight berhasil disimpan."
    """

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # -----------------------
            # INSERT BARU
            # -----------------------
            cur.execute(f"""
                INSERT INTO insights (
                    user_id,
                    total_materials_opened,
                    total_active_days,
                    total_completed,
                    avg_submission_rating,
                    avg_submission_duration,
                    total_study_duration,
                    avg_completion_rating,
                    avg_exam_score,
                    exam_pass_rate,
                    exam_count,
                    cluster,
                    cluster_label,
                    activity_score,
                    academic_score,
                    activity_insight,
                    academic_insight,
                    cluster_label_k,
                    activity_insight_k,
                    academic_insight_k
                )
                VALUES (
                    %(user_id)s,
                    %(total_materials_opened)s,
                    %(total_active_days)s,
                    %(total_completed)s,
                    %(avg_submission_rating)s,
                    %(avg_submission_duration)s,
                    %(total_study_duration)s,
                    %(avg_completion_rating)s,
                    %(avg_exam_score)s,
                    %(exam_pass_rate)s,
                    %(exam_count)s,
                    %(cluster)s,
                    %(cluster_label)s,
                    %(activity_score)s,
                    %(academic_score)s,
                    %(activity_insight)s,
                    %(academic_insight)s,
                    %(cluster_label_k)s,
                    %(activity_insight_k)s,
                    %(academic_insight_k)s
                )
            """, data)

            conn.commit()
            return "Insight berhasil disimpan."

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        conn.close()
