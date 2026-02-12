
import json

file_path = "d:/work/linkedIn/Samolet-Russia/notebook/app.ipynb"

with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_cells = []

rationale_text = [
    "### Why CatBoost?\n",
    "\n",
    "We chose CatBoost because our dataset contains many high-cardinality categorical features such as district, developer, building, and complex identifiers, and CatBoost handles categorical variables natively using ordered target encoding without requiring manual one-hot encoding or heavy preprocessing. This reduces target leakage, prevents overfitting, and keeps the pipeline clean and production-ready. Since real estate pricing is a structured tabular regression problem with mixed numerical and categorical data, gradient boosting trees perform very well, and CatBoost is specifically optimized for such data. Compared to LightGBM and XGBoost, it was more stable on our dataset and required less feature engineering while delivering strong validation performance."
]

descriptions = {
    1: "### Imports & Configuration\n\nImport essential libraries for data processing, visualization, and machine learning.",
    2: "### Data Loading\n\nLoad the primary dataset from `case_data.csv`.",
    3: "### Initial Inspection\n\nDisplay dataset shape and the first record to understand the structure.",
    4: "### Data Schema Overview\n\nCheck column types and non-null counts to identify data types and potential gaps.",
    5: "### Feature Selection (Dropping Columns)\n\nRemove irrelevant or redundant columns to simplify the model.",
    6: "### Data Quality Check (Nulls)\n\nIdentify columns with missing values to prioritize cleaning steps.",
    7: "### Numeric Extraction\n\nParse numeric values from string fields like `BathroomArea` and `BalconyArea` using regex.",
    8: "### Type Conversion\n\nEnsure all area-related and cost-related columns are explicitly cast to numeric types.",
    9: "### Refined Feature Quality Check\n\nRe-evaluate missing values after initial cleaning phase.",
    10: "### Missing Value Imputation\n\nFill missing building identifiers with placeholder value \"Unknown\".",
    11: "### Target Refinement\n\nDrop records where the target variable (`PricePerMeter`) is missing.",
    12: "### Outlier Mitigation\n\nFilter out top 1% outliers in `PricePerMeter` to improve model stability.",
    13: "### Target Transformation (Log)\n\nApply log transformation to the target variable to stabilize variance and normalize the distribution.",
    14: "### Target Visualization\n\nPlot the histogram of the log-transformed target to verify normality.",
    15: "### Feature Matrix (X) & Target (y) Split\n\nIsolate the target variable from predictor features.",
    16: "### Categorical Feature Identification\n\nAutomatically detect object-type columns that represent categories.",
    17: "### Null Check in Features\n\nVerify missing values in the feature matrix.",
    18: "### Uniqueness Check\n\nExamine cardinality of categorical features.",
    19: "### Null Check in Features (Verification)\n\nFinal check for missing values in X.",
    20: "### Final Missing Value Cleanup\n\nReplace remaining NaNs in features with \"Missing\" or numeric 0.",
    21: "### Null Check in Target\n\nFinal check for missing values in y.",
    22: "### Categorical Indexing\n\nIdentify integer indices of categorical columns for CatBoost compatibility.",
    23: "### Categorical Type Casting\n\nEnsure categorical columns have the correct pandas dtype.",
    24: "### Dataset Validation (Statistics)\n\nCheck for zero or negative values in the price column.",
    25: "### Target Statistics\n\nVerify min/max values of the target variable.",
    26: "### Cleaning Zero Prices\n\nRemove rows with zero prices to allow log transformation.",
    27: "### Target Transformation (Verification)\n\nRe-apply log transformation to clean target.",
    28: "### Target Statistics (Final)\n\nFinal verification of target range.",
    29: "### Feature/Target Split (Final)\n\nPrepare final X and y sets.",
    30: "### Categorical Type Casting (Verification)\n\nEnsure categories are set correctly.",
    31: "### Target Validation (Verification)\n\nCheck for infinite values in the target.",
    32: "### Feature Pruning\n\nRemove problematic features like `HandoverDate` to optimize input space.",
    33: "### Train-Test-Validation Split\n\nDivide data into training (70%), validation (15%), and testing (15%) subsets.",
    34: "### Schema Export\n\nSave the list of model features to `model_features.json`.",
    35: "### Feature/Target Split (Re-init)\n\nRefresh X and y for training.",
    36: "### Feature Overview\n\nDisplay current list of features.",
    37: "### HandoverDate Pruning\n\nFinal removal of HandoverDate.",
    38: "### Categorical Feature List\n\nIdentified categories for training.",
    39: "### Final Split\n\nFinal Train/Val/Test split preparation.",
    40: "### Model Training (CatBoost)\n\nInitialize and train the `CatBoostRegressor` with RMSE loss.",
    41: "### Evaluation Metrics\n\nCalculate MAE, RMSE, and R2 scores on the hold-out test set.",
    42: "### Price Context\n\nCalculate mean price for error comparison.",
    43: "### Feature Importance (SHAP)\n\nInterpret model predictions using SHAP values.",
    44: "### Model Persistence\n\nSave the trained model to `.cbm` format.",
    45: "### Inference Test\n\nRun single-sample prediction to verify the pipeline.",
    46: "### Metadata Verification\n\nReview final feature count and list.",
    47: "### Final Schema Save\n\nEnsure `model_features.json` is updated with exact feature order.",
    48: "### Categorical Metadata Export\n\nSave category list for backend configuration.",
    49: "### Categorical Verification\n\nFinal count of categorical features.",
    50: "### Final Metadata Export\n\nSave categorical features with indentation for readability."
}

import uuid

def create_md_cell(text):
    return {
        "cell_type": "markdown",
        "id": str(uuid.uuid4())[:8],
        "metadata": {},
        "source": [text + "\n"]
    }

# Insert rationale at the top, after imports
# Actually, imports often go first. Let's put rationale after imports.

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        exec_count = cell.get('execution_count')
        if exec_count in descriptions:
            new_cells.append(create_md_cell(descriptions[exec_count]))
        
        new_cells.append(cell)
        
        # Insert rationale after cell 1
        if exec_count == 1:
            rationale_cell = {
                "cell_type": "markdown",
                "id": str(uuid.uuid4())[:8],
                "metadata": {},
                "source": rationale_text
            }
            new_cells.append(rationale_cell)

nb['cells'] = new_cells

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated successfully.")
