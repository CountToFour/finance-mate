import pandas as pd
import numpy as np
import random

SAMPLES = 1000
data = []

PROFILES = ['saver', 'spender', 'entry_level', 'critical', 'balanced']
WEIGHTS = [0.15, 0.30, 0.20, 0.25, 0.10]

for _ in range(SAMPLES):
    profile_type = random.choices(PROFILES, weights=WEIGHTS, k=1)[0]

    if profile_type == 'saver':
        needs = np.random.uniform(0.30, 0.50)
        wants = np.random.uniform(0.10, 0.30)
        savings = 1.0 - needs - wants
        safety_net = np.random.uniform(3.0, 12.0)
        volatility = np.random.uniform(0.05, 0.15)
        small_tx = np.random.uniform(0.1, 0.3)
        needs_trend = np.random.uniform(-0.05, 0.03)
        status = 'GOOD'

    elif profile_type == 'spender':
        needs = np.random.uniform(0.45, 0.65)
        wants = np.random.uniform(0.30, 0.50)
        savings = max(0, 1.0 - needs - wants)
        safety_net = np.random.uniform(0.5, 2.0)
        volatility = np.random.uniform(0.3, 0.6)
        small_tx = np.random.uniform(0.4, 0.7)
        needs_trend = np.random.uniform(0.0, 0.1)
        status = 'WARNING'

    elif profile_type == 'critical':
        needs = np.random.uniform(0.70, 0.90)
        wants = np.random.uniform(0.10, 0.20)
        savings = 0.0
        safety_net = np.random.uniform(0.0, 0.5)
        volatility = np.random.uniform(0.2, 0.5)
        small_tx = np.random.uniform(0.2, 0.5)
        needs_trend = np.random.uniform(0.02, 0.1)
        status = 'CRITICAL'

    elif profile_type == 'balanced':
        needs = np.random.uniform(0.45, 0.55)
        wants = np.random.uniform(0.25, 0.35)
        savings = 1.0 - needs - wants
        safety_net = np.random.uniform(2.0, 4.0)
        volatility = np.random.uniform(0.10, 0.25)
        small_tx = np.random.uniform(0.2, 0.4)
        needs_trend = np.random.uniform(-0.03, 0.05)
        status = 'GOOD'

    elif profile_type == 'entry-level':
        needs = np.random.uniform(0.30, 0.50)
        wants = np.random.uniform(0.30, 0.60)
        savings = max(0, 1.0 - needs - wants)
        safety_net = np.random.uniform(0.1, 2.5)
        small_tx = np.random.uniform(0.5, 0.8)
        volatility = np.random.uniform(0.20, 0.45)
        needs_trend = np.random.uniform(0.0, 0.05)
        if savings > 0.15 or safety_net > 2.0:
            status = 'GOOD'
        elif safety_net < 0.5 and savings < 0.05:
            status = 'CRITICAL'
        else:
            status = 'WARNING'

    needs += np.random.normal(0, 0.02)
    wants += np.random.normal(0, 0.02)
    needs = np.clip(needs, 0.0, 1.0)
    wants = np.clip(wants, 0.0, 1.0)

    row = {
        'needs_ratio': round(needs, 2),
        'wants_ratio': round(wants, 2),
        'savings_ratio': round(savings, 2),
        'needs_trend': round(needs_trend, 2),
        'spending_volatility': round(volatility, 2),
        'small_tx_ratio': round(small_tx, 2),
        'safety_net_ratio': round(safety_net, 2),
        'STATUS': status
    }
    data.append(row)

df = pd.DataFrame(data)
df.to_csv('financial_health_dataset.csv', index=False)
print("Wygenerowano dane syntetyczne: financial_health_dataset.csv")