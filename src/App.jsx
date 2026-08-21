import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { RestaurantCard } from './components/Customer/RestaurantCard';
import { OsmRestaurantCard } from './components/Customer/OsmRestaurantCard';
import { RestaurantMapView } from './components/Customer/RestaurantMapView';
import { AiPredictorModal } from './components/Customer/AiPredictorModal';
import { ReservationModal } from './components/Customer/ReservationModal';
import { MyReservationsModal } from './components/Customer/MyReservationsModal';
import { MenuModal } from './components/Customer/MenuModal';
import { CrowdWaitModal } from './components/Customer/CrowdWaitModal';
import { PayBillModal } from './components/Customer/PayBillModal';
import { QuickPayModal } from './components/Customer/QuickPayModal';
import { RegisterRestaurantModal } from './components/Customer/RegisterRestaurantModal';
import { AuthModal } from './components/Auth/AuthModal';
import { CustomerLoginPage } from './components/Auth/CustomerLoginPage';
import { OwnerLoginPage } from './components/Auth/OwnerLoginPage';
import { PlatformAdminLoginPage } from './components/Auth/PlatformAdminLoginPage';
import { UnifiedLandingLoginPage } from './components/Auth/UnifiedLandingLoginPage';
import { CustomerRegisterPage } from './components/Auth/CustomerRegisterPage';
import { OwnerRegisterPage } from './components/Auth/OwnerRegisterPage';
import { LandingPage } from './components/Landing/LandingPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SuperAdminDashboard } from './components/Admin/SuperAdminDashboard';
import { RestaurantApprovalsAdmin } from './components/Admin/RestaurantApprovalsAdmin';
import { NotificationToast } from './components/NotificationToast';
import { 
  Search, 
  Filter, 
  Bot, 
  Sparkles, 
  Zap, 
  Users, 
  MapPin, 
  CalendarCheck,
  Building2,
  ChevronRight,
  ShieldCheck,
  Store,
  UtensilsCrossed,
  Flame,
  Clock,
  Navigation,
  Compass,
  ArrowUpDown,
  Hourglass,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';

import { calculateDistanceKm, formatDistance } from './utils/geoUtils';
import { useRealDistance } from './hooks/useRealDistance';

const MainContent = () => {
  const navigate = useNavigate();
  const { 
    viewMode, 
    restaurants, 
    osmRestaurants,
    isOsmLoading,
    osmFetchError,
    fetchNearbyRestaurants,
    searchQuery,
    setSearchQuery,
    partySizeFilter,
    setPartySizeFilter,
    crowdFilter,
    setCrowdFilter,
    setAiPredictorOpen,
    setBookingModalOpen,
    crowdWaitModalOpen,
    setCrowdWaitModalOpen,
    crowdRadarRestaurant,
    openCrowdRadar,
    triggerToast,
    setRegisterRestaurantModalOpen,
    user,
    fetchLiveBackendData
  } = useApp();

  const [selectedCity, setSelectedCity] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'wait' | 'rating'
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' | 'map'
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: 13.0827,
    lng: 80.2707,
    name: 'Chennai',
    shortName: 'Chennai',
    label: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    isLiveGps: false
  });
  const [lastFetchedLocation, setLastFetchedLocation] = useState(null);
  const watchIdRef = React.useRef(null);

  // Hook for Google Maps Distance Matrix driving distances with 15m client-side cache
  const { 
    distances, 
    isLoading: isDistanceLoading, 
    referenceLabel 
  } = useRealDistance(userLocation, restaurants);

  // Reverse Geocode Latitude/Longitude to readable address using Google Maps Geocoding API
  const reverseGeocode = async (lat, lng) => {
    try {
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!GOOGLE_API_KEY) return { label: 'your location', city: 'Current Location' };

      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Try to find locality and city
        let locality = '';
        let city = '';
        const addressComponents = data.results[0].address_components;
        
        addressComponents.forEach(component => {
          if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
            if (!locality) locality = component.short_name;
          }
          if (component.types.includes('locality')) {
            city = component.short_name;
          }
        });

        // Fallback to formatted address chunk if parsing fails
        if (!locality && !city) {
            return { label: data.results[0].formatted_address.split(',')[0], city: 'Current Location' };
        }

        return { 
          label: locality ? `${locality}` : 'your location', 
          city: city || 'Current Location' 
        };
      }
    } catch (e) {
      console.warn("Reverse geocoding failed", e);
    }
    return { label: 'your location', city: 'Current Location' };
  };

  // Real GPS Geolocation Detection with continuous monitoring
  const handleDetectLocation = () => {
    if (watchIdRef.current) return; // Already watching

    setIsLocating(true);
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          setIsLocating(false);
          const { latitude, longitude } = position.coords;
          
          // Check if user has moved significantly (> 500 meters) before fetching again
          let shouldFetch = false;
          setLastFetchedLocation(prev => {
             if (!prev) {
               shouldFetch = true;
               return { lat: latitude, lng: longitude };
             }
             const distanceMoved = calculateDistanceKm(prev.lat, prev.lng, latitude, longitude);
             if (distanceMoved > 0.5) { // 500 meters
               shouldFetch = true;
               return { lat: latitude, lng: longitude };
             }
             return prev;
          });

          const geoInfo = await reverseGeocode(latitude, longitude);

          setUserLocation({
            lat: latitude,
            lng: longitude,
            name: 'Your Location',
            shortName: geoInfo.label,
            label: `${geoInfo.label}, ${geoInfo.city}`,
            city: geoInfo.city,
            isLiveGps: true
          });
          
          setSortBy('distance');
          
          if (shouldFetch) {
            triggerToast(
              'GPS Location Acquired 📍',
              `Showing restaurants near ${geoInfo.label}, ${geoInfo.city}.`,
              'info'
            );
            // Fetch SMARTTABLE MySQL restaurants
            fetchLiveBackendData(latitude, longitude);
            // Fetch combined SMARTTABLE + OSM nearby (throttled inside fetchNearbyRestaurants)
            fetchNearbyRestaurants(latitude, longitude, true);
          }
        },
        (error) => {
          setIsLocating(false);
          // Only unset location if we don't have one already
          setUserLocation(prev => prev || {
            lat: 13.0827,
            lng: 80.2707,
            name: 'Chennai',
            shortName: 'Chennai',
            label: 'Chennai, Tamil Nadu',
            city: 'Chennai',
            isLiveGps: false
          }); 
          setSortBy('rating');
          let errorMessage = 'GPS permission not granted.';
          if (error.code === error.POSITION_UNAVAILABLE) errorMessage = 'Location information is unavailable.';
          else if (error.code === error.TIMEOUT) errorMessage = 'The request to get user location timed out.';
          
          triggerToast(
            'Location Alert 📍',
            `${errorMessage} Using Chennai fallback location.`,
            'info'
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
      watchIdRef.current = id;
    } else {
      setIsLocating(false);
      setUserLocation({
        lat: 13.0827,
        lng: 80.2707,
        name: 'Chennai',
        shortName: 'Chennai',
        label: 'Chennai, Tamil Nadu',
        city: 'Chennai',
        isLiveGps: false
      });
      triggerToast('Geolocation Not Supported', 'Your browser does not support geolocation. Using Chennai fallback.', 'info');
    }
  };

  React.useEffect(() => {
    if (viewMode === 'customer' && (!userLocation || !userLocation.isLiveGps)) {
      handleDetectLocation();
    }
    
    // Cleanup watch on unmount
    return () => {
       if (watchIdRef.current) {
         navigator.geolocation.clearWatch(watchIdRef.current);
         watchIdRef.current = null;
       }
    };
  }, [viewMode]);

  // If user is not logged in, display the new Keyvo-inspired Landing Page
  if (!user?.isLoggedIn) {
    return <LandingPage />;
  }


  // Compute accurate real-time distance for each hotel using real Google Maps Driving Distance Matrix
  const restaurantsWithDistance = restaurants.map(rest => {
    const distEntry = distances[rest.id];
    let computedDist = distEntry?.distanceKm ?? rest.distanceKm;
    if (computedDist == null && userLocation?.lat && userLocation?.lng && rest.lat && rest.lng) {
      computedDist = calculateDistanceKm(userLocation.lat, userLocation.lng, rest.lat, rest.lng);
    }
    return {
      ...rest,
      distanceKm: computedDist,
      distanceInfo: distEntry
    };
  });

  // Filter restaurants
  let filteredRestaurants = restaurantsWithDistance.filter(rest => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = rest.name.toLowerCase().includes(q);
      const matchCuisine = rest.cuisine.toLowerCase().includes(q);
      const matchLoc = rest.location.toLowerCase().includes(q);
      const matchTags = rest.cuisineHighlights && rest.cuisineHighlights.some(h => h.toLowerCase().includes(q));
      if (!matchName && !matchCuisine && !matchLoc && !matchTags) return false;
    }



    // Cuisine filter
    if (cuisineFilter !== 'all') {
      if (cuisineFilter === 'pure_veg') {
        if (!rest.isPureVeg && !rest.cuisine.toLowerCase().includes('vegetarian')) return false;
      } else if (cuisineFilter === 'south_indian') {
        const isSouth = rest.cuisine.toLowerCase().includes('south indian') || rest.cuisine.toLowerCase().includes('thali');
        if (!isSouth) return false;
      } else if (cuisineFilter === 'biryani_mughlai') {
        const isBiryani = rest.cuisine.toLowerCase().includes('biryani') || rest.cuisine.toLowerCase().includes('mughlai') || rest.cuisine.toLowerCase().includes('buffet');
        if (!isBiryani) return false;
      } else if (cuisineFilter === 'chettinad_grill') {
        const isChettinad = rest.cuisine.toLowerCase().includes('chettinad') || rest.cuisine.toLowerCase().includes('grill') || rest.cuisine.toLowerCase().includes('bar');
        if (!isChettinad) return false;
      } else if (cuisineFilter === 'indo_chinese') {
        const isAsian = rest.cuisine.toLowerCase().includes('chinese') || rest.cuisine.toLowerCase().includes('asian');
        if (!isAsian) return false;
      } else if (cuisineFilter === 'artisanal_cafe') {
        const isCafe = rest.cuisine.toLowerCase().includes('cafe') || rest.cuisine.toLowerCase().includes('brunch');
        if (!isCafe) return false;
      }
    }

    if (crowdFilter !== 'all' && rest.crowdLevel !== crowdFilter) return false;

    if (partySizeFilter !== 'all') {
      const cap = Number(partySizeFilter);
      const hasCapTable = rest.tables && rest.tables.some(t => t.capacity >= cap && t.status === 'available');
      if (!hasCapTable) return false;
    }

    return true;
  });

  // Sort
  filteredRestaurants.sort((a, b) => {
    if (sortBy === 'distance') {
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'wait') {
      const waitOrder = { low: 1, medium: 2, high: 3 };
      return (waitOrder[a.crowdLevel] || 2) - (waitOrder[b.crowdLevel] || 2);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans antialiased">
      
      {/* Sticky App Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* CUSTOMER / DINER VIEW */}
        {viewMode === 'customer' ? (
          <>
            {/* Hero Banner with Live Table Vacancy & Crowd Telemetry Highlights */}
            <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs overflow-hidden">
              <div className="relative z-10 max-w-3xl space-y-3">
                
                <div className="inline-block">
                  <span className="badge-clean badge-low">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LIVE TABLE VACANCY & FOOD PRE-ORDERS</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Check live table availability & reserve with zero waiting.
                </h2>

                <p className="text-slate-600 mt-2 max-w-2xl font-medium leading-relaxed">
                  Discover {userLocation?.city ? `${userLocation.city}'s` : 'the'} finest dining restaurants with real-time free table counts and wait time forecasts. Pick your table, pre-order your favorite dishes, and get seated instantly with your digital entry pass!
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="btn-primary text-xs h-10 px-4"
                  >
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    <span>Book Table & Pre-Order Food</span>
                  </button>

                  <button
                    onClick={() => openCrowdRadar()}
                    className="btn-secondary text-xs h-10 px-4"
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Live Crowd & Wait Radar</span>
                  </button>

                  <button
                    onClick={handleDetectLocation}
                    className="btn-secondary text-xs h-10 px-4"
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-slate-400' : 'text-emerald-600'}`} />
                    <span>{isLocating ? 'Locating...' : 'Near Me Radar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hyperlocal Search, Filters & Sorting Controls */}
            <div className="space-y-4">
              
              {/* Top Controls Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by restaurant, cuisine, or dish (Dosa, Biryani, Thali, Chettinad, Lobster)..."
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-xs font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* City, Party Size, Sort & Crowd Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  


                  {/* Party Size Filter */}
                  <div className="flex items-center p-0.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                    <Users className="w-3.5 h-3.5 text-slate-600 ml-2.5" />
                    <select
                      value={partySizeFilter}
                      onChange={(e) => setPartySizeFilter(e.target.value)}
                      className="bg-transparent text-slate-800 px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="all">Any Party</option>
                      <option value="2">2+ Guests (Couples)</option>
                      <option value="4">4+ Guests (Family)</option>
                      <option value="6">6+ Guests (Groups)</option>
                    </select>
                  </div>

                  {/* Sort Selector */}
                  <div className="flex items-center p-0.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 ml-2.5" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-slate-800 px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="distance">Nearest First</option>
                      <option value="wait">Shortest Wait</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>

                  {/* Crowd Level Filter Pills */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                    {['all', 'low', 'medium', 'high'].map(level => (
                      <button
                        key={level}
                        onClick={() => setCrowdFilter(level)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          crowdFilter === level
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  {/* View Mode Switcher: Grid Cards vs Google Maps Radar */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <button
                      onClick={() => setDisplayMode('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        displayMode === 'grid'
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Grid Cards View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cards</span>
                    </button>

                    <button
                      onClick={() => setDisplayMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        displayMode === 'map'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Interactive Google Maps Radar View"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Map</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Indian Cuisines Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Cuisines 🍽️' },
                  { id: 'pure_veg', label: '100% Pure Veg 🌿' },
                  { id: 'south_indian', label: 'South Indian Tasting 🍃' },
                  { id: 'biryani_mughlai', label: 'Biryani & Mughlai 🥘' },
                  { id: 'chettinad_grill', label: 'Chettinad & Grills 🌶️' },
                  { id: 'indo_chinese', label: 'Indo-Chinese & Asian 🥢' },
                  { id: 'artisanal_cafe', label: 'Artisanal Cafe & Brunch ☕' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCuisineFilter(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      cuisineFilter === c.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
                    }`}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Status Subtitle showing telemetry & nearest restaurant */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  <span>
                    Showing <strong className="text-slate-900">{filteredRestaurants.length}</strong> SMARTTABLE
                    {osmRestaurants.length > 0 && <> + <strong className="text-blue-600">{osmRestaurants.length}</strong> nearby</>} restaurants
                    {cuisineFilter !== 'all' && ` (${cuisineFilter.replace('_', ' ').toUpperCase()})`}
                  </span>
                  <span className="text-slate-300">•</span>
                  {userLocation && (
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className={`w-2 h-2 rounded-full ${userLocation.isLiveGps ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      <span>Distance calculated from: <strong className="text-slate-900">{referenceLabel}</strong></span>
                      {isDistanceLoading && (
                        <span className="text-[10px] text-slate-400 font-mono animate-pulse">(updating routes...)</span>
                      )}
                    </span>
                  )}
                  {!userLocation && (
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Location required for distance calculation</span>
                    </span>
                  )}
                </div>

                {/* OSM loading indicator */}
                {isOsmLoading && (
                  <span className="flex items-center gap-1.5 text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Searching nearby restaurants...
                  </span>
                )}
                {osmFetchError && (
                  <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                    {osmFetchError}
                  </span>
                )}

                {filteredRestaurants.length > 0 && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    Nearest: {filteredRestaurants[0].name.split('-')[0]} (
                    {distances[filteredRestaurants[0].id]?.distanceText || 
                     (filteredRestaurants[0].distanceKm < 1 
                       ? `${Math.round(filteredRestaurants[0].distanceKm * 1000)} m`
                       : `${filteredRestaurants[0].distanceKm.toFixed(1)} km`)}
                    {distances[filteredRestaurants[0].id]?.durationMins ? ` • ${distances[filteredRestaurants[0].id].durationMins}m drive` : ''})
                  </span>
                )}
              </div>

              {/* Render Either Google Maps Radar View or Restaurant Cards Grid */}
              {displayMode === 'map' ? (
                <RestaurantMapView
                  restaurants={filteredRestaurants}
                  userLocation={userLocation}
                  onDetectLocation={handleDetectLocation}
                  isLocating={isLocating}
                />
              ) : (
                <>
                  {filteredRestaurants.length === 0 && osmRestaurants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-100 shadow-sm mt-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        {isLocating || isOsmLoading ? (
                          <Navigation className="w-8 h-8 text-emerald-500 animate-spin" />
                        ) : !userLocation ? (
                          <MapPin className="w-8 h-8 text-rose-400" />
                        ) : (
                          <MapPin className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      {isLocating ? (
                        <>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Detecting Your Location...</h3>
                          <p className="text-slate-500 max-w-md">Please allow location access so we can find restaurants near you.</p>
                        </>
                      ) : isOsmLoading ? (
                        <>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Searching Nearby Restaurants...</h3>
                          <p className="text-slate-500 max-w-md">Looking for restaurants in your area via OpenStreetMap...</p>
                        </>
                      ) : !userLocation ? (
                        <>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Location Required</h3>
                          <p className="text-slate-500 max-w-md mb-4">
                            SMARTTABLE needs your location to show nearby restaurants. Please allow location access in your browser and try again.
                          </p>
                          <button
                            onClick={handleDetectLocation}
                            className="btn-primary text-xs h-10 px-5"
                          >
                            <Navigation className="w-4 h-4" />
                            <span>Enable Location Access</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Restaurants Found Nearby</h3>
                          <p className="text-slate-500 max-w-md">
                            We couldn't find any restaurants within 15km of your location.
                            Check back later as we expand our network across India!
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* SMARTTABLE Partner Restaurants */}
                      {filteredRestaurants.length > 0 && (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                            {filteredRestaurants.map(rest => (
                              <RestaurantCard 
                                key={rest.id} 
                                restaurant={rest} 
                                distanceInfo={distances[rest.id]}
                                referenceLabel={referenceLabel}
                                isDistanceLoading={isDistanceLoading}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* OSM-only Nearby Restaurants (not SMARTTABLE partners) */}
                      {osmRestaurants.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 px-1">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <h2 className="text-sm font-bold text-slate-700">More Restaurants Nearby</h2>
                            <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              via OpenStreetMap · live data unavailable
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {osmRestaurants.map(rest => (
                              <OsmRestaurantCard
                                key={rest.id}
                                restaurant={rest}
                                isDistanceLoading={isOsmLoading}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : viewMode === 'superadmin' || viewMode === 'approvals' ? (
          /* PLATFORM SUPER ADMIN: USER DIRECTORY, OWNER GOVERNANCE, APPROVALS & DISPUTES */
          <SuperAdminDashboard />
        ) : (
          /* RESTAURANT OWNER / ADMIN CONSOLE */
          <AdminDashboard />
        )}

      </main>

      {/* Modals & Overlays */}
      <AiPredictorModal />
      <CrowdWaitModal 
        isOpen={crowdWaitModalOpen} 
        onClose={() => setCrowdWaitModalOpen(false)} 
        restaurantOverride={crowdRadarRestaurant}
      />
      <ReservationModal />
      <MyReservationsModal />
      <MenuModal />
      <PayBillModal />
      <QuickPayModal />
      <RegisterRestaurantModal />
      <NotificationToast />

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 md:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
              ST
            </div>
            <span className="font-bold text-slate-900">SmartTable</span>
            <span>•</span>
            <span className="text-slate-500">Real-Time Table Telemetry & Dining Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <button
              onClick={() => navigate('/register/owner')}
              className="text-slate-900 hover:text-emerald-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Partner with Us / Register Restaurant</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppErrorBoundary context="Auth / Routes">
        <Routes>
          <Route path="/login" element={<UnifiedLandingLoginPage />} />
          <Route path="/login/customer" element={<CustomerLoginPage />} />
          <Route path="/login/owner" element={<OwnerLoginPage />} />
          <Route path="/login/admin" element={<PlatformAdminLoginPage />} />
          <Route path="/register/user" element={<CustomerRegisterPage />} />
          <Route path="/signup/diner" element={<CustomerRegisterPage />} />
          <Route path="/register/diner" element={<CustomerRegisterPage />} />
          <Route path="/register/owner" element={<OwnerRegisterPage />} />
          <Route path="/signup/owner" element={<OwnerRegisterPage />} />
          <Route path="/register/partner" element={<OwnerRegisterPage />} />
          <Route path="/*" element={
            <AppErrorBoundary context="Main Dashboard">
              <MainContent />
            </AppErrorBoundary>
          } />
        </Routes>
      </AppErrorBoundary>
    </AppProvider>
  );
}

export default App;

