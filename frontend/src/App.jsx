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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        { data: formData }
      );

      setResult(response.data);
    } catch (error) {
      alert("Error predicting price");
    }
  };

  return (
    <div className="container">
      <h1>Real Estate Price Predictor</h1>

      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key}
            value={formData[key]}
            onChange={handleChange}
          />
        ))}

        <button type="submit">Predict Price</button>
      </form>

      {result && (
        <div className="result">
          <h2>Prediction Result</h2>
          <p>Price Per Meter: ₽ {result.predicted_price_per_meter}</p>
          <p>Total Estimated Price: ₽ {result.estimated_total_price}</p>
        </div>
      )}
    </div>
  );
}

export default App;