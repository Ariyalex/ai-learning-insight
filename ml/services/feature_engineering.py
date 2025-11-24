from typing import Dict, Any
from .db import get_connection

def get_features_for_user(developer_id: str) -> Dict[str, float]:
    """
    Mengambil 10 fitur perilaku belajar untuk 1 user berdasarkan developer_id.
    Sudah disesuaikan agar sesuai dengan fitur final pada model KMeans.
    """

    sql = """
    WITH 
    t AS (
        SELECT 
            developer_id,
            COUNT(tutorial_id) AS total_materials_opened,
            COUNT(first_opened_at) AS total_active_days,
            COUNT(completed_at) FILTER (WHERE completed_at IS NOT NULL) AS total_completed
        FROM developer_journey_trackings
        WHERE developer_id = %s
        GROUP BY developer_id
    ),
    s AS (
        SELECT 
            submitter_id AS developer_id,
            AVG(submission_duration) AS avg_submission_duration,
            AVG(rating) AS avg_submission_rating
        FROM developer_journey_submissions
        WHERE submitter_id = %s
        GROUP BY submitter_id
    ),
    c AS (
        SELECT 
            user_id AS developer_id,
            SUM(study_duration) AS total_study_duration,
            AVG(avg_submission_rating) AS avg_completion_rating
        FROM developer_journey_completions
        WHERE user_id = %s
        GROUP BY user_id
    ),
    e AS (
        SELECT 
            reg.examinees_id AS developer_id,
            AVG(er.score) AS avg_exam_score,
            AVG(er.is_passed::float) AS exam_pass_rate,
            COUNT(*) AS exam_count
        FROM exam_results er
        JOIN exam_registrations reg ON reg.id = er.exam_registration_id
        WHERE reg.examinees_id = %s
        GROUP BY reg.examinees_id
    )
    SELECT
        COALESCE(t.total_materials_opened, 0) AS total_materials_opened,
        COALESCE(t.total_active_days, 0) AS total_active_days,
        COALESCE(t.total_completed, 0) AS total_completed,
        COALESCE(s.avg_submission_duration, 0) AS avg_submission_duration,
        COALESCE(s.avg_submission_rating, 0) AS avg_submission_rating,
        COALESCE(c.total_study_duration, 0) AS total_study_duration,
        COALESCE(c.avg_completion_rating, 0) AS avg_completion_rating,
        COALESCE(e.avg_exam_score, 0) AS avg_exam_score,
        COALESCE(e.exam_pass_rate, 0) AS exam_pass_rate,
        COALESCE(e.exam_count, 0) AS exam_count
    FROM t
    FULL OUTER JOIN s 
        ON t.developer_id = s.developer_id
    FULL OUTER JOIN c 
        ON COALESCE(t.developer_id, s.developer_id) = c.developer_id
    FULL OUTER JOIN e 
        ON COALESCE(t.developer_id, s.developer_id, c.developer_id) = e.developer_id
    LIMIT 1;
    """

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (developer_id, developer_id, developer_id, developer_id))
            row = cur.fetchone()

            # user benar-benar belum punya data
            if row is None:
                return {
                    "total_materials_opened": 0,
                    "total_active_days": 0,
                    "total_completed": 0,
                    "avg_submission_duration": 0,
                    "avg_submission_rating": 0,
                    "total_study_duration": 0,
                    "avg_completion_rating": 0,
                    "avg_exam_score": 0,
                    "exam_pass_rate": 0,
                    "exam_count": 0
                }

            cols = [
                "total_materials_opened",
                "total_active_days",
                "total_completed",
                "avg_submission_duration",
                "avg_submission_rating",
                "total_study_duration",
                "avg_completion_rating",
                "avg_exam_score",
                "exam_pass_rate",
                "exam_count"
            ]

            # convert semua value ke float (POSTGRES biasanya mengembalikan Decimal)
            data = dict(zip(cols, row))
            # convert Decimal → float
            data = {k: float(v) for k, v in data.items()}

            return data

    finally:
        conn.close()
