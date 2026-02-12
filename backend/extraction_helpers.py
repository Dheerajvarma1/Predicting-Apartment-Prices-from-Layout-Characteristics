# ==========================================
# Extract Internal JSON Data (METHOD 1 - UPGRADED)
# ==========================================
def extract_cian_json_data(driver):
    """Extract the raw JSON data that Cian uses internally"""
    try:
        json_data = driver.execute_script("""
            // Try multiple methods to find Cian's internal data
            
            // Method 1: Next.js data (most reliable for new Cian)
            if (window.__NEXT_DATA__) {
                return window.__NEXT_DATA__;
            }
            
            // Method 2: Cian config object
            if (window._cianConfig) {
                return window._cianConfig;
            }
            
            // Method 3: React props embedded in DOM
            const elements = document.querySelectorAll('[data-props]');
            for (let el of elements) {
                try {
                    return JSON.parse(el.getAttribute('data-props'));
                } catch(e) {}
            }
            
            // Method 4: Search for any JSON in script tags
            const scripts = document.querySelectorAll('script[type="application/json"]');
            for (let script of scripts) {
                try {
                    const data = JSON.parse(script.innerText);
                    if (data && (data.offer || data.apartment || data.building)) {
                        return data;
                    }
                } catch(e) {}
            }
            
            // Method 5: Look for window.__INITIAL_STATE__ (older Cian)
            if (window.__INITIAL_STATE__) {
                return window.__INITIAL_STATE__;
            }
            
            return null;
        """)
        
        return json_data
    except Exception as e:
        print(f"JSON extraction error: {e}")
        return None


# ==========================================
# Extract from HTML with BeautifulSoup (METHOD 2 - UPGRADED)
# ==========================================
def extract_from_html_soup(driver):
    """BeautifulSoup extraction method"""
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    data = {}
    
    # Find all parameter items
    param_items = soup.select('li[class*="cui-wzd2b5"], div[class*="c6c5c8b1"], span[class*="c1c5b1a0"]')
    
    for item in param_items:
        text = item.get_text(strip=True)
        if not text or '\n' not in text:
            continue
            
        lines = text.split('\n')
        if len(lines) >= 2:
            label = lines[0].strip()
            value = lines[1].strip()
            
            # Map Russian labels
            if 'Район' in label:
                data['Район'] = value
            elif 'Класс жилья' in label or 'Класс Жилья' in label:
                data['Класс Жилья'] = value
            elif 'Корпус' in label:
                data['Корпус'] = value
            elif 'Этажей' in label and 'Всего' in label:
                data['Всего Этажей'] = value
            elif 'Очередь' in label:
                data['Очередь'] = value
            elif 'Тип здания' in label or 'Тип Здания' in label:
                data['Тип Здания'] = value
            elif 'Этаж' in label and 'Всего' not in label:
                data['Этаж'] = value
            elif 'Секция' in label:
                data['Секция'] = value
            elif 'Тип недвижимости' in label or 'Тип Недвижимости' in label:
                data['Тип Недвижимости'] = value
            elif 'Категория' in label:
                data['Категория'] = value
            elif 'Количество квартир' in label or 'Квартиры' in label:
                data['Квартиры'] = value
            elif 'Отделка' in label:
                data['Отделка'] = value
            elif 'Статус' in label:
                data['Статус'] = value
            elif 'Вариант' in label:
                data['Вариант Кв.'] = value
            elif 'Ипотека' in label:
                data['Ипотека'] = value
            elif 'Субсидии' in label:
                data['Субсидии'] = value
            elif 'Планировка' in label:
                data['Планировка'] = value
            elif 'Потолков' in label or 'Высота' in label:
                data['Высота Потолков'] = value
            elif 'Общая площадь' in label:
                data['Общая Площадь'] = value
            elif 'Площадь без балкона' in label:
                data['Площадь без Балкона'] = value
            elif 'Жилая площадь' in label:
                data['Жилая Площадь'] = value
            elif 'Площадь кухни' in label:
                data['Площадь Кухни'] = value
            elif 'Площадь коридора' in label:
                data['Площадь Коридора'] = value
            elif 'Площадь ванной' in label:
                data['Площадь Ванной'] = value
            elif 'Площадь балкона' in label:
                data['Площадь Балкона'] = value
            elif 'Площадь участка' in label:
                data['Площадь Участка'] = value
            elif 'Застройщик' in label:
                data['Застройщик (Код)'] = value
            elif 'Комплекс' in label or 'Жилой комплекс' in label:
                data['Комплекс (Код)'] = value
    
    return data


# ==========================================
# Extract from JSON Blob with Comprehensive Patterns (METHOD 3 - UPGRADED)
# ==========================================
def extract_from_json_blob(json_data):
    """Extract ALL possible fields from the JSON blob using comprehensive regex patterns"""
    extracted = {}
    
    if not json_data:
        return extracted
    
    # Convert entire JSON to string for regex searching
    json_str = json.dumps(json_data, ensure_ascii=False)
    
    # Comprehensive pattern mapping for ALL fields
    patterns = {
        'Застройщик (Код)': [
            r'"developer(?:Name)?"\s*:\s*"([^"]+)"',
            r'"builder"\s*:\s*"([^"]+)"'
        ],
        'Комплекс (Код)': [
            r'"complex(?:Name)?"\s*:\s*"([^"]+)"',
            r'"residentialComplex"\s*:\s*"([^"]+)"',
            r'"zhk"\s*:\s*"([^"]+)"'
        ],
        'Класс Жилья': [
            r'"buildingClass"\s*:\s*"([^"]+)"',
            r'"class"\s*:\s*"([^"]+)"',
            r'"comfortClass"\s*:\s*"([^"]+)"'
        ],
        'Всего Этажей': [
            r'"floorsTotal"\s*:\s*(\d+)',
            r'"totalFloors"\s*:\s*(\d+)',
            r'"floorCount"\s*:\s*(\d+)'
        ],
        'Высота Потолков': [
            r'"ceilingHeight"\s*:\s*([\d\.]+)',
            r'"ceiling"\s*:\s*([\d\.]+)'
        ],
        'Тип Здания': [
            r'"buildingType"\s*:\s*"([^"]+)"',
            r'"material"\s*:\s*"([^"]+)"'
        ],
        'Отделка': [
            r'"finishing"\s*:\s*"([^"]+)"',
            r'"renovation"\s*:\s*"([^"]+)"',
            r'"decoration"\s*:\s*"([^"]+)"'
        ],
        'Планировка': [
            r'"planning"\s*:\s*"([^"]+)"',
            r'"layout"\s*:\s*"([^"]+)"',
            r'"plan"\s*:\s*"([^"]+)"'
        ],
        'Секция': [
            r'"section"\s*:\s*"([^"]+)"',
            r'"entrance"\s*:\s*"([^"]+)"'
        ],
        'Корпус': [
            r'"building"\s*:\s*"([^"]+)"',
            r'"corps"\s*:\s*"([^"]+)"'
        ],
        'Очередь': [
            r'"phase"\s*:\s*"([^"]+)"',
            r'"stage"\s*:\s*"([^"]+)"'
        ],
        'Район': [
            r'"district"\s*:\s*"([^"]+)"',
            r'"area"\s*:\s*"([^"]+)"'
        ],
        'Этаж': [
            r'"floor"\s*:\s*(\d+)'
        ],
        'Общая Площадь': [
            r'"totalArea"\s*:\s*([\d\.]+)',
            r'"area"\s*:\s*([\d\.]+)'
        ],
        'Жилая Площадь': [
            r'"livingArea"\s*:\s*([\d\.]+)'
        ],
        'Площадь Кухни': [
            r'"kitchenArea"\s*:\s*([\d\.]+)',
            r'"kitchen"\s*:\s*([\d\.]+)'
        ],
        'Площадь Балкона': [
            r'"balconyArea"\s*:\s*([\d\.]+)',
            r'"balcony"\s*:\s*([\d\.]+)'
        ],
        'Статус': [
            r'"status"\s*:\s*"([^"]+)"',
            r'"state"\s*:\s*"([^"]+)"'
        ],
        'Ипотека': [
            r'"mortgage"\s*:\s*"([^"]+)"'
        ],
        'Субсидии': [
            r'"subsidy"\s*:\s*"([^"]+)"',
            r'"subsidies"\s*:\s*"([^"]+)"'
        ],
        'Категория': [
            r'"category"\s*:\s*"([^"]+)"'
        ],
        'Тип Недвижимости': [
            r'"propertyType"\s*:\s*"([^"]+)"',
            r'"realtyType"\s*:\s*"([^"]+)"'
        ],
        'Площадь без Балкона': [
            r'"areaWithoutBalcony"\s*:\s*([\d\.]+)',
            r'"netArea"\s*:\s*([\d\.]+)'
        ],
        'Площадь Коридора': [
            r'"hallwayArea"\s*:\s*([\d\.]+)',
            r'"corridorArea"\s*:\s*([\d\.]+)'
        ],
        'Площадь Ванной': [
            r'"bathroomArea"\s*:\s*([\d\.]+)',
            r'"bathArea"\s*:\s*([\d\.]+)'
        ],
        'Площадь Участка': [
            r'"landArea"\s*:\s*([\d\.]+)',
            r'"plotArea"\s*:\s*([\d\.]+)'
        ],
        'Квартиры': [
            r'"apartments"\s*:\s*(\d+)',
            r'"units"\s*:\s*(\d+)'
        ],
        'Вариант Кв.': [
            r'"option"\s*:\s*"([^"]+)"',
            r'"variant"\s*:\s*"([^"]+)"'
        ]
    }
    
    # Apply all patterns
    for field, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, json_str, re.IGNORECASE)
            if match:
                value = next((g for g in match.groups() if g is not None), None)
                if value:
                    extracted[field] = value.strip() if isinstance(value, str) else str(value)
                    break
    
    return extracted
