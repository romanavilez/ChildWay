import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Read in data
data = pd.read_csv("childway_training_data.csv")

# Set features
X = data[
    [
        "longitude",
        "latitude",
        "speed",
        "time",
        "day_of_week"
    ]
]

# Scale data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train model
model = IsolationForest(
    n_estimators=100,
    contamination=0.03,
    random_state=42
)
model.fit(X_scaled)

# Save model & scaler
joblib.dump(model, "models/isolation_forest.pkl")
joblib.dump(scaler, "models/scaler.pkl")