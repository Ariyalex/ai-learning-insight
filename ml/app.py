from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv

from services.feature_engineering import get_features_for_user
from services.scaler import to_feature_vector, robust_scale
from services.predictor import predictor # sudah instance
from services.insight import (
    compute_activity_academic_scores,
    label_activity,
    label_academic,
    map_cluster_label,
    upsert_process_ml_user
)

load_dotenv(dotenv_path=".env")

gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY", "your_api_key_here"))

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

@app.post("/proses/insight", response_model=ProsesResponse)
def check(req: ProsesRequest):
    dev_id = req.developer_id
    try:
        # 1. Ambil fitur dari DB
        feat = get_features_for_user(dev_id)

        # 2. Predict cluster
        cluster_id = predictor.predict_dict(feat)

        # 3. Insight tambahan
        activity_score, academic_score = compute_activity_academic_scores(feat)
        activity_type = label_activity(activity_score)
        academic_type = label_academic(academic_score)

        prompt_cluster_label_k = f"""
        Buatkan insight pembelajaran berdasarkan cluster berikut:
        
        Cluster: {map_cluster_label(cluster_id)}
        Data user:
        - total_completed = {feat["total_completed"]}
        - avg_submission_rating = {feat["avg_submission_rating"]}
        - exam_pass_rate = {feat["exam_pass_rate"]}
        
        Buat insight *1 paragraf pendek (maks 25 kata)* dengan gaya friendly dan tidak kaku.
        Sertakan hanya 1–2 angka yang relevan (misalnya total materi selesai atau skor), jangan tampilkan angka yang terlalu besar atau * atau membingungkan.
        Fokus pada pola belajar, bukan statistik teknis.
        """

        respon_cluster_label_k = gemini.models.generate_content(
            model="gemini-2.5-flash",
                contents=prompt_cluster_label_k,
        )
        cluster_label_k = respon_cluster_label_k.text.strip()

        prompt_activity_insight_k = f"""
        Buatkan insight aktivitas belajar berdasarkan data berikut:
        
        Data aktivitas:
        - total_materials_opened = {feat["total_materials_opened"]}
        - total_completed = {feat["total_completed"]}
        - total_study_duration = {feat["total_study_duration"]}
        
        Buat kalimat singkat (maks 25 kata) dengan gaya positif.
        Gunakan angka yang wajar, misalnya:
        - Konversi durasi jadi jam atau menit
        - Jika materi lebih dari 50, ubah jadi "puluhan materi"
        - Jika > 200, ubah jadi "ratusan materi"
        Jangan pakai angka terlalu besar atau * atau tidak masuk akal bagi user.
        """

        respon_activity_insight_k = gemini.models.generate_content(
            model="gemini-2.5-flash",
                contents=prompt_activity_insight_k,
        )
        activity_insight_k = respon_activity_insight_k.text.strip()

        prompt_academic_insight_k = f"""
        Buatkan insight akademik berdasarkan data:
        
        Data akademik:
        - avg_exam_score = {feat["avg_exam_score"]}
        - exam_pass_rate = {feat["exam_pass_rate"]}
        - avg_submission_rating = {feat["avg_submission_rating"]}
        
        Tulis kalimat (maks 25 kata), ringan dan membangun.
        Gunakan 1 angka utama seperti rata-rata skor atau tingkat kelulusan.
        Hindari angka ekstrem atau * atau yang tidak penting untuk user.
        """

        respon_academic_insight_k = gemini.models.generate_content(
            model="gemini-2.5-flash",
                contents=prompt_academic_insight_k,
        )
        academic_insight_k = respon_academic_insight_k.text.strip()

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
            "cluster_label": map_cluster_label(cluster_id),
            "activity_score": activity_score,
            "academic_score": academic_score,
            "activity_insight": activity_type,
            "academic_insight": academic_type,
            "cluster_label_k": cluster_label_k,
            "activity_insight_k": activity_insight_k,
            "academic_insight_k": academic_insight_k
        }

        # 4. INSERT / UPDATE
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
