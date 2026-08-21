// Open-Source Modern Map Configuration (OpenStreetMap / CARTO Tiles)
// 100% Free, Zero API Keys Required

export const DEFAULT_MAP_CENTER = [20.5937, 78.9629]; // India geographic center (fallback only)
export const DEFAULT_MAP_ZOOM = 5; // Start zoomed out to show India when no user location is available

export const TILE_LAYERS = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }
};
