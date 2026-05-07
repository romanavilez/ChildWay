from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib 
import pandas as pd
import numpy as np

app = FastAPI()

# Load model and scalar
model = joblib.load("models/isolation_forest.pkl")
scaler = joblib.load("models/scaler.pkl")

# Define shape and type of json body
class LocationFeatures(BaseModel):
    longitude: float
    latitude: float
    speed: float
    time: float
    day_of_week: int

# Detect anomaly
@app.post("/detect-anomaly")
def detect_anomaly(features: LocationFeatures):
    try:
        # Convert features into plain Python dictionary and create dataframe
        df = pd.DataFrame([features.model_dump()])
        # Apply same scaling used during training
        X_scaled = scaler.transform(df)
        # Run isolation forest
        prediction = model.predict(X_scaled)[0]
        # Return confidence score
        score = float(model.decision_function(X_scaled)[0])

        return {
            "anomaly": bool(prediction == -1),
            "score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
