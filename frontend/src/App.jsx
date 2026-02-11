import { useState } from "react";
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo">SR Predictor</div>
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#predictor" onClick={(e) => { e.preventDefault(); document.getElementById('predictor')?.scrollIntoView({ behavior: 'smooth' }); }}>Predict</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Real Estate Price Predictor</h1>
          <p className="hero-subtitle">
            Powered by Advanced Machine Learning | Samolet Russia
          </p>
          <p className="hero-description">
            Get accurate property valuations instantly using our AI-powered prediction engine.
            Trained on thousands of real estate transactions across Russia.
          </p>
          <button
            className="cta-button"
            onClick={() => {
              document.getElementById('predictor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Start Prediction →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our Predictor?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Accurate Predictions</h3>
              <p>Machine learning models trained on extensive real estate data</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>Get property valuations in seconds, not days</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Comprehensive Analysis</h3>
              <p>Considers 30+ property attributes for precise estimates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your data is processed securely and never stored</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Market Trends</h3>
              <p>Real-time market analysis reflected in every prediction</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>User Friendly</h3>
              <p>Simple, intuitive interface designed for everyone</p>
            </div>
          </div>
        </div>
      </section>

      {/* Predictor Section */}
      <section id="predictor" className="predictor-section visible">
        <div className="container">
          <h2 className="section-title">Property Details</h2>
          <p className="section-description">
            Fill in the property information below to get an accurate price prediction
          </p>
          <p className="section-note">
            ℹ️ Note: You don't need to fill in every option. Our AI can predict the price even with partial information.
          </p>

          <form onSubmit={handleSubmit} className="prediction-form">
            {Object.keys(formData).map((key) => (
              <div key={key} className="input-group">
                <label htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                <input
                  id={key}
                  type="text"
                  name={key}
                  placeholder={`Enter ${key.replace(/_/g, ' ').toLowerCase()}`}
                  value={formData[key]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Get Price Prediction'
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section id="results" className="results-section">
          <div className="container">
            <div className="result-card">
              <h2 className="result-title">📊 Prediction Results</h2>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Price Per Square Meter</span>
                  <span className="result-value">
                    ₽ {result.predicted_price_per_meter?.toLocaleString()}
                  </span>
                </div>
                <div className="result-item highlight">
                  <span className="result-label">Total Estimated Price</span>
                  <span className="result-value">
                    ₽ {result.estimated_total_price?.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="result-footer">
                <p>💡 This prediction is based on current market trends and property characteristics</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2026 Samolet Russia Real Estate Price Predictor</p>
          <p className="footer-note">Powered by Machine Learning & AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;