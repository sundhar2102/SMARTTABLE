import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Clock, 
  Users, 
  Flame, 
  CalendarCheck, 
  UtensilsCrossed, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, TILE_LAYERS } from '../../services/mapConfig';

// Helper component to center/re-pan map when selected city or coordinates change
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !center) return;
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [map, center, zoom]);
  return null;
};

// Create custom animated Leaflet DivIcon for restaurants based on crowd level
const createRestaurantIcon = (restaurant, isSelected) => {
  const colors = {
    low: { bg: '#059669', border: '#34d399', ring: 'rgba(16, 185, 129, 0.4)', text: '#0f5128' },
    medium: { bg: '#d97706', border: '#fbbf24', ring: 'rgba(245, 158, 11, 0.4)', text: '#78350f' },
    high: { bg: '#e11d48', border: '#f43f5e', ring: 'rgba(225, 29, 72, 0.4)', text: '#881337' }
  };

  const crowd = colors[restaurant.crowdLevel] || colors.medium;
  const freeTables = restaurant.tables ? restaurant.tables.filter(t => t.status === 'available').length : 0;

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
      <!-- Animated Crowd Pulse Ring -->
      <div class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${crowd.ring};"></div>
      
      <!-- Pin Body -->
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg text-white border-2 font-bold text-xs" style="background-color: ${crowd.bg}; border-color: ${crowd.border};">
        <span class="text-[11px] font-black">${freeTables}</span>
      </div>

      <!-- Arrow Pointer -->
      <div class="absolute -bottom-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style="border-t-color: ${crowd.bg};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-restaurant-pin',
    iconSize: [40, 46],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42]
  });
};

// Create custom user location GPS pin
const createUserGpsIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute -inset-3 rounded-full bg-gray-500/30 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px]">
        📍
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-user-gps-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
};

export const RestaurantMapView = ({ 
  restaurants = [], 
  userLocation, 
  onDetectLocation, 
  isLocating 
}) => {
  const { 
    setSelectedRestaurantId, 
    setBookingModalOpen, 
    setMenuModalOpen, 
    openCrowdRadar 
  } = useApp();

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeTileLayer, setActiveTileLayer] = useState('voyager'); // 'voyager' | 'osm'

  const centerCoords = (userLocation?.lat && userLocation?.lng)
    ? [userLocation.lat, userLocation.lng]
    : DEFAULT_MAP_CENTER;

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-gray-200/90 shadow-md bg-gray-100 flex flex-col">
      
      {/* Top Floating Map Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-bold text-slate-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Radar • <strong>{restaurants.length}</strong> Restaurants</span>
        </div>

        {/* Right Controls: Locating & Tile Switcher */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          {/* Tile Layer Toggle */}
          <button
            onClick={() => setActiveTileLayer(prev => prev === 'voyager' ? 'osm' : 'voyager')}
            className="btn-secondary text-xs h-8 px-2.5 shadow-xs"
            title="Toggle Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{activeTileLayer === 'voyager' ? 'Voyager View' : 'OSM Standard'}</span>
          </button>

          {/* Near Me GPS Button */}
          <button
            onClick={onDetectLocation}
            className="btn-primary text-xs h-8 px-3 shadow-xs"
            title="Locate my GPS on map"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={centerCoords}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={centerCoords} zoom={DEFAULT_MAP_ZOOM} />

        {/* Selected Tile Layer (CARTO Voyager or OpenStreetMap) */}
        <TileLayer
          url={TILE_LAYERS[activeTileLayer].url}
          attribution={TILE_LAYERS[activeTileLayer].attribution}
          maxZoom={TILE_LAYERS[activeTileLayer].maxZoom}
        />

        {/* User Location Marker */}
        {userLocation?.lat && userLocation?.lng && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={createUserGpsIcon()}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 text-xs font-sans">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span>📍 Reference Position</span>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  {userLocation.label || userLocation.name || 'Your Location'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Restaurant Markers */}
        {restaurants.map((rest) => {
          if (!rest.lat || !rest.lng) return null;
          const isSelected = selectedRestaurant?.id === rest.id;
          const freeTables = rest.tables ? rest.tables.filter(t => t.status === 'available').length : 0;
          const totalTables = rest.tables ? rest.tables.length : 5;

          const distLabel = rest.distanceInfo?.distanceText || 
            (rest.distanceKm != null ? `${rest.distanceKm} km` : null);

          return (
            <Marker
              key={rest.id}
              position={[rest.lat, rest.lng]}
              icon={createRestaurantIcon(rest, isSelected)}
              eventHandlers={{
                click: () => setSelectedRestaurant(rest)
              }}
            >
              <Popup className="custom-leaflet-popup" minWidth={280} maxWidth={320}>
                <div className="p-1 text-slate-900 space-y-2.5 font-sans">
                  
                  {/* Image & Badges */}
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img 
                      src={rest.image} 
                      alt={rest.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/95 text-slate-900 border border-slate-200 shadow-xs">
                      {rest.crowdLevel?.toUpperCase()} CROWD
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 border border-slate-200 shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {rest.rating}
                    </span>
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {rest.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {rest.cuisine} • {rest.priceRange}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      📍 {rest.location}
                    </p>
                  </div>

                  {/* Live Table Vacancy & Distance Pills */}
                  <div className="flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span>{freeTables} / {totalTables} Free Tables</span>
                    </div>
                    {distLabel && (
                      <div className="text-slate-700 font-bold flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        <span>{distLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedRestaurantId(rest.id);
                        setBookingModalOpen(true);
                      }}
                      className="btn-primary text-xs h-8 px-2"
                    >
                      <CalendarCheck className="w-3 h-3 text-emerald-400" />
                      <span>Book</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRestaurantId(rest.id);
                        setMenuModalOpen(true);
                      }}
                      className="btn-secondary text-xs h-8 px-2"
                    >
                      <UtensilsCrossed className="w-3 h-3 text-slate-600" />
                      <span>Menu</span>
                    </button>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low Wait</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Moderate</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>High Demand</span>
        </span>
      </div>

    </div>
  );
};

