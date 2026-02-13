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
  const [inputType, setInputType] = useState("manual"); // 'manual' or 'link'
  const [linkUrl, setLinkUrl] = useState("");

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
      inputTypeManual: "Вручную",
      inputTypeLink: "По Ссылке (Самолет)",
      linkPlaceholder: "Вставьте ссылку на квартиру с сайта samolet.ru",
      linkButton: "Прогноз по Ссылке",
      orLabel: "ИЛИ",
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
      inputTypeManual: "Manual Input",
      inputTypeLink: "By Link (Samolet)",
      linkPlaceholder: "Paste Samolet.ru apartment link here",
      linkButton: "Predict from Link",
      orLabel: "OR",
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

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkUrl) return;
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict-from-link",
        { url: linkUrl }
      );

      setResult(response.data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.detail || "Error predicting from link. Please ensure it is a valid samolet.ru apartment link.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app" >
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo">SR Predictor</div>
          <div className="navbar-right">
            <div className="nav-links">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t.navHome}</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.features')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navFeatures}</a>
              <a href="#predictor" onClick={(e) => { e.preventDefault(); document.getElementById('predictor')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navPredict}</a>
            </div>
            <div className="nav-socials">
              <a href="https://github.com/Dheerajvarma1" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
              <a href="https://www.linkedin.com/in/dheeraj-varma-5061342b1/" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a href="mailto:dheerajvarma031@gmail.com" className="social-icon" title="Email">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l12-9.725v15.438h-24v-15.438l12 9.725z" /></svg>
              </a>
              <div className="nav-controls">
                <button className="lang-toggle" onClick={toggleLanguage}>
                  {language === "ru" ? "🇬🇧 EN" : "🇷🇺 RU"}
                </button>
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
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
      </section>

      {/* Features Section */}
      <section className="features" id="features">
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
      </section>

      {/* Predictor Section */}
      <section id="predictor" className="predictor-section visible">
        <div className="container">
          <h2 className="section-title">{t.propDetailsTitle}</h2>
          <p className="section-description">
            {t.propDetailsDesc}
          </p>

          <div className="input-type-toggle">
            <button
              className={`toggle-btn ${inputType === 'manual' ? 'active' : ''}`}
              onClick={() => setInputType('manual')}
            >
              {t.inputTypeManual}
            </button>
            <button
              className={`toggle-btn ${inputType === 'link' ? 'active' : ''}`}
              onClick={() => setInputType('link')}
            >
              {t.inputTypeLink}
            </button>
          </div>

          {inputType === 'manual' ? (
            <>
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
            </>
          ) : (
            <form onSubmit={handleLinkSubmit} className="link-form">
              <div className="input-group full-width">
                <input
                  type="url"
                  placeholder={t.linkPlaceholder}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="link-input"
                  required
                />
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    {t.analyzing}
                  </>
                ) : (
                  t.linkButton
                )}
              </button>
            </form>
          )}
        </div>
      </section>

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
          <div className="footer-content">
            <div className="footer-left">
              <h3>Subburi Dheeraj Varma</h3>
              <p>{t.footerRights}</p>
              <p className="footer-note">{t.footerPowered}</p>
            </div>
            <div className="footer-right">
              <div className="contact-info">
                <p>📧 dheerajvarma031@gmail.com</p>
                <p>📞 +91 7981692357</p>
              </div>
              <div className="footer-socials">
                <a href="https://github.com/Dheerajvarma1" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/dheeraj-varma-5061342b1/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}

export default App;