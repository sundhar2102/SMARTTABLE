import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  X, 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation, 
  Store, 
  ChefHat, 
  Package, 
  KeyRound, 
  Sparkles, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { playOrderAlert } from '../../utils/audioUtils';
import { TILE_LAYERS } from '../../services/mapConfig';

// Helper component to auto-fit map bounds around origin, destination, and live rider
const RouteBoundsFitter = ({ origin, destination, riderPos }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;
    try {
      const latLngs = [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ];
      if (riderPos?.lat && riderPos?.lng) {
        latLngs.push([riderPos.lat, riderPos.lng]);
      }
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    } catch (e) {}
  }, [map, origin?.lat, origin?.lng, destination?.lat, destination?.lng, riderPos?.lat, riderPos?.lng]);

  return null;
};

// Create custom animated Leaflet DivIcon for Restaurant
const createRestaurantMarkerIcon = (name) => {
  const html = `
    <div class="flex flex-col items-center">
      <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-950 text-indigo-200 border border-gray-500/50 shadow-md whitespace-nowrap mb-1">
        🏪 ${name || 'Restaurant'}
      </span>
      <div class="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-sm">
        🏬
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-delivery-origin-pin',
    iconSize: [36, 48],
    iconAnchor: [18, 48]
  });
};

// Create custom animated Leaflet DivIcon for Live Rider
const createRiderMarkerIcon = (progressPercent) => {
  const html = `
    <div class="relative flex flex-col items-center">
      <span class="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-gray-900 text-gray-200 border border-black/60 shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
        ${progressPercent}% on route
      </span>
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inset-0 rounded-full bg-white opacity-60"></span>
        <div class="w-9 h-9 rounded-full bg-black border-2 border-white shadow-2xl flex items-center justify-center text-base">
          🛵
        </div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-delivery-rider-pin',
    iconSize: [40, 52],
    iconAnchor: [20, 52]
  });
};

// Create custom animated Leaflet DivIcon for Delivery Destination
const createDestinationMarkerIcon = (locality) => {
  const html = `
    <div class="flex flex-col items-center">
      <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-950 text-rose-200 border border-black/50 shadow-md whitespace-nowrap mb-1">
        📍 ${locality || 'Your Address'}
      </span>
      <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-sm">
        🏠
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-delivery-dest-pin',
    iconSize: [36, 48],
    iconAnchor: [18, 48]
  });
};

export const DeliveryTrackingModal = () => {
  const { 
    deliveryTrackingOpen, 
    setDeliveryTrackingOpen, 
    activeTrackingOrder,
    restaurants,
    progressRiderDeliveryStep
  } = useApp();

  const [simulatedEta, setSimulatedEta] = useState(24);
  const [driverTip, setDriverTip] = useState(30);

  // Fallback demo order if none active
  const order = useMemo(() => {
    if (activeTrackingOrder) return activeTrackingOrder;
    const defaultRest = restaurants[0] || { name: 'Anjappar Chettinad', lat: 13.0418, lng: 80.2341, location: 'T. Nagar, Chennai' };
    return {
      id: 'ORD-98214',
      restaurantId: defaultRest.id,
      restaurantName: defaultRest.name,
      restaurantLat: defaultRest.lat || 13.0418,
      restaurantLng: defaultRest.lng || 80.2341,
      customerLat: 13.0550,
      customerLng: 80.2520,
      deliveryLocality: 'Nungambakkam, Chennai',
      riderName: 'Murugan K.',
      riderPhone: '+91 98402 18921',
      riderRating: 4.9,
      riderTrips: 1420,
      orderStatus: 'Out for Delivery',
      currentStep: 4, // 1: Confirmed, 2: Preparing, 3: Packed, 4: Out for Delivery, 5: Delivered
      items: [
        { name: 'Chettinad Chicken Biryani', quantity: 2, price: 340 },
        { name: 'Paneer Butter Masala', quantity: 1, price: 260 }
      ],
      totalAmount: 1010,
      deliveryDistanceKm: 2.4,
      deliveryOtp: '7392',
      fulfillmentType: 'delivery'
    };
  }, [activeTrackingOrder, restaurants]);

  // Coordinates
  const originCoord = useMemo(() => ({
    lat: order.restaurantLat || 13.0418,
    lng: order.restaurantLng || 80.2341
  }), [order]);

  const destCoord = useMemo(() => ({
    lat: order.customerLat || 13.0550,
    lng: order.customerLng || 80.2520
  }), [order]);

  // Progress computation (0% to 100%)
  const progressPercent = useMemo(() => {
    switch (order.currentStep) {
      case 1: return 10;
      case 2: return 35;
      case 3: return 60;
      case 4: return 85;
      case 5: return 100;
      default: return 50;
    }
  }, [order.currentStep]);

  // Interpolated Live Rider position along route
  const riderCoord = useMemo(() => {
    const fraction = Math.min(1, Math.max(0, (progressPercent - 20) / 80));
    return {
      lat: originCoord.lat + (destCoord.lat - originCoord.lat) * fraction,
      lng: originCoord.lng + (destCoord.lng - originCoord.lng) * fraction
    };
  }, [originCoord, destCoord, progressPercent]);

  // Route Polyline Points
  const routePolyline = useMemo(() => [
    [originCoord.lat, originCoord.lng],
    [riderCoord.lat, riderCoord.lng],
    [destCoord.lat, destCoord.lng]
  ], [originCoord, riderCoord, destCoord]);

  // Play subtle sound effect when status changes to Out for delivery
  useEffect(() => {
    if (deliveryTrackingOpen && order.currentStep === 4) {
      playOrderAlert();
    }
  }, [deliveryTrackingOpen, order.currentStep]);

  if (!deliveryTrackingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-white">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Live Delivery Radar</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-white border border-black/30">
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Order ID: <span className="font-mono text-gray-300 font-bold">{order.id}</span> • {order.restaurantName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDeliveryTrackingOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Live Delivery Map (OpenStreetMap & CARTO Tiles) */}
          <div className="relative h-64 w-full rounded-3xl overflow-hidden border border-gray-800 shadow-inner bg-[#0b0f17]">
            
            {/* Top ETA & Distance Floating Pill */}
            <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-950/90 backdrop-blur-md border border-gray-700/80 text-xs font-bold text-white shadow-lg">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <span>
                  {order.orderStatus === 'Delivered' 
                    ? 'Order Delivered Successfully' 
                    : `Estimated Arrival: ${Math.max(2, Math.round(simulatedEta * (1 - progressPercent / 100)))} mins`}
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-950/90 backdrop-blur-md border border-gray-500/40 text-xs font-bold text-indigo-300 shadow-lg">
                <Navigation className="w-3.5 h-3.5 text-gray-400" />
                <span>{order.deliveryDistanceKm || 1.8} km route</span>
              </div>
            </div>

            {/* Leaflet Map */}
            <MapContainer
              center={[originCoord.lat, originCoord.lng]}
              zoom={14}
              scrollWheelZoom={false}
              zoomControl={false}
              className="w-full h-full z-0"
            >
              <RouteBoundsFitter 
                origin={originCoord} 
                destination={destCoord} 
                riderPos={riderCoord} 
              />

              <TileLayer
                url={TILE_LAYERS.voyager.url}
                attribution={TILE_LAYERS.voyager.attribution}
                maxZoom={TILE_LAYERS.voyager.maxZoom}
              />

              {/* Driving Route Polyline */}
              <Polyline
                positions={routePolyline}
                pathOptions={{
                  color: '#10b981',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '6, 8'
                }}
              />

              {/* Restaurant Origin Marker */}
              <Marker 
                position={[originCoord.lat, originCoord.lng]}
                icon={createRestaurantMarkerIcon(order.restaurantName)}
              />

              {/* Live Moving Rider Marker */}
              <Marker 
                position={[riderCoord.lat, riderCoord.lng]}
                icon={createRiderMarkerIcon(progressPercent)}
              />

              {/* Customer Destination Marker */}
              <Marker 
                position={[destCoord.lat, destCoord.lng]}
                icon={createDestinationMarkerIcon(order.deliveryLocality)}
              />
            </MapContainer>

            {/* Bottom Live Telemetry Overlay Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-center justify-between text-[11px] text-gray-300 border border-gray-800 bg-gray-950/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Live GPS Telemetry Active
              </span>
              <span className="font-mono text-gray-300">
                Speed: 32 km/h • Real-time Tracking
              </span>
            </div>

          </div>

          {/* Delivery OTP Security Verification Card */}
          {order.fulfillmentType === 'delivery' && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-gray-900/40 via-gray-900 to-gray-900/40 border border-gray-400/40 flex items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gray-800 border border-gray-400/40 text-gray-300">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Delivery Handover Verification PIN
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Share this 4-digit code with rider upon arrival to receive package
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono tracking-widest text-white bg-black/60 px-3.5 py-1.5 rounded-2xl border border-gray-400/50 shadow-inner block">
                  {order.deliveryOtp || '7392'}
                </span>
                <span className="text-[10px] text-white font-semibold mt-1 block">
                  ✓ Verified Secure
                </span>
              </div>
            </div>
          )}

          {/* Step Milestones Progress Bar */}
          <div className="p-4 rounded-3xl bg-gray-950/80 border border-gray-800 space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Order Milestones
            </span>

            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-semibold">
              {[
                { stage: 1, label: 'Confirmed', icon: Sparkles },
                { stage: 2, label: 'Cooking', icon: ChefHat },
                { stage: 3, label: 'Packed', icon: Package },
                { stage: 4, label: 'Out for Delivery', icon: Bike },
                { stage: 5, label: 'Delivered', icon: CheckCircle2 }
              ].map((step) => {
                const Icon = step.icon;
                const isPassed = order.currentStep >= step.stage;
                const isCurrent = order.currentStep === step.stage;

                return (
                  <div 
                    key={step.stage}
                    className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-gray-800 border-black text-gray-200 ring-2 ring-gray-700'
                        : isPassed
                          ? 'bg-gray-900 border-gray-700 text-gray-300'
                          : 'bg-gray-950 border-gray-800 text-gray-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-white animate-bounce' : isPassed ? 'text-black' : 'text-gray-600'}`} />
                    <span className="text-[9px] font-bold truncate max-w-full">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Profile & Direct Communication */}
          <div className="p-4 rounded-3xl bg-gray-950/80 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-gray-300 flex items-center justify-center text-xl font-bold text-white shadow-md">
                {order.riderName?.charAt(0) || 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{order.riderName || 'Murugan K.'}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-amber-300 font-mono font-bold flex items-center gap-0.5">
                    ★ {order.riderRating || 4.9}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Delivery Partner • {order.riderTrips || 1420} verified deliveries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.riderPhone || '+919840218921'}`}
                className="p-3 rounded-2xl bg-black hover:bg-black text-white shadow-lg transition-colors flex items-center justify-center"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => alert(`Chat opened with ${order.riderName || 'Rider'}`)}
                className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 shadow transition-colors flex items-center justify-center"
                title="Message Rider"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
