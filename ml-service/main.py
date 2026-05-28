from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from train_model import train_model
from datetime import datetime
import joblib 
import pandas as pd
import numpy as np
import os

app = FastAPI()

# Define shape and type of json body
class LocationFeatures(BaseModel):
    child_id: str
    longitude: float
    latitude: float
    speed: float
    time: datetime

# Detect anomaly
@app.post("/detect-anomaly")
def detect_anomaly(features: LocationFeatures):
    try:
        # Load model and scalar
        model = joblib.load(f"models/{features.child_id}_model.pkl")
        scaler = joblib.load(f"models/{features.child_id}_scaler.pkl")

        # Convert features into plain Python dictionary and create dataframe
        df = pd.DataFrame([features.model_dump(
            include=(
                "longitude",
                "latitude",
                "speed"
            )
        )])

        # Feature engineering
        time = features.time
        hour = time.hour + time.minute / 60 + time.second / 3600
        day_of_week = time.weekday()
        is_weekend = day_of_week >= 5

        # cyclical encoding
        sin_hour = np.sin(2 * np.pi * hour / 24)
        cos_hour = np.cos(2 * np.pi * hour / 24)
        sin_day = np.sin(2 * np.pi * day_of_week / 7)
        cos_day = np.cos(2 * np.pi * day_of_week / 7)

        # Add engineered features to df
        df["sin_hour"] = sin_hour
        df["cos_hour"] = cos_hour
        df["sin_day"] = sin_day
        df["cos_day"] = cos_day
        df["is_weekend"] = is_weekend

        # Order dataframe to match training feature order
        X = df [
            [
                "longitude",
                "latitude",
                "speed",
                "sin_hour",
                "cos_hour",
                "sin_day",
                "cos_day",
                "is_weekend"
            ]
        ]

        # Apply same scaling used during training
        X_scaled = scaler.transform(X)

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

@app.post("/train/{child_id}")
def train(child_id):
    train_model(child_id)

    return {
        "status": "success"
    }