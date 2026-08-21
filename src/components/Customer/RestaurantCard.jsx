import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  MapPin, 
  Star, 
  Clock, 
  ArrowRight, 
  LayoutGrid, 
  Flame, 
  Navigation, 
  ExternalLink, 
  Leaf, 
  ShoppingBag
} from 'lucide-react';

export const RestaurantCard = ({ 
  restaurant, 
  distanceInfo = null, 
  referenceLabel = 'your location',
  isDistanceLoading = false 
}) => {
  const { 
    setSelectedRestaurantId, 
    setMenuModalOpen, 
    setBookingModalOpen, 
    openCrowdRadar, 
    getEstimatedWaitTime
  } = useApp();

  const totalTables = restaurant.tables ? restaurant.tables.length : 5;
  const freeTables = restaurant.tables ? restaurant.tables.filter(t => t.status === 'available').length : 0;
  const waitInfo = getEstimatedWaitTime(restaurant.id, 2);

  const resolvedDistance = distanceInfo || (restaurant.distanceKm != null ? {
    distanceKm: restaurant.distanceKm,
    distanceText: `${restaurant.distanceKm} km`,
    durationMins: null,
    durationText: null,
    isRealDriving: false,
    status: 'loaded'
  } : null);

  const crowdBadges = {
    low: { class: 'badge-low', label: 'LOW CROWD', dot: 'bg-emerald-500' },
    medium: { class: 'badge-medium', label: 'MODERATE', dot: 'bg-amber-500' },
    high: { class: 'badge-high', label: 'HIGH CROWD', dot: 'bg-rose-500' }
  };

  const currentCrowd = crowdBadges[restaurant.crowdLevel] || crowdBadges.medium;
  const mapsUrl = restaurant.googleMapsUrl 
    ? `${restaurant.googleMapsUrl}&utm_campaign=gmp_git_agentskills_v1`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.location)}&utm_campaign=gmp_git_agentskills_v1`;

  return (
    <div className="card-clean flex flex-col justify-between overflow-hidden group">
      
      {/* Image & Overlay Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          
          {/* Crowd Badge */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              openCrowdRadar(restaurant);
            }}
            className={`badge-clean shadow-xs ${currentCrowd.class} cursor-pointer hover:opacity-90`}
            title="Click to view Live Crowd Radar"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentCrowd.dot}`} />
            <span>{currentCrowd.label}</span>
          </button>

          {/* Wait Time & Distance Badge */}
          <div className="flex items-center gap-1.5">
            <div className={`badge-clean shadow-xs ${waitInfo.waitMins <= 0 && waitInfo.waitMins !== -1 ? 'badge-low' : 'badge-medium'}`}>
              <Clock className="w-3 h-3" />
              <span>{waitInfo.waitMins === -1 ? 'No Tables' : waitInfo.waitMins === 0 ? '0m wait' : `~${waitInfo.waitMins}m`}</span>
            </div>

            {(resolvedDistance?.distanceKm != null || isDistanceLoading) && (
              <div 
                className="badge-clean bg-white/95 text-slate-800 border-slate-200 shadow-xs"
                title={`Calculated distance from ${referenceLabel}`}
              >
                {isDistanceLoading ? (
                  <span className="animate-pulse">Calculating...</span>
                ) : (
                  <>
                    <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      {resolvedDistance.distanceText || `${resolvedDistance.distanceKm} km`} away
                      {resolvedDistance.durationText ? ` • ${resolvedDistance.durationText}` : ''}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs">{restaurant.rating}</span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(restaurant.rating) ? 'fill-amber-400' : 'text-slate-400'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-300">({restaurant.reviewsCount || 420})</span>
          </div>

          <div className="text-[11px] font-semibold text-slate-200">
            {restaurant.priceRange}
          </div>
        </div>

      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Name & Details */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors">
              {restaurant.name}
            </h3>

            {restaurant.isPureVeg && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-0.5">
                <Leaf className="w-2.5 h-2.5" />
                <span>Veg</span>
              </span>
            )}
          </div>

          {/* Location & Details */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{restaurant.location}</span>
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-600 hover:text-emerald-800 ml-0.5 inline-flex items-center shrink-0"
                title="Open in Google Maps"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {(resolvedDistance?.distanceKm != null || isDistanceLoading) && (
              <span className="text-[10px] font-medium text-slate-600 shrink-0 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {isDistanceLoading ? 'Calculating...' : (
                  <>
                    {resolvedDistance.distanceText || `${resolvedDistance.distanceKm} km`}
                    {resolvedDistance.durationText ? ` • ${resolvedDistance.durationText}` : ''}
                  </>
                )}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 font-medium">
            {restaurant.cuisine} • <span className="text-slate-500">{restaurant.openingHours || restaurant.timing || '11:00 AM - 11:00 PM'}</span>
          </p>
        </div>

        {/* Live Table Floor Vacancy */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Table Vacancy:</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {freeTables} / {totalTables} Free
            </span>
          </div>

          {/* Mini Table Pills */}
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {restaurant.tables && restaurant.tables.map((t, idx) => (
              <div 
                key={t.id || idx}
                className={`py-0.5 px-1 rounded text-[10px] font-bold text-center border ${
                  t.status === 'available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : t.status === 'cleaning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
                title={`Table ${t.name || t.id} (${t.capacity} guests) - ${t.status}`}
              >
                {t.id ? t.id.replace(/[^0-9]/g, '') || idx + 1 : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          
          <button
            onClick={() => {
              setSelectedRestaurantId(restaurant.id);
              setMenuModalOpen(true);
            }}
            className="btn-secondary text-xs h-9 px-2"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
            <span>Menu</span>
          </button>

          <button
            onClick={() => {
              setSelectedRestaurantId(restaurant.id);
              setBookingModalOpen(true);
            }}
            className="btn-primary text-xs h-9 px-2"
          >
            <span>Book Table</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>

        </div>

      </div>
    </div>
  );
};

