// Utility for Geolocation and Accurate Distance Calculations



/**
 * Calculates the great-circle straight-line distance between two coordinates in km using the Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number|null} Distance in kilometers
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 10) {
    return Math.round(distance * 10) / 10;
  }
  return Math.round(distance);
};

/**
 * Formats a distance in kilometers to a clean, user-friendly string
 * @param {number} distKm Distance in kilometers
 * @returns {string|null} Formatted string like "800 m", "1.4 km", "10 km"
 */
export const formatDistance = (distKm) => {
  if (distKm == null || isNaN(distKm)) return null;
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m`;
  }
  if (distKm < 10) {
    return `${distKm.toFixed(1)} km`;
  }
  return `${Math.round(distKm).toLocaleString()} km`;
};

/**
 * Formats travel duration in minutes into a clean string like "8 min drive" or "1 hr 12 min"
 * @param {number} durationMins Duration in minutes
 * @returns {string|null}
 */
export const formatDuration = (durationMins) => {
  if (durationMins == null || isNaN(durationMins)) return null;
  if (durationMins < 1) return '< 1 min drive';
  if (durationMins < 60) return `${Math.round(durationMins)} min drive`;
  const hrs = Math.floor(durationMins / 60);
  const mins = Math.round(durationMins % 60);
  return mins > 0 ? `${hrs} hr ${mins} min drive` : `${hrs} hr drive`;
};
