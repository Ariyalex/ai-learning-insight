
1. ### yang pertama lakuin ini ###

Pakai CMD INI untuk install component :
> pip install -r requirements.txt

2. ### yang kedua lakuin ini ###
# Masukin code dibawah ini untuk pembuatan models, lalu taruh di folder models/
import numpy as np

np.save("centroids.npy", kmeans.cluster_centers_)

3. ### yang ketiga lakuin ini ###
# Masukin code dibawah ini untuk pembuatan scaler, lalu taruh di folder configs/
import numpy as np
import json

FEATURE_ORDER = [
    "total_materials_opened",
    "total_active_days",
    "total_completed",
    "avg_submission_duration",
    "avg_submission_rating",
    "submission_pass_rate",
    "total_study_duration",
    "avg_completion_rating",
    "avg_exam_score",
    "exam_pass_rate",
    "exam_count"
]

median_vals = df[FEATURE_ORDER].median().tolist()
iqr_vals = (df[FEATURE_ORDER].quantile(0.75) - df[FEATURE_ORDER].quantile(0.25)).tolist()

scaler_params = {
    "feature_order": FEATURE_ORDER,
    "median": median_vals,
    "iqr": iqr_vals
}

with open("scaler_params.json", "w") as f:
    json.dump(scaler_params, f, indent=4)

print("DONE — scaler_params.json generated")
scaler_params

4. ### yang empat lakuin ini ###
# Biar service berjalan!
> uvicorn app:app --reload --host localhost --port 8000


5. ### yang empat lakuin ini ###
Untuk backend tambahin DB buat simpen hasil proses