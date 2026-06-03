from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from train_model import train_model
from datetime import datetime
import joblib 
import pandas as pd
import numpy as np
import os
import shap

app = FastAPI()

# feature names
FEATURE_NAMES = [
    "longitude",
    "latitude",
    "speed",
    "sin_hour",
    "cos_hour",
    "sin_day",
    "cos_day",
    "is_weekend"
]

# Define shape and type of json body
class LocationFeatures(BaseModel):
    child_id: str
    longitude: float
    latitude: float
    speed: float
    time: datetime

# Use shap to get feature contributions
def explain_with_shap(model, X_scaled, feature_names, X, scaler) -> dict:
    explainer = shap.Explainer(model)
    shap_values = explainer(X_scaled)

    explanation = {}
    for i, name in enumerate(feature_names):
        shap_val = round(float(shap_values.values[0][i]), 4)
        raw_val = float(X.iloc[0][name])
        mean_val = float(scaler.mean_[i])

        explanation[name] = {
            "shap": shap_val,
            "direction": "above" if raw_val > mean_val else "below" if raw_val < mean_val else "normal"
        }

    # Sort by raw SHAP value, highest positive first
    sorted_explanation = dict(
        sorted(explanation.items(), key=lambda x: x[1]["shap"], reverse=True)
    )
    return sorted_explanation

# create a written explanatation from the feature and info
def create_feature_explanation(feature, info):
    if feature == "speed":
        if info['direction'] == 'above': return "speed was unusually high"
        else: return "speed was unusually low"
    elif feature in ["latitude", "longitude"]:
        return "location was outside usual area"
    elif feature in ["sin_hour", "cos_hour"]:
        return "activity occurred at an unusual time"
    elif feature in ["sin_day", "cos_day"]:
        return "activity occurred during an unusual day"
    else:
        return "behavior differed from normal routine"

# create a written explanation by combining both shap explanations
def generate_written_explanation(explanation_one, explanation_two):
    # destructure explanations
    feature_one, info_one = explanation_one
    feature_two, info_two = explanation_two
    # Create explanation for each feature
    explanation_one = create_feature_explanation(feature_one, info_one)
    explanation_two = create_feature_explanation(feature_two, info_two)

    return explanation_one + " & " + explanation_two

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
        X = df [FEATURE_NAMES]

        # Apply same scaling used during training
        X_scaled = scaler.transform(X)

        # Run isolation forest
        prediction = model.predict(X_scaled)[0]

        # Return confidence score
        score = float(model.decision_function(X_scaled)[0])

        # Generate shap explanations
        written_explanation = None
        if prediction == -1:
            shap_explanation = explain_with_shap(model, X_scaled, FEATURE_NAMES, X, scaler)
            top_two_explanations = list(shap_explanation.items())[:2]
            written_explanation = generate_written_explanation(top_two_explanations[0], top_two_explanations[1])

        return {
            "anomaly": bool(prediction == -1),
            "score": score,
            "explanation": written_explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train/{child_id}")
def train(child_id):
    train_model(child_id)

    return {
        "status": "success"
    }