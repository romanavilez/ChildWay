import sys
import os
import pandas as pd
import joblib
import mysql.connector
import numpy as np

from dotenv import load_dotenv
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

load_dotenv()

def train_model(child_id):
    # MySQL connection
    conn = mysql.connector.connect(
        host=os.getenv("MYSQLHOST"),
        user=os.getenv("MYSQLUSER"),
        password=os.getenv("MYSQLPASSWORD"),
        database=os.getenv("MYSQLDATABASE"),
        port=int(os.getenv("MYSQLPORT", 3306))
    )

    # Get last 30 days of data
    query = """
        SELECT longitude, latitude, speed, time
        FROM location
        WHERE child_id = %s
        AND time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    """

    data = pd.read_sql(query, conn, params=[child_id])

    # Convert time
    data["time"] = pd.to_datetime(data["time"])

    # Feature engineering
    data["hour"] = data["time"].dt.hour
    data["day_of_week"] = data["time"].dt.dayofweek
    data["is_weekend"] = data["day_of_week"] >= 5

    # Cyclical encoding
    data["sin_hour"] = np.sin(
        2 * np.pi * data["hour"] / 24
    )
    data["cos_hour"] = np.cos(
        2 * np.pi * data["hour"] / 24
    )
    data["sin_day"] = np.sin(
        2 * np.pi * data["day_of_week"] / 7
    )
    data["cos_day"] = np.cos(
        2 * np.pi * data["day_of_week"] / 7
    )

    # Set features
    X = data[
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
    joblib.dump(model, f"models/{child_id}_model.pkl")
    joblib.dump(scaler, f"models/{child_id}_scaler.pkl")

    # Update model_registry table
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        INSERT INTO model_registry (child_id, model_ready, scaler_ready, last_trained)
        VALUES (%s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
            model_ready = VALUES(model_ready),
            scaler_ready = VALUES(scaler_ready),
            last_trained = NOW()
        """, 
        (child_id, True, True)
    )
    conn.commit()

    # Close MySQL connection
    conn.close()