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
    map_cluster_label
)

load_dotenv(dotenv_path=".env")

gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY", "your_api_key_here"))

app = FastAPI(
    title="AI Learning Insight ML Service",
    version="1.0.0",
    description="Microservice untuk clustering tipe belajar + insight tambahan."
)

class InsightRequest(BaseModel):
    developer_id: str | int

class InsightResponse(BaseModel):
    developer_id: str | int
    learner_insight: str
    activity_insight: str
    academic_insight: str

class LearnerRequest(BaseModel):
    developer_id: str | int

class LearnerResponse(BaseModel):
    developer_id: str | int
    learner_type: str
    activity_type: str
    academic_type: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/check/insight", response_model=InsightResponse)
def insight(req: InsightRequest):
    dev_id = req.developer_id

    # 1. Ambil fitur dari DB
    feat = get_features_for_user(dev_id)

    # 2. Convert → scaling
    vec = to_feature_vector(feat)
    vec_scaled = robust_scale(vec)

    # 3. Predict cluster
    cluster_id = predictor.predict_dict(feat)

    # 4. Insight tambahan
    activity_score, academic_score = compute_activity_academic_scores(feat)
    activity_insight = label_activity(activity_score)
    academic_insight = label_academic(academic_score)

    prompt_learner_insight = f"""
    User ini ada di cluster {map_cluster_label(cluster_id)}.

    Tuliskan sebuah INSIGHT dalam SATU KALIMAT MAJEMUK yang padat, tidak lebih dari 15 KATA TOTAL.

    Format wajibnya adalah:
    [Karakter Belajar] + [Kekuatan Utama] + [Saran Belajar Paling Cocok]

    KETENTUAN SANGAT KETAT:
    Hasil harus HANYA SATU (1) kalimat.
    Total kata TIDAK BOLEH melebihi 15.
    Gunakan bahasa santai gen-z dan DILARANG KERAS membahas hal teknis ML.
    """

    learner_response = gemini.models.generate_content(
        model="gemini-2.5-flash",
            contents=prompt_learner_insight,
    )
    learner_insight_text = learner_response.text.strip()

    prompt_activity_insight = f"""
    User ini ada di cluster {activity_insight}.

    Tuliskan sebuah INSIGHT dalam SATU KALIMAT MAJEMUK yang padat, tidak lebih dari 15 KATA TOTAL.

    Format wajibnya adalah:
    [Karakter Belajar] + [Kekuatan Utama] + [Saran Belajar Paling Cocok]

    KETENTUAN SANGAT KETAT:
    Hasil harus HANYA SATU (1) kalimat.
    Total kata TIDAK BOLEH melebihi 15.
    Gunakan bahasa santai gen-z dan DILARANG KERAS membahas hal teknis ML.
    """
    
    activity_response = gemini.models.generate_content(
        model="gemini-2.5-flash",
            contents=prompt_activity_insight,
    )
    activity_insight_text = activity_response.text.strip()

    prompt_academic_insight = f"""
    User ini ada di cluster {academic_insight}.

    Tuliskan sebuah INSIGHT dalam SATU KALIMAT MAJEMUK yang padat, tidak lebih dari 15 KATA TOTAL.

    Format wajibnya adalah:
    [Karakter Belajar] + [Kekuatan Utama] + [Saran Belajar Paling Cocok]

    KETENTUAN SANGAT KETAT:
    Hasil harus HANYA SATU (1) kalimat.
    Total kata TIDAK BOLEH melebihi 15.
    Gunakan bahasa santai gen-z dan DILARANG KERAS membahas hal teknis ML.
    """

    academic_response = gemini.models.generate_content(
        model="gemini-2.5-flash",
            contents=prompt_academic_insight,
    )
    academic_insight_text = academic_response.text.strip()

    return InsightResponse(
        developer_id=dev_id,
        learner_insight=learner_insight_text,
        activity_insight=activity_insight_text,
        academic_insight=academic_insight_text
    )

@app.post("/check/learner_type", response_model=LearnerResponse)
def learner(req: LearnerRequest):
    dev_id = req.developer_id

    # 1. Ambil fitur dari DB
    feat = get_features_for_user(dev_id)

    # 3. Predict cluster
    cluster_id = predictor.predict_dict(feat)

    # 4. Insight tambahan
    activity_score, academic_score = compute_activity_academic_scores(feat)
    activity_type = label_activity(activity_score)
    academic_type = label_academic(academic_score)

    return LearnerResponse(
        developer_id=dev_id,
        learner_type=map_cluster_label(cluster_id),
        activity_type=activity_type,
        academic_type=academic_type
    )