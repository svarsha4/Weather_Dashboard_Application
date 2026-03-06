'use client';

import { useRouter } from 'next/navigation';

import styles from './dashboard-search.module.css';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  // Being able to use the logged in user's info
  const userEmail = typeof window !== 'undefined' 
  ? localStorage.getItem('loggedInEmail') 
  : null;
  
  const router = useRouter();
  // Stores the country and city that the user selects and enters into the search engine
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  // Used for providing suggestions to the user as they type in the country and city search bars
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  // Used for showing and hiding the suggestions dropdowns for both the country and city search bars
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Used for disabling the search button if either the country or city is not selected or entered
  const isSearchDisabled = !country || !city;

  // Used for storing the user's saved search results (i.e. country and city names that led to the search result)
  const [savedLocations, setSavedLocations] = useState([]);

  useEffect(() => {
    // Don't show country suggestions until the user has entered 
    // at least 2 characters to avoid overwhelming them with too many options
    if (country.length < 2) {
      setCountrySuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      // Fetches country suggestions from the Nominatim API based on the user's input in the country search bar
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?country=${country}&format=json&limit=5`
      );
      const data = await res.json();
      setCountrySuggestions(data);
    }, 500);

    return () => clearTimeout(timeout);
  }, [country]);

  useEffect(() => {
    // Don't show city suggestions until the user has entered 
    // at least 2 characters and has selected a country
    if (city.length < 2 || !country) {
      setCitySuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      // Fetches city suggestions from the Nominatim API based on the user's input in the city search bar and the selected country
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json&limit=5`
      );
      const data = await res.json();
      setCitySuggestions(data);
    }, 500);

    return () => clearTimeout(timeout);
  }, [city, country]);

  useEffect(() => {
    const fetchSaved = async () => {
      const res = await fetch(`/api/save/get-saved-result?email=${encodeURIComponent(userEmail)}`)
      const data = await res.json();
      setSavedLocations(data);
    };

    fetchSaved();

    const handleFocus = () => {
      fetchSaved();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };

  }, [userEmail]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(
      `/dashboard/result?country=${encodeURIComponent(country.trim())}&city=${encodeURIComponent(city.trim())}`
    );
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.logoutButton}
        onClick={() => router.push('/login')}
      >
        Logout
      </button>

      <div className={styles.layout}>
        
        {/* Saved Locations Card */}
        <div className={styles.savedCard}>
          <h2>Saved Locations</h2>

          {savedLocations.length === 0 && (
            <p className={styles.empty}>No saved locations</p>
          )}

          {savedLocations.map((loc, index) => (
            <div
              key={index}
              className={styles.savedItem}
              onClick={() =>
                router.push(
                  `/dashboard/result?country=${loc.country}&city=${loc.city}`
                )
              }
            >
              {loc.city}, {loc.country}
            </div>
          ))}
        </div>


        {/* Search Card */}
        <div className={styles.card}>
          <h1>Weather Forecast For Anywhere</h1>
          <p className={styles.subtitle}>
            Search for weather by country and city
          </p>

          <form onSubmit={handleSearch}>

            {/* Country Input */}
            <div className={styles.autocompleteWrapper}>
              <input
                type="text"
                placeholder="Enter Country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setShowCountrySuggestions(true);
                }}
                className={styles.input}
                required
              />

              {showCountrySuggestions && countrySuggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {countrySuggestions.map((item) => (
                    <li
                      key={item.place_id}
                      onClick={() => {
                        setCountry(item.display_name.split(',')[0]);
                        setShowCountrySuggestions(false);
                        setCountrySuggestions([]);
                      }}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* City Input */}
            <div className={styles.autocompleteWrapper}>
              <input
                type="text"
                placeholder="Enter City"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCitySuggestions(true);
                }}
                className={styles.input}
                required
              />

              {showCitySuggestions && citySuggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {citySuggestions.map((item) => (
                    <li
                      key={item.place_id}
                      onClick={() => {
                        setCity(item.display_name.split(',')[0]);
                        setShowCitySuggestions(false);
                        setCitySuggestions([]);
                      }}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={isSearchDisabled}
            >
              Search
            </button>

          </form>
        </div>

      </div>

      
    
    </div>
  );
}