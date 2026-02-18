import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

# Load dataset
df = pd.read_csv("")

# Generate train-test sets
X = df.drop("safety_score", axis=1)
y = df["safety_score"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=500, oob_score=True, random_state=42)
rf = model.fit(X_train, y_train)
print("OOB score: ", rf.oob_score_)

# Variable importance
rf.feature_importances_
rf.feature_names_in_

# Performance evaluation
pred_score = rf.predict(X_test)

print("MAE: ", mean_absolute_error(y_test, pred_score))
print("R^2: ", r2_score(y_test, pred_score))