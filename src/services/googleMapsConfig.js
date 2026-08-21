// Source: Google Maps Platform Code Assist
// Google Maps Configuration & Key Management Service for SMART TABLE

const STORAGE_KEY = 'smarttable_gmaps_key';

// Default India geographic center (fallback only — real center comes from user GPS)
export const DEFAULT_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629
};

export const DEFAULT_MAP_ZOOM = 5; // Zoomed out to show India when no user location is available
export const DEFAULT_MAP_ID = 'DEMO_MAP_ID';
export const USAGE_ATTRIBUTION_ID = 'gmp_git_agentskills_v1';

const DEFAULT_API_KEY = '';

/**
 * Retrieves the currently active Google Maps API Key from environment or local storage.
 * @returns {string} The active API key or default fallback
 */
export const getGoogleMapsApiKey = () => {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  const storedKey = localStorage.getItem(STORAGE_KEY);
  if (storedKey && storedKey.trim().length > 0) {
    return storedKey.trim();
  }
  return DEFAULT_API_KEY;
};

/**
 * Saves a user-provided Google Maps API Key or Demo Key to local storage.
 * @param {string} key
 */
export const setGoogleMapsApiKey = (key) => {
  if (!key || key.trim().length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
};

/**
 * Checks if a Google Maps API Key is configured.
 * @returns {boolean}
 */
export const hasGoogleMapsApiKey = () => {
  const key = getGoogleMapsApiKey();
  return Boolean(key && key.length > 5);
};
