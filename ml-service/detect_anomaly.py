import sys
import json
import joblib
import pandas as pd

# Load model
model = joblib.load("models/isolation_forest.pkl")
scaler = joblib.load("models/scaler.pkl")

# Read input JSON
raw = sys.argv[1]
data = json.loads(raw)

# Create dataframe
df = pd.DataFrame([data])

# Scale data using same scaler
X_scaled = scaler.transform(df)

# Make prediction
prediction = model.predict(X_scaled)[0]
score = model.decision_function(X_scaled)[0]

# Store result
result = {
    "anomaly": True if prediction == -1 else False,
    "score": float(score)
}

print(json.dumps(result))