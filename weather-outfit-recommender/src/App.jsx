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
function useWeather() {
  return useContext(WeatherContext);
}

function SearchBar() {
  const { fetchWeather } = useWeather();
  const [city, setCity] = useState("");

  const handleSearch = () => {
    if (city.trim()) fetchWeather(city.trim());
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

function WeatherDisplay() {
  const { weatherData, error } = useWeather();

  if (error) return <div className="error">❌ {error}</div>;
  if (!weatherData) return <div className="placeholder">Search a city to see the weather!</div>;

  const { name, main, weather, wind } = weatherData;
  const condition = weather[0].main;
  const temp = Math.round(main.temp);
  const suggestion = outfitSuggestions(condition, temp);

  return (
    <div className="weather-card">
      <h2>{name}</h2>
      <p>{condition}</p>
      <p>🌡 Temp: {temp}°C</p>
      <p>💨 Wind: {wind.speed} m/s</p>
      <p>💧 Humidity: {main.humidity}%</p>
      <p className="suggestion">👕 {suggestion}</p>
    </div>
  );
}

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
