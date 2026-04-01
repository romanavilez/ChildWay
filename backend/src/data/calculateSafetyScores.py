import pandas as pd

# Read Data
df = pd.read_csv("./SafetyIndicatorData.csv")
print(df.head())

# Normalization Functions
def normalize_crime_rate():
    pass

def normalize_time():
    pass

def normalize_distance_home():
    pass

def normalize_direction_changes():
    pass

def normalize_stops():
    pass

def normalize_battery():
    pass

# Normalize Crime Rate
df["crime_rate_n"] = (df["crime_rate"] / 50).clip(upper=1)

# Normalize Time
df["time_n"] = (df["time"])

# Normalize Distance Home

# Normalize Direction Changes

# Normalize Stops

# Normalize Battery

# Safety Score Function

# Calculate Safety Scores

# Export Data with Safety Scores