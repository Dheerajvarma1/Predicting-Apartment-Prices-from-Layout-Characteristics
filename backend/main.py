import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from catboost import CatBoostRegressor

# ==========================================
# Load Model
# ==========================================
model = CatBoostRegressor()
model.load_model("catboost_price_model_final.cbm")

# Load feature order
with open("model_features.json", "r", encoding="utf-8") as f:
    feature_list = json.load(f)

# Load categorical feature names
with open("categorical_features.json", "r", encoding="utf-8") as f:
    categorical_features = json.load(f)

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(
    title="Real Estate Price Prediction API",
    description="Predicts apartment price per meter and total estimated price",
    version="1.0"
)

# ==========================================
# Enable CORS (for React frontend)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Input Schema
# ==========================================
class ApartmentInput(BaseModel):
    data: dict


# ==========================================
# Health Check
# ==========================================
@app.get("/")
def health_check():
    return {"status": "API is running successfully"}


# ==========================================
# Prediction Endpoint
# ==========================================
@app.post("/predict")
def predict_price(input_data: ApartmentInput):

    try:
        input_dict = input_data.data

        # Ensure all required features exist
        for feature in feature_list:
            if feature not in input_dict:
                input_dict[feature] = None

        # Convert to DataFrame
        input_df = pd.DataFrame([input_dict])

        # Reorder columns exactly as training
        input_df = input_df[feature_list]

        # Process columns properly
        for col in input_df.columns:
            if col in categorical_features:
                input_df[col] = input_df[col].astype(str)
            else:
                input_df[col] = pd.to_numeric(input_df[col], errors="coerce")

        # Fill missing values
        input_df = input_df.fillna(0)

        # Predict (log scale)
        pred_log = model.predict(input_df)

        # Convert back from log
        price_per_meter = float(np.exp(pred_log)[0])

        # Calculate total price
        total_area = float(input_dict.get("TotalArea", 0) or 0)
        total_price = price_per_meter * total_area

        return {
            "predicted_price_per_meter": round(price_per_meter, 2),
            "estimated_total_price": round(total_price, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))