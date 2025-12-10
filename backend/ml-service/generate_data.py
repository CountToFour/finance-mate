import pandas as pd
import numpy as np
import random

SAMPLES = 1000

data = []

for _ in range(SAMPLES):
    profile_type = random.choice(['saver', 'spender', 'student', 'critical', 'balanced'])

    if profile_type == 'saver':
        needs = np.random.uniform(0.30, 0.50)
        wants = np.random.uniform(0.10, 0.30)
        savings = 1.0 - needs - wants
        safety_net = np.random.uniform(3.0, 12.0)
        volatility = np.random.uniform(50, 200)
        small_tx = np.random.uniform(0.1, 0.3)
        status = 'GOOD'

    elif profile_type == 'spender':
        needs = np.random.uniform(0.40, 0.60)
        wants = np.random.uniform(0.35, 0.55)
        savings = max(0, 1.0 - needs - wants)
        safety_net = np.random.uniform(0.5, 2.0)
        volatility = np.random.uniform(500, 1500)
        small_tx = np.random.uniform(0.4, 0.7)
        status = 'WARNING'

    elif profile_type == 'critical':
        needs = np.random.uniform(0.70, 0.90)
        wants = np.random.uniform(0.10, 0.20)
        savings = 0.0
        safety_net = np.random.uniform(0.0, 0.5)
        volatility = np.random.uniform(200, 800)
        small_tx = np.random.uniform(0.2, 0.5)
        status = 'CRITICAL'

    elif profile_type == 'balanced':
        needs = np.random.uniform(0.45, 0.55)
        wants = np.random.uniform(0.25, 0.35)
        savings = 1.0 - needs - wants
        safety_net = np.random.uniform(2.0, 4.0)
        volatility = np.random.uniform(200, 500)
        small_tx = np.random.uniform(0.2, 0.4)
        status = 'GOOD'

    else:
        needs = np.random.uniform(0.50, 0.70)
        wants = np.random.uniform(0.20, 0.30)
        savings = max(0, 1.0 - needs - wants)
        safety_net = np.random.uniform(0.2, 1.5)
        volatility = np.random.uniform(100, 400)
        small_tx = np.random.uniform(0.5, 0.8)
        status = 'WARNING' if safety_net < 1.0 else 'GOOD'

    needs += np.random.normal(0, 0.02)
    wants += np.random.normal(0, 0.02)
    needs = np.clip(needs, 0.0, 1.0)
    wants = np.clip(wants, 0.0, 1.0)

    row = {
        'needs_ratio': round(needs, 2),
        'wants_ratio': round(wants, 2),
        'savings_ratio': round(savings, 2),
        'needs_trend': round(np.random.uniform(-0.1, 0.1), 2),
        'spending_volatility': round(volatility, 2),
        'small_tx_ratio': round(small_tx, 2),
        'safety_net_ratio': round(safety_net, 2),
        'STATUS': status
    }
    data.append(row)

df = pd.DataFrame(data)
df.to_csv('financial_health_dataset.csv', index=False)
print("Wygenerowano dane syntetyczne: financial_health_dataset.csv")