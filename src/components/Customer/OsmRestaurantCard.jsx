import React from 'react';
import { MapPin, ExternalLink, Clock, Navigation, Globe, Phone } from 'lucide-react';

/**
 * OsmRestaurantCard
 * Renders a card for restaurants discovered via OSM/Overpass that are NOT
 * SMARTTABLE partners. Shows location, distance, and a Maps link.
 * Does NOT show fake table availability, wait times, or occupancy.
 */
export const OsmRestaurantCard = ({ restaurant, isDistanceLoading = false }) => {
  const { name, cuisine, location, city, distanceKm, phoneNumber, website, openingHours, googleMapsUrl } = restaurant;

  // Format distance for display
  const formatDist = (km) => {
    if (km == null || isNaN(km)) return null;
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const distDisplay = formatDist(distanceKm);

  return (
    <div className="card-clean flex flex-col justify-between overflow-hidden group opacity-90 hover:opacity-100 border-dashed border-slate-200">

      {/* Header strip — no image for OSM restaurants */}
      <div className="h-20 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-between px-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            <MapPin className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nearby Restaurant</p>
            <p className="text-[10px] font-semibold text-slate-600">{cuisine || 'Restaurant'}</p>
          </div>
        </div>

        {/* Distance badge */}
        {(distDisplay || isDistanceLoading) && (
          <div className="badge-clean bg-white/90 text-slate-700 border-slate-200 shadow-xs">
            <Navigation className="w-3 h-3 text-slate-500" />
            <span>
              {isDistanceLoading ? (
                <span className="animate-pulse">Calculating...</span>
              ) : (
                <>{distDisplay} away</>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Name */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-slate-700 transition-colors">
          {name}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span className="line-clamp-2">{location || city || 'See on map'}</span>
        </div>

        {/* Opening hours if available */}
        {openingHours && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{openingHours}</span>
          </div>
        )}

        {/* Phone if available */}
        {phoneNumber && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <a href={`tel:${phoneNumber}`} className="hover:text-slate-800 transition-colors">{phoneNumber}</a>
          </div>
        )}

        {/* SMARTTABLE not available notice */}
        <div className="mt-auto pt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center">
          <span className="font-semibold text-slate-600">Live SMARTTABLE data unavailable</span>
          <br />
          <span>Table booking &amp; wait times not supported for this venue.</span>
        </div>

      </div>

      {/* Footer actions */}
      <div className="p-4 pt-0 flex gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs h-9 px-3 flex-1 flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin className="w-3.5 h-3.5 text-slate-600" />
          <span>View on Map</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs h-9 px-3 flex items-center justify-center gap-1"
            title="Visit website"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
          </a>
        )}
      </div>
    </div>
  );
};
