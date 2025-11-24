from typing import Dict, Tuple

CLUSTER_LABELS = {
    0: "Fast Learner",
    1: "Consistent Learner",
    2: "Reflective Learner"
}

def compute_activity_academic_scores(feat: Dict[str, float]) -> Tuple[float, float]:
    activity_score = (
        feat["total_materials_opened"] * 0.3 +
        feat["total_active_days"] * 0.2 +
        feat["total_completed"] * 0.3 +
        feat["total_study_duration"] * 0.2
    )

    academic_score = (
        feat["avg_exam_score"] * 0.4 +
        feat["exam_pass_rate"] * 0.3 +
        feat["avg_submission_rating"] * 0.1
    )
    return activity_score, academic_score

def label_activity(activity_score: float) -> str:
    # Sementara: threshold statis, kamu bisa ganti pakai quantile global
    if activity_score > 0.66:
        return "Sangat Aktif & Konsisten"
    elif activity_score > 0.33:
        return "Cukup Aktif"
    else:
        return "Kurang Aktif"

def label_academic(academic_score: float) -> str:
    if academic_score > 0.66:
        return "Performa Akademik Tinggi"
    elif academic_score > 0.33:
        return "Performa Stabil"
    else:
        return "Performa Rendah"

def map_cluster_label(cluster_id: int) -> str:
    return CLUSTER_LABELS.get(cluster_id, "Unknown")
