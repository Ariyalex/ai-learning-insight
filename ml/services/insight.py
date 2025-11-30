from typing import Dict, Tuple

from .db import get_connection

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

def upsert_process_ml_user(data: dict):
    """
    Insert atau update otomatis berdasarkan developer_id.
    Return:
        "insert" jika data baru
        "update" jika data sudah ada dan diperbarui
    """

    conn = get_connection()
    try:
        with conn.cursor() as cur:

            cur.execute(f"""SELECT user_id FROM insights WHERE user_id = %s""", (data["user_id"],))

            exists = cur.fetchone() is not None

            if not exists:
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
                return "insert"

            else:
                # -----------------------
                # UPDATE DATA
                # -----------------------
                cur.execute(f"""
                    UPDATE insights
                    SET
                        total_materials_opened = %(total_materials_opened)s,
                        total_active_days = %(total_active_days)s,
                        total_completed = %(total_completed)s,
                        avg_submission_rating = %(avg_submission_rating)s,
                        avg_submission_duration = %(avg_submission_duration)s,
                        total_study_duration = %(total_study_duration)s,
                        avg_completion_rating = %(avg_completion_rating)s,
                        avg_exam_score = %(avg_exam_score)s,
                        exam_pass_rate = %(exam_pass_rate)s,
                        exam_count = %(exam_count)s,
                        cluster = %(cluster)s,
                        cluster_label = %(cluster_label)s,
                        activity_score = %(activity_score)s,
                        academic_score = %(academic_score)s,
                        activity_insight = %(activity_insight)s,
                        academic_insight = %(academic_insight)s,
                        cluster_label_k = %(cluster_label_k)s,
                        activity_insight_k = %(activity_insight_k)s,
                        academic_insight_k = %(academic_insight_k)s
                    WHERE user_id = %(user_id)s
                """, data)

                conn.commit()
                return "update"

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        conn.close()