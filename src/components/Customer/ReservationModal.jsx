import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CalendarCheck, 
  X, 
  Users, 
  Clock, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Sparkles,
  CheckCircle2,
  Table,
  UtensilsCrossed,
  Plus,
  Minus,
  AlertCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
  Layers,
  Store,
  Leaf,
  Star,
  Flame,
  ChevronDown
} from 'lucide-react';

export const ReservationModal = () => {
  const { 
    bookingModalOpen, 
    setBookingModalOpen, 
    restaurants,
    selectedRestaurantId,
    setSelectedRestaurantId,
    activeRestaurant, 
    makeReservation,
    getEstimatedWaitTime,
    user,
    setMyBookingsOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'menu'
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [partySize, setPartySize] = useState(2);
  const [preferredSection, setPreferredSection] = useState('Any Section (Best Available)');
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('19:30');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Pre-ordered menu items cart
  const [preOrderCart, setPreOrderCart] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (bookingModalOpen && user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [bookingModalOpen, user]);

  if (!bookingModalOpen || !activeRestaurant) return null;

  // Handle Restaurant Change
  const handleRestaurantChange = (restId) => {
    setSelectedRestaurantId(restId);
    setPreferredSection('Any Section (Best Available)');
    setErrorMessage('');
    // Optional: Keep or reset pre-order cart
    setPreOrderCart({});
  };

  // Calculate live estimated wait time for party size
  const waitInfo = getEstimatedWaitTime(activeRestaurant.id, partySize);

  // Cart operations
  const handleItemQtyChange = (item, delta) => {
    setPreOrderCart(prev => {
      const currentQty = prev[item.id]?.qty || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: newQty
        }
      };
    });
  };

  const preOrderList = Object.values(preOrderCart);
  const cartSubtotal = preOrderList.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await makeReservation({
        restaurantId: activeRestaurant.id,
        restaurantName: activeRestaurant.name,
        guestName,
        guestEmail,
        guestPhone,
        partySize,
        date,
        time,
        specialRequests,
        preOrderedItems: preOrderList
      });
      if (res && res.success) {
        setBookingModalOpen(false);
        setMyBookingsOpen(true);
      } else {
        setErrorMessage(res?.error || 'Failed to make reservation.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapsUrl = activeRestaurant.googleMapsUrl 
    ? `${activeRestaurant.googleMapsUrl}&utm_campaign=gmp_git_agentskills_v1`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeRestaurant.name + ' ' + activeRestaurant.location)}&utm_campaign=gmp_git_agentskills_v1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CalendarCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Instant Hotel Table Booking & Pre-Order</h3>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5 flex-wrap">
                <span className="font-semibold text-emerald-400">{activeRestaurant.name}</span>
                <span className="text-slate-600">•</span>
                <a 
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{activeRestaurant.location}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer border border-slate-700/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Restaurant Selector Banner */}
        <div className="px-5 sm:px-6 py-3 bg-gray-950/80 border-b border-gray-800/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/20 border border-gray-800">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={activeRestaurant.image}
                alt={activeRestaurant.name}
                className="w-11 h-11 rounded-xl object-cover border border-gray-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Store className="w-3 h-3 text-white" /> Select Restaurant:
                </label>
                <div className="relative">
                  <select
                    value={activeRestaurant.id}
                    onChange={(e) => handleRestaurantChange(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl pl-2.5 pr-8 py-1.5 text-xs font-bold outline-none focus:border-black cursor-pointer appearance-none"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id} className="bg-gray-900 text-white">
                        {r.name} — {r.location} ({r.cuisine})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mini Restaurant Badges */}
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] self-end sm:self-center">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 font-bold">
                <Star className="w-3 h-3 fill-gray-300" />
                <span>{activeRestaurant.rating}</span>
              </div>
              {activeRestaurant.isPureVeg && (
                <span className="px-2 py-1 rounded-xl bg-gray-900 text-gray-200 border border-gray-700 text-[10px] font-bold flex items-center gap-1">
                  <Leaf className="w-2.5 h-2.5 text-white" /> Pure Veg
                </span>
              )}
              <span className={`px-2 py-1 rounded-xl text-[10px] font-bold uppercase border ${
                activeRestaurant.crowdLevel === 'high' 
                  ? 'bg-rose-950 text-rose-300 border-black/40' 
                  : activeRestaurant.crowdLevel === 'low'
                  ? 'bg-gray-900 text-gray-200 border-gray-700'
                  : 'bg-gray-900 text-amber-300 border-gray-400/40'
              }`}>
                {activeRestaurant.crowdLevel} Crowd
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Booking Details vs Restaurant Menu */}
        <div className="px-5 sm:px-6 py-2.5 bg-gray-950/90 border-b border-gray-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-900 border border-gray-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>1. Booking Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-gray-300" />
              <span>2. Menu Pre-Order</span>
              {preOrderList.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gray-300 text-black font-bold">
                  {preOrderList.reduce((acc, i) => acc + i.qty, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Live Estimated Wait Time Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/70 border border-gray-400/40 text-amber-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-gray-300" />
            <span>Walk-in Wait: <strong>{waitInfo.text}</strong></span>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-white" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'details' ? (
            /* Tab 1: Booking Details & Guest Info */
            <div className="space-y-5">
              
              {/* Estimated Wait Time Banner Comparison */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900/60 via-indigo-950/50 to-gray-950 border border-gray-400/30 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-300" /> Live Dining Telemetry:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-amber-300 border border-gray-400/30">
                    Real-Time Wait Estimate
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Walk-in Without Booking</span>
                    <span className="font-bold text-gray-300 text-xs block mt-0.5">{waitInfo.text}</span>
                    <span className="text-[10px] text-gray-400">({waitInfo.partiesAhead || 1} parties in queue)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-700">
                    <span className="text-white block text-[10px] uppercase font-bold">Guaranteed Reservation</span>
                    <span className="font-bold text-white text-xs block mt-0.5">Instant Seating (0 min wait)</span>
                    <span className="text-[10px] text-gray-200">Priority host stand bypass</span>
                  </div>
                </div>
              </div>

              {/* Party Size, Seating Preference & Date / Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Party Size
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-black"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={6}>6 Guests</option>
                    <option value={8}>8+ Large Group</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Seating Section Preference
                  </label>
                  <select
                    value={preferredSection}
                    onChange={(e) => setPreferredSection(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-black"
                  >
                    <option value="Any Section (Best Available)">Any Section (Best Available)</option>
                    {(activeRestaurant.sections || []).map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Time Slot
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              {/* Guest Personal Information */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Guest Information</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-black"
                        placeholder="Rajesh Kapoor"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-black"
                        placeholder="+91 98201 23456"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Email Address (For Digital QR Pass)</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-black"
                      placeholder="rajesh.kapoor@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Special Dietary Requests / Notes</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3 text-xs outline-none focus:border-black"
                    placeholder="Anniversary celebration, Jain food, mild spices, high chair..."
                  />
                </div>
              </div>

              {/* Pre-Order Summary Quick Callout */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-gray-500/30 text-xs text-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-gray-300" />
                  <span>
                    {preOrderList.length > 0 ? (
                      <>Pre-ordered <strong>{preOrderList.reduce((a, b) => a + b.qty, 0)} items</strong> (₹{cartSubtotal.toLocaleString('en-IN')})</>
                    ) : (
                      <>Want fresh food ready upon table arrival? Browse the menu!</>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-gray-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  {preOrderList.length > 0 ? 'Edit Menu' : 'Browse Menu'}
                </button>
              </div>

            </div>
          ) : (
            /* Tab 2: Interactive Restaurant Menu & Pre-Order Selector */
            <div className="space-y-6">
              
              <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-gray-500/30 text-xs text-indigo-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Pre-Order Dishes & Drinks</span>
                  <span className="text-[11px] text-gray-300">Items will be prepared by the kitchen as soon as your table is seated.</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Pre-order Total</span>
                  <span className="text-base font-extrabold text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Categories & Dish Lists */}
              {activeRestaurant.menu && activeRestaurant.menu.length > 0 ? (
                activeRestaurant.menu.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-1 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5" /> {cat.category}
                    </h4>

                    <div className="grid grid-cols-1 gap-2.5">
                      {cat.items.map(item => {
                        const currentQty = preOrderCart[item.id]?.qty || 0;

                        return (
                          <div 
                            key={item.id} 
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                              currentQty > 0 
                                ? 'bg-indigo-950/50 border-gray-500/50 shadow-md' 
                                : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{item.name}</span>
                                {item.tags && item.tags.map(t => (
                                  <span key={t} className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-gray-800 text-amber-300">
                                    {t === 'v' ? 'Vegetarian' : t === 'vg' ? 'Vegan' : t === 'gf' ? 'Gluten-Free' : 'Chef Special'}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{item.desc}</p>
                              <div className="font-bold text-white text-xs">₹{item.price.toLocaleString('en-IN')}</div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-xl border border-gray-800 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(item, -1)}
                                className="w-6 h-6 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className="w-6 text-center text-xs font-bold text-white">{currentQty}</span>

                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(item, 1)}
                                className="w-6 h-6 rounded-lg bg-black hover:bg-black text-white flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">Digital menu currently updating...</p>
              )}

            </div>
          )}

          {/* Submit Actions Footer */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 hidden sm:inline">
              Instant confirmation • Direct host stand seating
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-gray-900/50 hover:brightness-110 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Reservation {cartSubtotal > 0 ? `(₹${cartSubtotal.toLocaleString('en-IN')} pre-ordered)` : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
