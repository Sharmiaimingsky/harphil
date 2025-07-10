import { useEffect, useState, createContext, useContext } from "react";
import './App.css';

const WeatherContext = createContext();

const API_KEY = "b6bbebc26abee3f08ebbcd22a6be41bb"; 



function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async (city) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeatherData(data);
      setError(null);
      setHistory((prev) => [city, ...prev.filter((c) => c !== city)].slice(0, 5));
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    }
  };

  return (
    <WeatherContext.Provider value={{ weatherData, fetchWeather, history, error }}>
      {children}
    </WeatherContext.Provider>
  );
}




function App() {
  return (
    <WeatherProvider>
      <div className="app">
        <h1>🌦 Weather-Based Outfit Recommender</h1>
        <SearchBar />
        <WeatherDisplay />
        <History />
      </div>
    </WeatherProvider>
  );
}

export default App;
