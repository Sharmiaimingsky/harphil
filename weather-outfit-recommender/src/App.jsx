import { useEffect, useState, createContext, useContext } from "react";
import './App.css';

const WeatherContext = createContext();

const API_KEY = "b6bbebc26abee3f08ebbcd22a6be41bb"; 
const GEO_API = "https://api.teleport.org/api/cities/?search=";
const outfitSuggestions = (weather, temp) => {
  if (!weather || temp === undefined) return "Check the weather again!";
  const w = weather.toLowerCase();
  if (w.includes("rain")) return "Take an umbrella";
  if (w.includes("snow")) return "Wear snow boots and a warm coat";
  if (temp < 10) return "Wear a heavy jacket";
  if (temp < 20) return "Wear a light jacket";
  if (w.includes("clear") || w.includes("sun")) return "Sunglasses suggested";
  return "Dress comfortably";
};

function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    window.addEventListener("offline", () => setIsOffline(true));
    window.addEventListener("online", () => setIsOffline(false));
    return () => {
      window.removeEventListener("offline", () => setIsOffline(true));
      window.removeEventListener("online", () => setIsOffline(false));
    };
  }, []);

  const fetchWeather = async (city) => {
    if (isOffline) {
      setError("You are offline. Please reconnect to fetch weather data.");
      return;
    }
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
    <WeatherContext.Provider value={{ weatherData, fetchWeather, history, error, isOffline }}>
      {children}
    </WeatherContext.Provider>
  );
}

function useWeather() {
  return useContext(WeatherContext);
}

function SearchBar() {
  const { fetchWeather } = useWeather();
  const [city, setCity] = useState("");
 const [suggestions, setSuggestions] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleSearch = () => {
    if (city.trim()) fetchWeather(city.trim());
  };

  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);
    const res = await fetch(`${GEO_API}${input}`);
    const data = await res.json();
    const cities = data._embedded["city:search-results"]?.slice(0, 5).map(item => item.matching_full_name) || [];
    setSuggestions(cities);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setCity(input);
    clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => fetchSuggestions(input), 300));
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={city}
        onChange={handleChange}
        placeholder="Enter city name"
      />
      <button onClick={handleSearch}>Search</button>
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => { setCity(s); setSuggestions([]); fetchWeather(s); }}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WeatherDisplay() {
  const { weatherData, error } = useWeather();
 const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (weatherData) {
      setFadeIn(false);
      setTimeout(() => setFadeIn(true), 10);
    }
  }, [weatherData]);
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

function History() {
  const { history, fetchWeather } = useWeather();
  return (
    <div className="history">
      <h4>Last 5 Searches:</h4>
      <ul>
        {history.map((city, idx) => (
          <li key={idx} onClick={() => fetchWeather(city)}>{city}</li>
        ))}
      </ul>
    </div>
  );
}
function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle Theme</button>
  );
}


function App() {
  return (
    <WeatherProvider>
      <div className="app">
        <h1>🌦 Weather-Based Outfit Recommender</h1>
        <ThemeToggle />
        <SearchBar />
        <WeatherDisplay />
        <History />
      </div>
    </WeatherProvider>
  );
}

export default App;

