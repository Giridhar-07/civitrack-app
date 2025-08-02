// Utility functions for geospatial calculations

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Convert latitude and longitude from degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate bounding box for a given point and radius
 * @param latitude Center latitude in degrees
 * @param longitude Center longitude in degrees
 * @param radiusKm Radius in kilometers
 * @returns Bounding box as [minLat, minLon, maxLat, maxLon]
 */
export const calculateBoundingBox = (latitude: number, longitude: number, radiusKm: number): [number, number, number, number] => {
  // Approximate degrees latitude per km
  const latRadian = toRadians(latitude);
  const degLatPerKm = 1 / 111.32; // 1 degree latitude is approximately 111.32 km
  const degLonPerKm = 1 / (111.32 * Math.cos(latRadian)); // 1 degree longitude depends on latitude
  
  const latDelta = radiusKm * degLatPerKm;
  const lonDelta = radiusKm * degLonPerKm;
  
  return [
    latitude - latDelta,
    longitude - lonDelta,
    latitude + latDelta,
    longitude + lonDelta
  ];
};