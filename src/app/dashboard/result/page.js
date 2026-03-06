'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../result/dashboard-result.module.css';

import { FaBookmark } from "react-icons/fa";

// Helper function to map the weather codes from the Weather Forecast API to their corresponding icons
function getWeatherIcon(code) {

  // Sunny
  if (code === 0) return '/weather-icons/sunny.png';

  // Partly Cloudy Partly Sunny
  if ([1,2].includes(code)) return '/weather-icons/sunny-cloudy.png';

  // Cloudy
  if (code === 3) return '/weather-icons/cloudy.png';

  // Rainy
  if ([51,53,55,61,63,65,80,81,82].includes(code))
    return '/weather-icons/rainy.png';

  // Stormy
  if ([95,96,99].includes(code))
    return '/weather-icons/stormy.png';

  return '/weather-icons/cloudy.png';
}

export default function ForecastPage() {
  // Being able to use the logged in user's info
  const userEmail = typeof window !== 'undefined' 
  ? localStorage.getItem('loggedInEmail') 
  : null;
  
  const router = useRouter();
  // Retrieve the city and country from the query parameters passed into the url when being
  // re-directed to this page
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  // Tracks whether a user has saved their search result
  const [isSaved, setIsSaved] = useState(false);

  // Stores the loading state, weather data, and any error messages
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!city || !country) return;

    const fetchWeather = async () => {
      try {
        // Using the Weather Forecast API from Open-Meteo 
        // to fetch the 7-day forecast for the specified city and country
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&format=json&limit=1`);
        const geoData = await geoRes.json();

        // If the geocoding API does not return any results for the specified city and country, 
        // show an error message to the user
        if (!geoData.length) {
          setError('City not found');
          setLoading(false);
          return;
        }

        const { lat, lon } = geoData[0];

        // Determines the current date and 7 days into the future from that current date
        const today = new Date().toISOString().split('T')[0];
        const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Fetches the weather data for the specified city and country using the latitude and longitude obtained from the geocoding API
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${today}&end_date=${weekLater}`);
        const weatherData = await weatherRes.json();

        setWeather(weatherData.daily);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, country]);

  useEffect(() => {
    // Checks if the user's search result has already been saved by fetching the user's saved search results from the save API route
    const checkSaved = async () => {
      const res = await fetch(`/api/save/get-saved-result?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();

      const exists = data.some(
        loc => loc.city === city && loc.country === country
      );

      setIsSaved(exists);
    };

    checkSaved();
  }, [city, country]);

  const toggleSave = async () => {
    try {
      // Saves or unsaves the user's search result by sending a POST request to the save API route with the city, country, and user's email in the request body
      const res = await fetch("/api/save/save-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          country,
          email: userEmail,
        }),
      });
      
      await res.json();
      setIsSaved(prev => !prev);

      router.refresh();
    
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className={styles.container}><p>Loading weather for {city}, {country}...</p></div>;
  if (error) return <div className={styles.container}><p>{error}</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <button
            className={styles.backButton}
            onClick={() => {
              router.push('/dashboard/search');
            }}
          >
            ← Back
          </button>

          <button
            className={`${styles.bookmark} ${isSaved ? styles.saved : ""}`}
            onClick={toggleSave}
          >
            <FaBookmark/>
          </button>
        </div>
        
        <h1>7-Day Forecast for {city}, {country}</h1>
        <ul className={styles.forecastList}>
          {weather.time.map((date, idx) => (
            <li key={date} className={styles.forecastItem}>
              <span className={styles.date}>{date}</span>
              
              <img
                src={getWeatherIcon(weather.weathercode[idx])}
                alt="weather icon"
                className={styles.icon}
              />

              <span className={styles.temp}>
                Min {weather.temperature_2m_min[idx]}°C | Max {weather.temperature_2m_max[idx]}°C
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}