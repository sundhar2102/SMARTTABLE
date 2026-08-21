import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDrivingDistances, getCachedDistance } from '../services/distanceService';

/**
 * Custom React hook for fetching, caching and reacting to real Google Maps driving distances
 * @param {Object} origin { lat: number, lng: number, label?: string, isLiveGps?: boolean }
 * @param {Array} restaurants Array of restaurant objects with { id, lat, lng }
 * @returns {Object} { distances, isLoading, isLiveGps, referenceLabel, refreshDistances }
 */
export const useRealDistance = (origin, restaurants = []) => {
  const [distances, setDistances] = useState(() => {
    // Synchronously populate with whatever is already in cache
    const initial = {};
    if (origin?.lat && origin?.lng && Array.isArray(restaurants)) {
      restaurants.forEach(r => {
        const cached = getCachedDistance(origin, r);
        if (cached) {
          initial[r.id] = cached;
        }
      });
    }
    return initial;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshDistances = useCallback(async () => {
    if (!origin?.lat || !origin?.lng || !Array.isArray(restaurants) || restaurants.length === 0) {
      return;
    }

    // Check how many destinations are already cached
    const uncached = restaurants.filter(r => r.lat && r.lng && !getCachedDistance(origin, r));
    if (uncached.length > 0) {
      setIsLoading(true);
    }
    setIsError(false);

    try {
      const results = await fetchDrivingDistances(origin, restaurants);
      if (isMounted.current) {
        setDistances(prev => ({ ...prev, ...results }));
        setIsLoading(false);

        // Required diagnostic logs
        console.log(`[LOCATION] User latitude: ${origin.lat}`);
        console.log(`[LOCATION] User longitude: ${origin.lng}`);
        restaurants.forEach(rest => {
          if (results[rest.id]) {
            console.log(`[RESTAURANT] Restaurant name: ${rest.name}`);
            console.log(`[RESTAURANT] Latitude: ${rest.lat}`);
            console.log(`[RESTAURANT] Longitude: ${rest.lng}`);
            console.log(`[DISTANCE] Calculated distance: ${results[rest.id].distanceText}`);
          }
        });
      }
    } catch (err) {
      console.warn('useRealDistance hook error:', err);
      if (isMounted.current) {
        setIsError(true);
        setIsLoading(false);
      }
    }
  }, [origin?.lat, origin?.lng, restaurants]);

  useEffect(() => {
    refreshDistances();
  }, [refreshDistances]);



  // Clean human-readable reference label
  const referenceLabel = origin?.isLiveGps 
    ? 'your location' 
    : (origin?.label || origin?.name || 'your location');

  return {
    distances,
    isLoading,
    isError,
    referenceLabel,
    isLiveGps: Boolean(origin?.isLiveGps),
    refreshDistances
  };
};
