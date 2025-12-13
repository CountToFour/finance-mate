from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI()


class FinancialFeatures(BaseModel):
    needs_ratio: float
    wants_ratio: float
    savings_ratio: float
    needs_trend: float
    spending_volatility: float
    small_tx_ratio: float
    safety_net_ratio: float


if os.path.exists('finance_model.pkl'):
    model = joblib.load('finance_model.pkl')
else:
    print("UWAGA: Nie znaleziono modelu 'finance_model.pkl'. Uruchom najpierw generate_data.py!")
    model = None


@app.post("/predict")
def predict(features: FinancialFeatures):
    if not model:
        return {"status": "UNKNOWN", "score": 0, "primary_issue": "none"}

    input_data = {
        'needs_ratio': features.needs_ratio,
        'wants_ratio': features.wants_ratio,
        'savings_ratio': features.savings_ratio,
        'needs_trend': features.needs_trend,
        'spending_volatility': features.spending_volatility,
        'small_tx_ratio': features.small_tx_ratio,
        'safety_net_ratio': features.safety_net_ratio
    }
    df = pd.DataFrame([input_data])

    prediction = model.predict(df)[0]

    probs = model.predict_proba(df)[0]
    classes = model.classes_

    prob_map = {cls: prob for cls, prob in zip(classes, probs)}

    score = int((prob_map.get('GOOD', 0) * 100) + (prob_map.get('WARNING', 0) * 50))

    primary_issue = "none"
    max_deviation = 0.0
    trend_deviation = max(0, features.needs_trend - 0.05)
    safety_deviation = max(0, (3.0 - features.safety_net_ratio) / 10.0)

    checks = {
        "needs": (features.needs_ratio - 0.50),
        "wants": (features.wants_ratio - 0.30),
        "savings": (0.20 - features.savings_ratio),
        "small_tx": (features.small_tx_ratio - 0.30),
        "volatility": (features.spending_volatility > 1000),
        "trend": trend_deviation,
        "safety": safety_deviation
    }

    if features.spending_volatility > 1000:
        if 0.5 > max_deviation:
            max_deviation = 0.5
            primary_issue = "volatility"

    for key, deviation in checks.items():
        if key == "volatility": continue
        if deviation > 0.03 and deviation > max_deviation:
            max_deviation = deviation
            primary_issue = key

    if prediction == 'GOOD' and max_deviation < 0.1:
        primary_issue = "none"

    return {
        "status": prediction,
        "score": score,
        "primary_issue": primary_issue
    }

#  uvicorn app:app --reload --port 8000