import json
import re
import traceback
import time
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from catboost import CatBoostRegressor
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# ==========================================
# Load Model
# ==========================================
model = CatBoostRegressor()
model.load_model("catboost_price_model_final.cbm")

with open("model_features.json", "r", encoding="utf-8") as f:
    feature_list = json.load(f)

with open("categorical_features.json", "r", encoding="utf-8") as f:
    categorical_features = json.load(f)

# ==========================================
# FastAPI Setup
# ==========================================
app = FastAPI(
    title="Real Estate Price Prediction API",
    version="5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Schemas
# ==========================================
class ApartmentInput(BaseModel):
    data: dict

class LinkInput(BaseModel):
    url: str


# ==========================================
# Prepare Model Input
# ==========================================
def prepare_input_dataframe(input_dict: dict) -> pd.DataFrame:
    for feature in feature_list:
        if feature not in input_dict:
            input_dict[feature] = None

    df = pd.DataFrame([input_dict])
    df = df[feature_list]

    for col in df.columns:
        if col in categorical_features:
            df[col] = df[col].astype(str)
        else:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.fillna(0)
    return df


# ==========================================
# Setup Selenium Driver
# ==========================================
def setup_driver():
    """Configure Chrome to look like a real user"""
    options = Options()
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument('--headless')  # Run in headless mode for server
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver


# ==========================================
# Map Russian Fields to English Model Features
# ==========================================
def map_russian_to_english(russian_data: dict) -> dict:
    """Convert Russian field names to English model feature names"""
    
    field_mapping = {
        'Район': 'District',
        'Класс Жилья': 'Class',
        'Корпус': 'Building',
        'Всего Этажей': 'FloorsTotal',
        'Очередь': 'Phase',
        'Тип Здания': 'BuildingType',
        'Этаж': 'Floor',
        'Секция': 'Section',
        'Тип Недвижимости': 'PropertyType',
        'Категория': 'PropertyCategory',
        'Квартиры': 'Apartments',
        'Отделка': 'Finishing',
        'Статус': 'Status',
        'Вариант Кв.': 'ApartmentOption',
        'Ипотека': 'Mortgage',
        'Субсидии': 'Subsidies',
        'Планировка': 'Layout',
        'Высота Потолков': 'CeilingHeight',
        'Общая Площадь': 'TotalArea',
        'Площадь без Балкона': 'AreaWithoutBalcony',
        'Жилая Площадь': 'LivingArea',
        'Площадь Кухни': 'KitchenArea',
        'Площадь Коридора': 'HallwayArea',
        'Площадь Ванной': 'BathroomArea',
        'Площадь Балкона': 'BalconyArea',
        'Площадь Участка': 'PlotArea',
        'Застройщик (Код)': 'Developer_encoded',
        'Комплекс (Код)': 'Complex_encoded'
    }
    
    english_data = {}
    for rus_key, rus_value in russian_data.items():
        eng_key = field_mapping.get(rus_key, rus_key)
        
        # Clean numeric values (remove м², convert to float)
        if eng_key in ['TotalArea', 'AreaWithoutBalcony', 'LivingArea', 'KitchenArea', 
                       'HallwayArea', 'BathroomArea', 'BalconyArea', 'PlotArea', 'CeilingHeight']:
            # Extract number from "85 м²" or "85.5 м²"
            match = re.search(r'(\d+[.,]?\d*)', str(rus_value))
            if match:
                english_data[eng_key] = float(match.group(1).replace(',', '.'))
        elif eng_key in ['Floor', 'FloorsTotal']:
            # Extract just the number
            match = re.search(r'(\d+)', str(rus_value))
            if match:
                english_data[eng_key] = int(match.group(1))
        else:
            english_data[eng_key] = rus_value
    
    return english_data


# ==========================================
# Extract Apartment Data Using 3-Tier Strategy (UPGRADED)
# ==========================================
def extract_apartment_data(url: str) -> dict:
    """Extract apartment data using upgraded 3-tier strategy from cian_scraper.py"""
    driver = setup_driver()
    all_data = {}
    
    try:
        print(f"\n🚀 Loading: {url}")
        driver.get(url)
        time.sleep(5)  # Wait for JavaScript to load
        
        # ===== METHOD 1: JAVASCRIPT JSON EXTRACTION (THE UPGRADE) =====
        print("🔍 Method 1: Extracting internal JSON data...")
        try:
            json_data = driver.execute_script("""
                if (window.__NEXT_DATA__) return window.__NEXT_DATA__;
                if (window._cianConfig) return window._cianConfig;
                
                const elements = document.querySelectorAll('[data-props]');
                for (let el of elements) {
                    try { return JSON.parse(el.getAttribute('data-props')); } catch(e) {}
                }
                
                const scripts = document.querySelectorAll('script[type="application/json"]');
                for (let script of scripts) {
                    try {
                        const data = JSON.parse(script.innerText);
                        if (data && (data.offer || data.apartment || data.building)) return data;
                    } catch(e) {}
                }
                
                if (window.__INITIAL_STATE__) return window.__INITIAL_STATE__;
                return null;
            """)
            
            if json_data:
                # Extract from JSON blob with comprehensive patterns
                json_str = json.dumps(json_data, ensure_ascii=False)
                
                patterns = {
                    'Застройщик (Код)': [r'"developer(?:Name)?"\s*:\s*"([^"]+)"', r'"builder"\s*:\s*"([^"]+)"'],
                    'Комплекс (Код)': [r'"complex(?:Name)?"\s*:\s*"([^"]+)"', r'"residentialComplex"\s*:\s*"([^"]+)"'],
                    'Класс Жилья': [r'"buildingClass"\s*:\s*"([^"]+)"', r'"class"\s*:\s*"([^"]+)"'],
                    'Всего Этажей': [r'"floorsTotal"\s*:\s*(\d+)', r'"totalFloors"\s*:\s*(\d+)'],
                    'Высота Потолков': [r'"ceilingHeight"\s*:\s*([\d\.]+)'],
                    'Тип Здания': [r'"buildingType"\s*:\s*"([^"]+)"', r'"material"\s*:\s*"([^"]+)"'],
                    'Отделка': [r'"finishing"\s*:\s*"([^"]+)"', r'"renovation"\s*:\s*"([^"]+)"'],
                    'Планировка': [r'"planning"\s*:\s*"([^"]+)"', r'"layout"\s*:\s*"([^"]+)"'],
                    'Секция': [r'"section"\s*:\s*"([^"]+)"'],
                    'Корпус': [r'"building"\s*:\s*"([^"]+)"', r'"corps"\s*:\s*"([^"]+)"'],
                    'Очередь': [r'"phase"\s*:\s*"([^"]+)"', r'"stage"\s*:\s*"([^"]+)"'],
                    'Район': [r'"district"\s*:\s*"([^"]+)"', r'"area"\s*:\s*"([^"]+)"'],
                    'Этаж': [r'"floor"\s*:\s*(\d+)'],
                    'Общая Площадь': [r'"totalArea"\s*:\s*([\d\.]+)', r'"area"\s*:\s*([\d\.]+)'],
                    'Жилая Площадь': [r'"livingArea"\s*:\s*([\d\.]+)'],
                    'Площадь Кухни': [r'"kitchenArea"\s*:\s*([\d\.]+)'],
                    'Площадь Балкона': [r'"balconyArea"\s*:\s*([\d\.]+)'],
                    'Статус': [r'"status"\s*:\s*"([^"]+)"'],
                    'Ипотека': [r'"mortgage"\s*:\s*"([^"]+)"'],
                    'Субсидии': [r'"subsidy"\s*:\s*"([^"]+)"'],
                    'Категория': [r'"category"\s*:\s*"([^"]+)"'],
                    'Тип Недвижимости': [r'"propertyType"\s*:\s*"([^"]+)"']
                }
                
                for field, pattern_list in patterns.items():
                    for pattern in pattern_list:
                        match = re.search(pattern, json_str, re.IGNORECASE)
                        if match:
                            value = next((g for g in match.groups() if g is not None), None)
                            if value:
                                all_data[field] = value.strip() if isinstance(value, str) else str(value)
                                break
                
                print(f"   ✅ Found {len(all_data)} fields from JSON")
            else:
                print("   ❌ No JSON data found")
        except Exception as e:
            print(f"   ❌ JSON extraction error: {e}")
        
        # ===== METHOD 2: BEAUTIFULSOUP HTML PARSING =====
        print("🔍 Method 2: Extracting HTML data...")
        try:
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            param_items = soup.select('li[class*="cui-wzd2b5"], div[class*="c6c5c8b1"], span[class*="c1c5b1a0"]')
            
            html_count = 0
            for item in param_items:
                text = item.get_text(strip=True)
                if not text or '\n' not in text:
                    continue
                    
                lines = text.split('\n')
                if len(lines) >= 2:
                    label, value = lines[0].strip(), lines[1].strip()
                    
                    if 'Общая площадь' in label and 'Общая Площадь' not in all_data:
                        all_data['Общая Площадь'] = value
                        html_count += 1
                    elif 'Этаж' in label and 'Всего' not in label and 'Этаж' not in all_data:
                        all_data['Этаж'] = value
                        html_count += 1
                    elif 'Этажей' in label and 'Всего' in label and 'Всего Этажей' not in all_data:
                        all_data['Всего Этажей'] = value
                        html_count += 1
                    elif 'Застройщик' in label and 'Застройщик (Код)' not in all_data:
                        all_data['Застройщик (Код)'] = value
                        html_count += 1
                    elif ('Комплекс' in label or 'Жилой комплекс' in label) and 'Комплекс (Код)' not in all_data:
                        all_data['Комплекс (Код)'] = value
                        html_count += 1
            
            print(f"   ✅ Found {html_count} additional fields from HTML")
        except Exception as e:
            print(f"   ❌ HTML extraction error: {e}")
        
        # ===== METHOD 3: PAGE TEXT REGEX =====
        print("🔍 Method 3: Scanning page text...")
        try:
            page_text = driver.find_element("tag name", "body").text
            
            text_patterns = {
                'Застройщик (Код)': r'Застройщик[:\s]+([^\n]+)',
                'Комплекс (Код)': r'Жилой комплекс[:\s]+([^\n]+)',
                'Высота Потолков': r'Высота потолков[:\s]+([^\n]+)',
                'Общая Площадь': r'Общая площадь[:\s]+([\d\.,]+\s*м²)'
            }
            
            text_count = 0
            for field, pattern in text_patterns.items():
                if field not in all_data:
                    match = re.search(pattern, page_text, re.IGNORECASE)
                    if match:
                        all_data[field] = match.group(1).strip()
                        text_count += 1
            
            print(f"   ✅ Found {text_count} additional fields from text")
        except Exception as e:
            print(f"   ❌ Text extraction error: {e}")
        
        print(f"\n📊 EXTRACTION COMPLETE: {len(all_data)} total fields found")
        
        # Convert to English field names
        english_data = map_russian_to_english(all_data)
        
        print(f"\n=== Mapped to English Model Features ===")
        for key, value in english_data.items():
            print(f"  ✓ {key}: {value}")
        
        return english_data
        
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        traceback.print_exc()
        return {}
    
    finally:
        driver.quit()


# ==========================================
# Health Check
# ==========================================
@app.get("/")
def health_check():
    return {"status": "API is running successfully"}


# ==========================================
# Manual Prediction
# ==========================================
@app.post("/predict")
def predict_price(input_data: ApartmentInput):
    try:
        df = prepare_input_dataframe(input_data.data)

        pred_log = model.predict(df)
        price_per_meter = float(np.exp(pred_log)[0])

        total_area = float(input_data.data.get("TotalArea", 0) or 0)
        total_price = price_per_meter * total_area

        return {
            "predicted_price_per_meter": round(price_per_meter, 2),
            "estimated_total_price": round(total_price, 2)
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Link-Based Prediction (Selenium Extraction)
# ==========================================
@app.post("/predict-from-link")
def predict_from_link(link_input: LinkInput):
    try:
        url = link_input.url.strip()

        if not url.startswith("http"):
            raise Exception("Invalid URL format")

        print("\n=== Opening Browser ===")
        extracted_data = extract_apartment_data(url)

        df = prepare_input_dataframe(extracted_data)

        print("=== Predicting ===")
        pred_log = model.predict(df)

        price_per_meter = float(np.exp(pred_log)[0])
        total_area = float(extracted_data.get("TotalArea", 0) or 0)
        total_price = price_per_meter * total_area

        return {
            "predicted_price_per_meter": round(price_per_meter, 2),
            "estimated_total_price": round(total_price, 2),
            "extracted_features": extracted_data
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))