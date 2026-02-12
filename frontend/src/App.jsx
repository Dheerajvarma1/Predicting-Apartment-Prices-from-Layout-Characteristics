import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    District: "",
    Class: "",
    Building: "",
    FloorsTotal: "",
    Phase: "",
    BuildingType: "",
    Floor: "",
    Section: "",
    PropertyType: "",
    PropertyCategory: "",
    Apartments: "",
    Finishing: "",
    Status: "",
    ApartmentOption: "",
    Mortgage: "",
    Subsidies: "",
    Layout: "",
    CeilingHeight: "",
    TotalArea: "",
    AreaWithoutBalcony: "",
    LivingArea: "",
    KitchenArea: "",
    HallwayArea: "",
    BathroomArea: "",
    BalconyArea: "",
    PlotArea: "",
    Developer_encoded: "",
    Complex_encoded: ""
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("ru"); // Default to Russian
  const [theme, setTheme] = useState("light");

  // Effect to apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const translations = {
    ru: {
      navHome: "Главная",
      navFeatures: "Особенности",
      navPredict: "Прогноз",
      heroTitle: "Прогноз Цен на Недвижимость",
      heroSubtitle: "На базе Передового Машинного Обучения | Самолет Россия",
      heroDesc: "Получите точную оценку стоимости недвижимости мгновенно с помощью нашего ИИ. Обучен на тысячах сделок по всей России.",
      heroButton: "Начать Прогноз →",
      featuresTitle: "Почему Мы?",
      featAccuracyTitle: "Точные Прогнозы",
      featAccuracyDesc: "ML модели, обученные на обширных данных",
      featInstantTitle: "Мгновенные Результаты",
      featInstantDesc: "Оценка недвижимости за секунды",
      featAnalysisTitle: "Полный Анализ",
      featAnalysisDesc: "Учитывает 30+ параметров для точности",
      featSecureTitle: "Безопасность",
      featSecureDesc: "Ваши данные защищены и не сохраняются",
      featTrendsTitle: "Рыночные Тренды",
      featTrendsDesc: "Анализ рынка в реальном времени",
      featUserTitle: "Удобство",
      featUserDesc: "Простой и интуитивный интерфейс",
      propDetailsTitle: "Детали Недвижимости",
      propDetailsDesc: "Заполните информацию о недвижимости для точной оценки",
      propDetailsNote: "ℹ️ Примечание: Не обязательно заполнять все поля. Наш ИИ может сделать прогноз даже на основе частичных данных.",
      submitButton: "Получить Прогноз",
      analyzing: "Анализ...",
      resultsTitle: "📊 Результат Прогноза",
      pricePerMeter: "Цена за м²",
      totalPrice: "Общая Оценка",
      resultsFooter: "💡 Этот прогноз основан на текущих рыночных трендах и характеристиках объекта",
      footerRights: "© 2026 Самолет Россия. Прогноз Цен на Недвижимость",
      footerPowered: "Работает на основе Машинного Обучения и ИИ",
      fields: {
        District: "Район",
        Class: "Класс Жилья",
        Building: "Корпус",
        FloorsTotal: "Всего Этажей",
        Phase: "Очередь",
        BuildingType: "Тип Здания",
        Floor: "Этаж",
        Section: "Секция",
        PropertyType: "Тип Недвижимости",
        PropertyCategory: "Категория",
        Apartments: "Квартиры",
        Finishing: "Отделка",
        Status: "Статус",
        ApartmentOption: "Вариант Кв.",
        Mortgage: "Ипотека",
        Subsidies: "Субсидии",
        Layout: "Планировка",
        CeilingHeight: "Высота Потолков",
        TotalArea: "Общая Площадь",
        AreaWithoutBalcony: "Площадь без Балкона",
        LivingArea: "Жилая Площадь",
        KitchenArea: "Площадь Кухни",
        HallwayArea: "Площадь Коридора",
        BathroomArea: "Площадь Ванной",
        BalconyArea: "Площадь Балкона",
        PlotArea: "Площадь Участка",
        Developer_encoded: "Застройщик (Код)",
        Complex_encoded: "Комплекс (Код)"
      }
    },
    en: {
      navHome: "Home",
      navFeatures: "Features",
      navPredict: "Predict",
      heroTitle: "Real Estate Price Predictor",
      heroSubtitle: "Powered by Advanced Machine Learning | Samolet Russia",
      heroDesc: "Get accurate property valuations instantly using our AI-powered prediction engine. Trained on thousands of real estate transactions across Russia.",
      heroButton: "Start Prediction →",
      featuresTitle: "Why Choose Our Predictor?",
      featAccuracyTitle: "Accurate Predictions",
      featAccuracyDesc: "Machine learning models trained on extensive real estate data",
      featInstantTitle: "Instant Results",
      featInstantDesc: "Get property valuations in seconds, not days",
      featAnalysisTitle: "Comprehensive Analysis",
      featAnalysisDesc: "Considers 30+ property attributes for precise estimates",
      featSecureTitle: "Secure & Private",
      featSecureDesc: "Your data is processed securely and never stored",
      featTrendsTitle: "Market Trends",
      featTrendsDesc: "Real-time market analysis reflected in every prediction",
      featUserTitle: "User Friendly",
      featUserDesc: "Simple, intuitive interface designed for everyone",
      propDetailsTitle: "Property Details",
      propDetailsDesc: "Fill in the property information below to get an accurate price prediction",
      propDetailsNote: "ℹ️ Note: You don't need to fill in every option. Our AI can predict the price even with partial information.",
      submitButton: "Get Price Prediction",
      analyzing: "Analyzing...",
      resultsTitle: "📊 Prediction Results",
      pricePerMeter: "Price Per Square Meter",
      totalPrice: "Total Estimated Price",
      resultsFooter: "💡 This prediction is based on current market trends and property characteristics",
      footerRights: "© 2026 Samolet Russia Real Estate Price Predictor",
      footerPowered: "Powered by Machine Learning & AI",
      fields: {
        District: "District",
        Class: "Housing Class",
        Building: "Building",
        FloorsTotal: "Total Floors",
        Phase: "Phase",
        BuildingType: "Building Type",
        Floor: "Floor",
        Section: "Section",
        PropertyType: "Property Type",
        PropertyCategory: "Category",
        Apartments: "Apartments",
        Finishing: "Finishing",
        Status: "Status",
        ApartmentOption: "Apartment Option",
        Mortgage: "Mortgage",
        Subsidies: "Subsidies",
        Layout: "Layout",
        CeilingHeight: "Ceiling Height",
        TotalArea: "Total Area",
        AreaWithoutBalcony: "Area w/o Balcony",
        LivingArea: "Living Area",
        KitchenArea: "Kitchen Area",
        HallwayArea: "Hallway Area",
        BathroomArea: "Bathroom Area",
        BalconyArea: "Balcony Area",
        PlotArea: "Plot Area",
        Developer_encoded: "Developer (Code)",
        Complex_encoded: "Complex (Code)"
      }
    }
  };

  const t = translations[language];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "ru" ? "en" : "ru");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        { data: formData }
      );

      setResult(response.data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert("Error predicting price. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app" >
      {/* Navbar */}
      < nav className="navbar" >
        <div className="container nav-container">
          <div className="logo">SR Predictor</div>
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t.navHome}</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.features')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navFeatures}</a>
            <a href="#predictor" onClick={(e) => { e.preventDefault(); document.getElementById('predictor')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navPredict}</a>
            <button className="lang-toggle" onClick={toggleLanguage}>
              {language === "ru" ? "🇬🇧 EN" : "🇷🇺 RU"}
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav >

      {/* Hero Section */}
      < section className="hero" >
        <div className="hero-content">
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-subtitle">
            {t.heroSubtitle}
          </p>
          <p className="hero-description">
            {t.heroDesc}
          </p>
          <button
            className="cta-button"
            onClick={() => {
              document.getElementById('predictor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t.heroButton}
          </button>
        </div>
      </section >

      {/* Features Section */}
      < section className="features" id="features" >
        <div className="container">
          <h2 className="section-title">{t.featuresTitle}</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>{t.featAccuracyTitle}</h3>
              <p>{t.featAccuracyDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>{t.featInstantTitle}</h3>
              <p>{t.featInstantDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>{t.featAnalysisTitle}</h3>
              <p>{t.featAnalysisDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>{t.featSecureTitle}</h3>
              <p>{t.featSecureDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>{t.featTrendsTitle}</h3>
              <p>{t.featTrendsDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>{t.featUserTitle}</h3>
              <p>{t.featUserDesc}</p>
            </div>
          </div>
        </div>
      </section >

      {/* Predictor Section */}
      < section id="predictor" className="predictor-section visible" >
        <div className="container">
          <h2 className="section-title">{t.propDetailsTitle}</h2>
          <p className="section-description">
            {t.propDetailsDesc}
          </p>
          <p className="section-note">
            {t.propDetailsNote}
          </p>

          <form onSubmit={handleSubmit} className="prediction-form">
            {Object.keys(formData).map((key) => (
              <div key={key} className="input-group">
                <label htmlFor={key}>{t.fields[key] || key}</label>
                <input
                  id={key}
                  type="text"
                  name={key}
                  placeholder={language === 'ru' ? `Введите: ${t.fields[key] || key}` : `Enter ${t.fields[key] || key}`}
                  value={formData[key]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {t.analyzing}
                </>
              ) : (
                t.submitButton
              )}
            </button>
          </form>
        </div>
      </section >

      {/* Results Section */}
      {
        result && (
          <section id="results" className="results-section">
            <div className="container">
              <div className="result-card">
                <h2 className="result-title">{t.resultsTitle}</h2>
                <div className="result-grid">
                  <div className="result-item">
                    <span className="result-label">{t.pricePerMeter}</span>
                    <span className="result-value">
                      ₽ {result.predicted_price_per_meter?.toLocaleString()}
                    </span>
                  </div>
                  <div className="result-item highlight">
                    <span className="result-label">{t.totalPrice}</span>
                    <span className="result-value">
                      ₽ {result.estimated_total_price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="result-footer">
                  <p>{t.resultsFooter}</p>
                </div>
              </div>
            </div>
          </section>
        )
      }

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>{t.footerRights}</p>
          <p className="footer-note">{t.footerPowered}</p>
        </div>
      </footer>
    </div >
  );
}

export default App;