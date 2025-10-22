from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# === KROK 1: MODELE REGRESYJNE PER KATEGORIA ===
def train_category_models(transactions):
    df = pd.DataFrame(transactions)
    if df.empty:
        return {}

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)

    category_models = {}
    for cat, group in df.groupby('category'):
        monthly = group.groupby(['year', 'month'])['amount'].sum().reset_index()
        if len(monthly) >= 3:
            monthly = monthly.sort_values(['year', 'month'])
            t = (monthly['year'] - monthly['year'].min()) * 12 + (monthly['month'] - 1)
            X = pd.DataFrame({
                'month_sin': np.sin(2 * np.pi * monthly['month'] / 12),
                'month_cos': np.cos(2 * np.pi * monthly['month'] / 12),
                't': t
            })
            y = monthly['amount']
            model = LinearRegression().fit(X, y)
            # zapisz również ostatni indeks czasu, aby łatwo przewidzieć kolejny miesiąc
            category_models[cat] = {'model': model, 'last_t': int(t.max()),
                                    'last_month': int(monthly['month'].iloc[-1])}

    return category_models


def predict_future_spending(models, next_month):
    predictions = {}
    for cat, bundle in models.items():
        model = bundle['model']
        last_t = bundle['last_t']
        # kolejny krok czasowy
        next_t = last_t + 1
        x_vec = pd.DataFrame([{
            'month_sin': np.sin(2 * np.pi * next_month / 12),
            'month_cos': np.cos(2 * np.pi * next_month / 12),
            't': next_t
        }])
        predicted = model.predict(x_vec).item()
        predictions[cat] = max(0, round(predicted, 2))
    return predictions


# -------------------------------------------------------------
# 2. Matrix Factorization – analiza podobnych użytkowników
# -------------------------------------------------------------
def collaborative_comparison(user_id, all_user_data, current_user_spending):
    df = pd.DataFrame(all_user_data)
    if df.empty:
        return []

    pivot = df.pivot(index='userId', columns='category', values='avg_spend').fillna(0)

    if user_id not in pivot.index:
        user_df = pd.DataFrame(current_user_spending)
        user_pivot = user_df.set_index('category')['amount'] if not user_df.empty else pd.Series(dtype=float)
        for cat in pivot.columns:
            if cat not in user_pivot:
                user_pivot[cat] = 0.0
        pivot.loc[user_id] = user_pivot[pivot.columns]

    if pivot.shape[1] < 2 or pivot.shape[0] < 3:
        return []

    scaler = StandardScaler()
    scaled = scaler.fit_transform(pivot)

    n_features = scaled.shape[1]
    n_components = min(5, max(1, n_features - 1))
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    latent_users = svd.fit_transform(scaled)

    def cosine_sim(u, v):
        nu = np.linalg.norm(u)
        nv = np.linalg.norm(v)
        if nu == 0 or nv == 0:
            return 0.0
        return float(np.dot(u, v) / (nu * nv))


    target_vec = latent_users[pivot.index.get_loc(user_id)]
    similarities = {
        uid: cosine_sim(target_vec, latent_users[i])
        for i, uid in enumerate(pivot.index)
        if uid != user_id
    }

    similar_users = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:5]
    if not similar_users:
        return []

    similar_ids = [uid for uid, _ in similar_users]
    similar_avg = pivot.loc[similar_ids].mean()

    user_spend = pivot.loc[user_id]
    diffs = []
    eps = 1e-6
    for cat in pivot.columns:
        if similar_avg[cat] > eps:
            diff_percent = ((user_spend[cat] - similar_avg[cat]) / similar_avg[cat]) * 100
            diffs.append({
                "category": cat,
                "userAvg": round(float(user_spend[cat]), 2),
                "groupAvg": round(float(similar_avg[cat]), 2),
                "diffPercent": round(float(diff_percent), 2)
            })

    advices = []
    for d in diffs:
        if d["diffPercent"] > 10:
            advices.append(f"Twoje wydatki na {d['category']} są o {d['diffPercent']}% wyższe niż u podobnych użytkowników.")
        elif d["diffPercent"] < -10:
            advices.append(f"Twoje wydatki na {d['category']} są o {abs(d['diffPercent'])}% niższe niż u podobnych użytkowników.")

    return advices

# -------------------------------------------------------------
# 3. Endpoint Flask
# -------------------------------------------------------------
@app.route("/predict/budget-recommendations", methods=["POST"])
def budget_recommendations():
    payload = request.get_json() or {}
    user_id = payload.get("userId")
    total_available = float(payload.get("availableAmount", 0))
    transactions = payload.get("transactions", [])
    all_user_data = payload.get("allUserData", [])
    requested_categories = payload.get("categories", [])

    if not transactions and not requested_categories:
        return jsonify({
            "error": "Brak danych transakcji do analizy."
        }), 400

    # 1️⃣ Model regresyjny per kategoria
    models = train_category_models(transactions)
    next_month = pd.Timestamp.now().month + 1
    if next_month > 12:
        next_month = 1

    predicted_spending = predict_future_spending(models, next_month)
    for cat in requested_categories:
        predicted_spending.setdefault(cat, 0.0)

    if not predicted_spending and requested_categories:
        equal_part = round(total_available / max(1, len(requested_categories)), 2)
        budget_suggestions = [{"category": cat, "recommendedLimit": equal_part} for cat in requested_categories]
        comparison_tips = collaborative_comparison(
            user_id,
            all_user_data,
            [{"category": b["category"], "amount": b["recommendedLimit"]} for b in budget_suggestions]
        )
        return jsonify({
            "recommendedBudgets": budget_suggestions,
            "comparisonTips": comparison_tips,
            "modelVersion": "budget-ml-v3-regression+collab"
        })

    total_predicted = sum(predicted_spending.values())
    if total_predicted <= 0:
        # rozdziel równo, gdy nic nie przewidziano lub same zera
        cats = list(predicted_spending.keys()) or requested_categories
        equal_part = round(total_available / max(1, len(cats)), 2)
        budget_suggestions = [{"category": cat, "recommendedLimit": equal_part} for cat in cats]
    else:
        budget_suggestions = [
            {
                "category": cat,
                "recommendedLimit": round(total_available * val / total_predicted, 2)
            }
            for cat, val in predicted_spending.items()
        ]

    # 3️⃣ Porównanie z innymi użytkownikami
    comparison_tips = collaborative_comparison(
        user_id,
        all_user_data,
        [{"category": b["category"], "amount": b["recommendedLimit"]} for b in budget_suggestions]
    )

    return jsonify({
        "recommendedBudgets": budget_suggestions,
        "comparisonTips": comparison_tips,
        "modelVersion": "budget-ml-v3-regression+collab"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
