import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  X, 
  QrCode, 
  Clock, 
  Users, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Table, 
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Flame,
  Check,
  Bell,
  Store,
  ExternalLink,
  CreditCard,
  Receipt,
  Copy
} from 'lucide-react';

export const MyReservationsModal = () => {
  const { 
    myBookingsOpen, 
    setMyBookingsOpen, 
    userReservations, 
    cancelReservation,
    openPayBill
  } = useApp();

  const [activeQrModal, setActiveQrModal] = useState(null);

  // Close modal on ESC keypress
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMyBookingsOpen(false);
        setActiveQrModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMyBookingsOpen]);

  if (!myBookingsOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setMyBookingsOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">My Table Reservations & Pre-Orders</h3>
              <p className="text-xs text-slate-400">Live table seating verification, kitchen pre-order status & tableside digital bill pay</p>
            </div>
          </div>

          <button
            onClick={() => setMyBookingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reservations List Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {userReservations.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No Reservations Found</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore restaurants on the main page, check live table vacancy, and book a free dining table with pre-ordered dishes.
              </p>
            </div>
          ) : (
            userReservations.map(res => {
              const isConfirmed = res.status === 'Confirmed';
              const hasPreOrder = res.preOrderedItems && res.preOrderedItems.length > 0;
              const orderTotal = hasPreOrder 
                ? res.preOrderedItems.reduce((acc, i) => acc + (i.price * i.qty), 0) 
                : (res.partySize || 2) * 650;
              const isPaid = res.isPaid === true;

              // Step tracking calculation
              const getOrderStep = (status) => {
                switch (status) {
                  case 'Received':
                    return 1;
                  case 'Accepted':
                    return 2;
                  case 'Cooking':
                    return 3;
                  case 'Served':
                  case 'Completed':
                    return 4;
                  default:
                    return 1;
                }
              };

              const currentStep = getOrderStep(res.orderStatus);

              return (
                <div 
                  key={res.id} 
                  className={`p-5 rounded-3xl border transition-all space-y-4 ${
                    isConfirmed 
                      ? 'bg-gray-950/90 border-black/30 shadow-xl shadow-gray-900/20' 
                      : 'bg-gray-900/40 border-gray-800 opacity-75'
                  }`}
                >
                  
                  {/* Prominent Booked Code Header Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold block">BOOKED CODE / PASS ID</span>
                      <div className="font-mono text-base font-extrabold text-emerald-400 tracking-wider flex items-center gap-2">
                        <span>{res.id || res.qrCode || `ST-RES-${res.id}`}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveQrModal(res)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>View QR Pass</span>
                    </button>
                  </div>
                  
                  {/* Top Row: Restaurant Name & Reservation Status */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-slate-900 text-slate-200 border border-slate-700">
                          🍽️ Dine-In Table
                        </span>
                        {isPaid && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-teal-950 text-teal-300 border border-slate-300/40 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> PAID ONLINE
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight mt-0.5">{res.restaurantName}</h4>
                      <p className="text-xs text-slate-400">{res.restaurantLocation}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                        res.status === 'Pending' || res.orderStatus === 'Pending' || res.orderStatus === 'Received'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                          : res.status === 'Accepted' || res.status === 'Confirmed' || res.orderStatus === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : res.status === 'Declined' || res.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {res.status === 'Pending' || res.orderStatus === 'Pending' || res.orderStatus === 'Received' ? '⏳ Pending Approval' :
                           res.status === 'Accepted' || res.status === 'Confirmed' ? '✅ Confirmed' :
                           res.status === 'Declined' || res.status === 'Rejected' ? '❌ Rejected' :
                           res.orderStatus || res.status}
                        </span>
                      </span>

                      {isConfirmed && !isPaid && (
                        <button
                          onClick={() => cancelReservation(res.id)}
                          className="text-[10px] text-slate-300 hover:text-rose-300 hover:underline font-semibold cursor-pointer"
                        >
                          Cancel Table
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seating Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-900/60 p-3 rounded-2xl border border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Table Allocated</span>
                      <div className="font-bold text-white truncate">{res.tableName || 'Table Auto-Match'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Party Size</span>
                      <div className="font-bold text-white">{res.partySize} Guests</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Date & Time</span>
                      <div className="font-bold text-amber-300">{res.date} • {res.time}</div>
                    </div>
                    <div className="text-right flex items-center justify-end">
                      <button
                        onClick={() => setActiveQrModal(res)}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Pass</span>
                      </button>
                    </div>
                  </div>

                  {/* Pre-Ordered Dishes Section */}
                  {hasPreOrder && (
                    <div className="p-4 rounded-2xl bg-indigo-950/20 border border-gray-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-bold text-white">Pre-Ordered Kitchen Dishes ({res.preOrderedItems.length})</span>
                        </div>
                        <span className="text-xs font-black text-white">Bill Subtotal: ₹{orderTotal.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Full Customer Booking Lifecycle Stepper */}
                      <div className="grid grid-cols-5 gap-1 text-center text-[9px] font-semibold pt-1">
                        {[
                          { step: 1, label: '1. Booked' },
                          { step: 2, label: '2. Confirmed' },
                          { step: 3, label: hasPreOrder ? '3. Pre-Ordered' : '3. Table Reserved' },
                          { step: 4, label: '4. Seated & Served' },
                          { step: 5, label: '5. Completed' }
                        ].map(s => (
                          <div 
                            key={s.step} 
                            className={`p-1.5 rounded-lg border transition-all ${
                              currentStep >= s.step 
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' 
                                : 'bg-gray-900/50 border-gray-800 text-gray-500'
                            }`}
                          >
                            {s.label}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {res.preOrderedItems.map((item, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-xl bg-gray-900 border border-gray-800 text-[11px] text-gray-300">
                            {item.qty}x {item.name} (₹{item.price * item.qty})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Online Bill Payment Bar (After Meal / Served) */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-gray-900/40 via-teal-950/30 to-gray-950 border border-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                        <span>Tableside Digital Bill Settlement</span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {isPaid 
                          ? `Settled ₹${res.paidAmount} via ${res.paymentMethod || 'UPI'} at ${res.paidAt || 'tableside'}`
                          : 'Settle bill directly from your phone with instant UPI / Card'}
                      </p>
                    </div>

                    <div>
                      {isPaid ? (
                        <button
                          onClick={() => openPayBill(res)}
                          className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-300/40 text-teal-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-white" />
                          <span>View Digital Receipt 🧾</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openPayBill(res)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md shadow-gray-900/50 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan & Pay Bill (₹{orderTotal}) ➔</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {res.specialRequests && res.specialRequests !== 'None' && (
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500">Note:</span>
                      <span>"{res.specialRequests}"</span>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex justify-end">
          <button
            onClick={() => setMyBookingsOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs font-semibold hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

      </div>

      {/* Digital QR Entry Pass Modal */}
      {activeQrModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveQrModal(null);
            }
          }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
        >
          <div className="glass-panel p-6 rounded-3xl border border-gray-700 max-w-sm w-full text-center space-y-4 text-gray-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h4 className="text-sm font-bold text-white">Table Check-in Pass</h4>
              <button onClick={() => setActiveQrModal(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-2xl">
              <QrCode className="w-40 h-40 text-black" />
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-mono font-bold text-white text-sm">{activeQrModal.qrCode}</div>
              <p className="text-gray-300 font-semibold">{activeQrModal.restaurantName}</p>
              <p className="text-gray-400">Show this QR to the host stand at the restaurant for instant table seating</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
