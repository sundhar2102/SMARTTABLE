import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Users, 
  UtensilsCrossed, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  Building2,
  QrCode,
  Navigation
} from 'lucide-react';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { getGoogleMapsApiKey, DEFAULT_MAP_ID, USAGE_ATTRIBUTION_ID } from '../../services/googleMapsConfig';

const PRESET_IMAGES = [
  { label: 'Fine Dining Ambient', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Rooftop Deck & Lounge', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' },
  { label: 'Artisanal Cafe & Bakery', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
  { label: 'Traditional Indian Feast', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern Asian & Sizzlers', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' }
];

export const RegisterRestaurantModal = () => {
  const { 
    registerRestaurantModalOpen, 
    setRegisterRestaurantModalOpen, 
    submitRestaurantRegistration,
    user
  } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    cuisine: 'Authentic Chettinad & South Indian',
    isPureVeg: false,
    cuisineHighlights: 'Biryani, Tandoori Starters, Sizzling Claypot Dishes',
    priceRange: '₹₹',
    city: 'Chennai',
    zone: 'T. Nagar',
    location: '',
    lat: 13.0410,
    lng: 80.2350,
    ownerName: user?.name || 'Sundhara Pandian',
    ownerEmail: user?.email || 'partner@restaurant.in',
    ownerPhone: user?.phone || '+91 98400 98765',
    settlementUpiId: 'sundhar8074@axl',
    fssaiLicense: '12423002000892',
    gstin: '33AAACA1234F1Z5',
    totalCapacity: 50,
    tablesCount: 10,
    sections: 'Main AC Dining, Family Booth Lounge',
    openingHours: '11:00 AM - 11:00 PM',
    coverImage: PRESET_IMAGES[0].url,
    notes: 'Premium commercial location with live table dining reservation demand.'
  });

  if (!registerRestaurantModalOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    submitRestaurantRegistration(formData);
    setRegisterRestaurantModalOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-200">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-950 via-gray-900 to-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gray-800 border border-gray-700 text-white">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Partner Restaurant Onboarding</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white text-gray-950 border border-white shadow-sm">
                  STEP {step} OF 4
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Register your restaurant for live crowd radar, vacancy tracking & table bookings
              </p>
            </div>
          </div>

          <button
            onClick={() => setRegisterRestaurantModalOpen(false)}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/80 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-900 h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-black to-white h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* STEP 1: Restaurant Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">Step 1: Restaurant Identity & Concept</span>
                <h4 className="text-base font-bold text-white">What is your restaurant name & dining specialty?</h4>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Anjappar Chettinad Grill, The Green Bowl Cafe"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Catchy Pitch / Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Woodfired artisanal sourdough pizzas, craft cold brews & pasta"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Primary Cuisine</label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) => handleChange('cuisine', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                  >
                    <option value="Authentic Chettinad & South Indian">Chettinad & South Indian</option>
                    <option value="Continental & Mediterranean Cafe">Continental & Cafe</option>
                    <option value="Pure Vegetarian North Indian & Chaat">Pure Veg North Indian</option>
                    <option value="Indo-Chinese & Asian Fusion">Indo-Chinese & Asian</option>
                    <option value="Sizzlers & Pan-Asian Grill">Sizzlers & Grill</option>
                    <option value="Italian Woodfired Pizza & Pasta">Italian & Pizza</option>
                    <option value="Biryani & Mughlai Specialties">Biryani & Mughlai</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Price Level</label>
                  <select
                    value={formData.priceRange}
                    onChange={(e) => handleChange('priceRange', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                  >
                    <option value="₹">Budget Friendly (₹ - Under ₹400 for 2)</option>
                    <option value="₹₹">Casual Dining (₹₹ - ₹400-₹900 for 2)</option>
                    <option value="₹₹₹">Premium / Fine Dining (₹₹₹ - ₹1000+ for 2)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Signature Dish Highlights (comma separated)</label>
                <input
                  type="text"
                  value={formData.cuisineHighlights}
                  onChange={(e) => handleChange('cuisineHighlights', e.target.value)}
                  placeholder="e.g. Mutton Sukka, Claypot Biryani, Lotus Stem"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-black"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/90 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPureVeg}
                  onChange={(e) => handleChange('isPureVeg', e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <div>
                  <span className="font-bold text-white block">100% Pure Vegetarian Restaurant 🟢</span>
                  <span className="text-[11px] text-gray-400">Strictly no non-veg items prepared in the kitchen</span>
                </div>
              </label>
            </div>
          )}

          {/* STEP 2: Location & Contact */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">Step 2: Location & Merchant Contact</span>
                <h4 className="text-base font-bold text-white">Where is your dining establishment located?</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Zone / Neighborhood</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => {
                      const newZone = e.target.value;
                      handleChange('zone', newZone);
                      if (ZONE_COORDS[newZone]) {
                        setFormData(prev => ({
                          ...prev,
                          zone: newZone,
                          lat: ZONE_COORDS[newZone].lat,
                          lng: ZONE_COORDS[newZone].lng
                        }));
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                  >
                    <option value="T. Nagar">T. Nagar</option>
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="Alwarpet">Alwarpet</option>
                    <option value="Nungambakkam">Nungambakkam</option>
                    <option value="Kilpauk">Kilpauk</option>
                    <option value="OMR">OMR / Navalur</option>
                    <option value="Velachery">Velachery</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Complete Street Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. 42, Usman Road, Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl p-3 text-xs text-white outline-none focus:border-black"
                />
              </div>

              {/* Interactive Google Maps Pin-Point Location Picker */}
              <div className="space-y-2 p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    Exact GPS Pin on Google Maps
                  </span>
                  <span className="text-[10px] font-mono text-white bg-gray-900/80 px-2 py-0.5 rounded-md border border-black/30">
                    {formData.lat?.toFixed(4)}, {formData.lng?.toFixed(4)}
                  </span>
                </div>

                <div className="relative h-44 w-full rounded-xl overflow-hidden border border-gray-800">
                  <APIProvider apiKey={getGoogleMapsApiKey()}>
                    <Map
                      style={{ width: '100%', height: '100%' }}
                      defaultCenter={{ lat: formData.lat || 13.0405, lng: formData.lng || 80.2436 }}
                      center={{ lat: formData.lat || 13.0405, lng: formData.lng || 80.2436 }}
                      defaultZoom={15}
                      mapId={DEFAULT_MAP_ID}
                      internalUsageAttributionIds={[USAGE_ATTRIBUTION_ID]}
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      onClick={(e) => {
                        if (e.detail?.latLng) {
                          setFormData(prev => ({
                            ...prev,
                            lat: e.detail.latLng.lat,
                            lng: e.detail.latLng.lng
                          }));
                        }
                      }}
                    >
                      <AdvancedMarker
                        position={{ lat: formData.lat || 13.0405, lng: formData.lng || 80.2436 }}
                        title="Your Restaurant Location"
                      >
                        <Pin
                          background="#059669"
                          borderColor="#10b981"
                          glyphColor="#ffffff"
                          scale={1.2}
                        />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] bg-black/80 backdrop-blur-sm text-gray-300 px-2 py-1 rounded-md border border-gray-800">
                      💡 Click on map to adjust exact pin
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Owner / General Manager Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerPhone}
                    onChange={(e) => handleChange('ownerPhone', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.ownerEmail}
                    onChange={(e) => handleChange('ownerEmail', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block flex items-center justify-between">
                  <span>Merchant UPI ID for Automated Settlements:</span>
                  <span className="text-white font-mono">Instant Payouts</span>
                </label>
                <input
                  type="text"
                  value={formData.settlementUpiId}
                  onChange={(e) => handleChange('settlementUpiId', e.target.value)}
                  placeholder="e.g. sundhar8074@axl"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2 text-xs text-gray-200 font-mono font-bold outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Seating & Floor Setup */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">Step 3: Dining Capacity & Table Floor Setup</span>
                <h4 className="text-base font-bold text-white">How many diners can your venue accommodate?</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Total Diner Capacity (Seats)</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.totalCapacity}
                    onChange={(e) => handleChange('totalCapacity', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Number of Tables</label>
                  <input
                    type="number"
                    min="2"
                    value={formData.tablesCount}
                    onChange={(e) => handleChange('tablesCount', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Floor Sections (comma separated)</label>
                <input
                  type="text"
                  value={formData.sections}
                  onChange={(e) => handleChange('sections', e.target.value)}
                  placeholder="e.g. Main AC Hall, Rooftop Deck, Private VIP Lounge"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Operating Hours</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => handleChange('openingHours', e.target.value)}
                  placeholder="e.g. 11:30 AM - 03:30 PM, 06:30 PM - 11:00 PM"
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-black font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1">
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Automated Table Generation
                </span>
                <p className="text-[11px] text-gray-400">
                  SmartTable AI will auto-create dynamic 2-seater, 4-seater, 6-seater, and VIP family booths based on your seating capacity.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Compliance & Cover Photo */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">Step 4: Legal Compliance & Cover Photo</span>
                <h4 className="text-base font-bold text-white">Upload compliance identifiers & pick cover photo</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">FSSAI License No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.fssaiLicense}
                    onChange={(e) => handleChange('fssaiLicense', e.target.value)}
                    placeholder="14-digit FSSAI Number"
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">GSTIN Registration</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    placeholder="e.g. 33AAAAA1234A1Z5"
                    className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Cover Photo Picker */}
              <div className="space-y-2">
                <label className="text-gray-300 font-bold block">Select Cover Theme Banner:</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChange('coverImage', img.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer h-16 ${
                        formData.coverImage === img.url ? 'border-white shadow-md' : 'border-gray-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5 truncate px-1">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Custom Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleChange('coverImage', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                />
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-black/30 text-xs space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Ready for Super Admin Verification Audit</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Upon clicking submit, your application will be queued in the Super Admin Approval Portal for immediate verification.
                </p>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-gray-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !formData.name.trim()}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-black text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-gray-900/50"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-gray-300 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xl shadow-gray-950 hover:brightness-110"
              >
                <Check className="w-4 h-4" />
                <span>Submit Application for Approval 🚀</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
