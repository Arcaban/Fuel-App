/** Waze: opens app / web with drive to destination (user location → station) */
export const buildWazeNavigateUrl = (lat: number, lng: number): string =>
  `https://waze.com/ul?ll=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&navigate=yes`;

/** Google Maps directions to destination */
export const buildGoogleMapsDirectionsUrl = (lat: number, lng: number): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;

export const openExternal = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
