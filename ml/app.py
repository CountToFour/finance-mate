from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def category_summary(transactions):
    if not transactions:
        return {}
    df = pd.DataFrame(transactions)
    # ensure amount numeric
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    return df.groupby('category').agg(total_amount=('amount', 'sum'),
                                       count=('amount', 'count')).reset_index().to_dict(orient='records')

@app.route('/predict/recommendations', methods=['POST'])
def predict_recommendations():
    payload = request.get_json() or {}
    transactions = payload.get('transactions', [])
    budgets = payload.get('budgets', [])
    profile = payload.get('profile', {})

    cat_summary = category_summary(transactions)
    # compute mean across categories
    totals = [c['total_amount'] for c in cat_summary] if cat_summary else []
    saving_tips = []
    budget_suggestions = []
    anomalies = []

    if totals:
        mean = np.mean(totals)
        high = [c['category'] for c in cat_summary if c['total_amount'] > 1.5 * mean]
        saving_tips = [f"Consider reducing spending in {c}" for c in high]

        # Suggest budgets: 110% of current avg (very naive)
        for c in cat_summary:
            suggested = float(max(1, round(c['total_amount'] * 0.9, 2)))
            budget_suggestions.append({"category": c['category'], "suggestedLimit": suggested})

    # Anomaly detection on transactions using IsolationForest
    if transactions:
        tx_df = pd.DataFrame(transactions)
        tx_df['amount'] = pd.to_numeric(tx_df['amount'], errors='coerce').fillna(0)
        X = tx_df[['amount']].apply(lambda x: np.log1p(x)).values
        if len(X) >= 10:
            iso = IsolationForest(contamination=0.03, random_state=42)
            iso.fit(X)
            preds = iso.predict(X)
            for idx, p in enumerate(preds):
                if p == -1:
                    anomalies.append({
                        "txId": tx_df.iloc[idx].get('id'),
                        "amount": float(tx_df.iloc[idx]['amount'])
                    })
    response = {
        "savingTips": saving_tips,
        "anomalies": anomalies,
        "budgetSuggestions": budget_suggestions,
        "modelVersion": "ml-v0.1"
    }
    return jsonify(response)
