import os

import joblib
import pandas as pd
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import RandomForestClassifier


class FinancialFeatures(BaseModel):
    needs_pct: float
    wants_pct: float
    savings_pct: float
    needs_trend: float
    spending_volatility: float
    small_tx_ratio: float


def train_model():
    if not os.path.exists('financial_health_dataset.csv'):
        return None

    df = pd.read_csv('financial_health_dataset.csv')

    X = df.drop('STATUS', axis=1)
    y = df['STATUS']

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)

    joblib.dump(clf, 'finance_model.pkl')
    return clf

if os.path.exists('finance_model.pkl'):
    model = joblib.load('finance_model.pkl')
else:
    model = train_model()