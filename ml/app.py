from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv

from services.feature_engineering import get_features_for_user
from services.scaler import to_feature_vector, robust_scale
from services.predictor import predictor
from services.insight import (
    compute_activity_academic_scores,
    label_activity,
    label_academic,
    map_cluster_label,
    upsert_process_ml_user
)

load_dotenv(dotenv_path=".env")

gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY", "your_api_key_here"))

# ============================================================
# SAFE WRAPPER LLM → fallback kalau Gemini error
# ============================================================
def safe_generate(prompt: str, fallback: str):
    try:
        res = gemini.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        text = res.text.strip() if res.text else None
        return text or fallback
    except Exception as e:
        print(f"[LLM ERROR] {e}")
        return fallback


# ============================================================
# FALLBACK RULE-BASED
# ============================================================

# Cluster fallback
FALLBACK_CLUSTER = {
    "Fast Learner": "Kamu belajar dengan cepat dan efektif. Progresmu kuat dan stabil!",
    "Consistent Learner": "Kamu punya ritme belajar yang stabil dan terus berkembang!",
    "Reflective Learner": "Kamu belajar dengan mendalam dan perlahan. Tingkatkan konsistensi sedikit demi sedikit!"
}

# Activity fallback
FALLBACK_ACTIVITY = {
    "Sangat Aktif & Konsisten": "Aktivitas belajarmu sangat tinggi dan stabil. Pertahankan ritmemu ya!",
    "Cukup Aktif": "Kamu cukup aktif dan berkembang stabil. Tingkatkan sedikit lagi biar makin optimal!",
    "Kurang Aktif": "Aktivitas belajarmu masih rendah. Coba tambah frekuensi belajar sedikit demi sedikit ya!"
}

# Academic fallback
FALLBACK_ACADEMIC = {
    "Performa Akademik Tinggi": "Performa akademikmu sangat baik dan pemahamanmu terlihat kuat!",
    "Performa Stabil": "Performa akademikmu stabil dan terus menunjukkan peningkatan!",
    "Performa Rendah": "Performa akademikmu masih perlu ditingkatkan. Perbanyak latihan soal ya!"
}


# ============================================================
# FASTAPI SETUP
# ============================================================
app = FastAPI(
    title="AI Learning Insight ML Service",
    version="1.0.0",
    description="Microservice untuk clustering tipe belajar + insight tambahan."
)

class ProsesRequest(BaseModel):
    developer_id: str | int

class ProsesResponse(BaseModel):
    success: bool
    status: int
    message: str
    developer_id: str | int
    clusters_label_k: str | None = None
    activitys_insight_k: str | None = None
    academics_insight_k: str | None = None


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ============================================================
# ENDPOINT UTAMA
# ============================================================
@app.post("/proses/insight", response_model=ProsesResponse)
def check(req: ProsesRequest):
    dev_id = req.developer_id

    try:
        # ======================
        # 1. Ambil fitur
        # ======================
        feat = get_features_for_user(dev_id)

        # ======================
        # 2. Predict cluster
        # ======================
        cluster_id = predictor.predict_dict(feat)
        cluster_name = map_cluster_label(cluster_id)

        # ======================
        # 3. Hitung activity & academic score
        # ======================
        activity_score, academic_score = compute_activity_academic_scores(feat)
        activity_type = label_activity(activity_score)
        academic_type = label_academic(academic_score)

        # ======================================================
        # 4. PROMPT LLM — Cluster Insight
        # ======================================================
        prompt_cluster_label_k = f"""
        Buatkan insight pembelajaran berdasarkan cluster berikut:

        Cluster: {cluster_name}
        Data user:
        - total_completed = {feat["total_completed"]}
        - avg_submission_rating = {feat["avg_submission_rating"]}
        - exam_pass_rate = {feat["exam_pass_rate"]}

        Buat 1 paragraf pendek (maks 25 kata), friendly, natural, dan mudah dipahami.
        Gunakan maksimal dua angka yang masuk akal.
        """

        cluster_label_k = safe_generate(
            prompt_cluster_label_k,
            fallback=FALLBACK_CLUSTER.get(cluster_name, "Kamu menunjukkan pola belajar yang stabil dan berkembang!")
        )

        # ======================================================
        # 5. PROMPT LLM — Activity Insight
        # ======================================================
        prompt_activity_insight_k = f"""
        Buatkan insight aktivitas belajar:

        - total_materials_opened = {feat["total_materials_opened"]}
        - total_completed = {feat["total_completed"]}
        - total_study_duration = {feat["total_study_duration"]}

        Buat kalimat maksimal 25 kata, positif, wajar, dan tidak kaku.
        Ubah angka besar menjadi format manusiawi seperti 'puluhan' atau 'jam'.
        """

        activity_insight_k = safe_generate(
            prompt_activity_insight_k,
            fallback=FALLBACK_ACTIVITY.get(activity_type, "Aktivitas belajarmu cukup baik. Tingkatkan sedikit demi sedikit ya!")
        )

        # ======================================================
        # 6. PROMPT LLM — Academic Insight
        # ======================================================
        prompt_academic_insight_k = f"""
        Buatkan insight akademik:

        - avg_exam_score = {feat["avg_exam_score"]}
        - exam_pass_rate = {feat["exam_pass_rate"]}
        - avg_submission_rating = {feat["avg_submission_rating"]}

        Buat 1 kalimat (maks 25 kata), ringan dan membangun.
        Gunakan hanya satu angka utama.
        """

        academic_insight_k = safe_generate(
            prompt_academic_insight_k,
            fallback=FALLBACK_ACADEMIC.get(academic_type, "Performa akademikmu berkembang stabil. Pertahankan ya!")
        )

        # ======================================================
        # 7. PERSIAPAN DATA UNTUK DATABASE
        # ======================================================
        data_for_db = {
            "user_id": dev_id,
            "total_materials_opened": feat["total_materials_opened"],
            "total_active_days": feat["total_active_days"],
            "total_completed": feat["total_completed"],
            "avg_submission_rating": feat["avg_submission_rating"],
            "avg_submission_duration": feat["avg_submission_duration"],
            "total_study_duration": feat["total_study_duration"],
            "avg_completion_rating": feat["avg_completion_rating"],
            "avg_exam_score": feat["avg_exam_score"],
            "exam_pass_rate": feat["exam_pass_rate"],
            "exam_count": feat["exam_count"],
            "cluster": cluster_id,
            "cluster_label": cluster_name,
            "activity_score": activity_score,
            "academic_score": academic_score,
            "activity_insight": activity_type,
            "academic_insight": academic_type,
            "cluster_label_k": cluster_label_k,
            "activity_insight_k": activity_insight_k,
            "academic_insight_k": academic_insight_k
        }

        # ======================================================
        # 8. INSERT / UPDATE KE DATABASE
        # ======================================================
        action = upsert_process_ml_user(data_for_db)

        return ProsesResponse(
            success=True,
            status=200,
            message=action,
            developer_id=dev_id,
            clusters_label_k=cluster_label_k,
            activitys_insight_k=activity_insight_k,
            academics_insight_k=academic_insight_k
        )

    except Exception as e:
        return ProsesResponse(
            success=False,
            status=500,
            message=f"Terjadi kesalahan: {str(e)}",
            developer_id=dev_id
        )
