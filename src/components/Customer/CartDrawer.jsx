import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Bike, 
  Store, 
  UtensilsCrossed, 
  MapPin, 
  Tag, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  CreditCard, 
  Clock, 
  ShieldCheck,
  CloudRain,
  Flame,
  ArrowRight
} from 'lucide-react';
import { PROMO_COUPONS } from '../../data/mockData';

export const CartDrawer = () => {
  const { 
    cart, 
    cartDrawerOpen, 
    setCartDrawerOpen, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart, 
    setCartFulfillmentType, 
    setCartTipAmount, 
    applyPromoCoupon, 
    removePromoCoupon, 
    calculateCartTotals, 
    savedAddresses, 
    selectedAddress, 
    setSelectedAddress, 
    marketplaceSettings, 
    placeOrder,
    restaurants,
    setSelectedRestaurantId,
    setBookingModalOpen
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!cartDrawerOpen) return null;

  const totals = calculateCartTotals();
  const targetRest = restaurants.find(r => r.id === cart.restaurantId);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyPromoCoupon(couponInput.trim());
    if (success) setCouponInput('');
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    await placeOrder({
      specialRequests: specialInstructions
    });
    setIsCheckingOut(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={() => setCartDrawerOpen(false)} 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d131f] border-l border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden text-gray-200">
          
          {/* Top Header */}
          <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-gray-950 via-gray-900 to-indigo-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-white">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Your Hyperlocal Basket</h3>
                  <p className="text-xs text-gray-400">
                    {cart.items.length > 0 ? `${targetRest?.name || cart.restaurantName}` : 'No items yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.items.length > 0 && (
                  <button 
                    onClick={clearCart} 
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-rose-950/40 transition-colors text-xs font-semibold"
                    title="Clear entire cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Fulfillment Mode Switcher Pills */}
            {cart.items.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-gray-950/80 border border-gray-800 mt-4 text-xs font-semibold">
                <button
                  onClick={() => setCartFulfillmentType('delivery')}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    cart.fulfillmentType === 'delivery'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </button>

                <button
                  onClick={() => setCartFulfillmentType('takeaway')}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    cart.fulfillmentType === 'takeaway'
                      ? 'bg-gradient-to-r from-gray-400 to-orange-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Pickup</span>
                </button>

                <button
                  onClick={() => setCartFulfillmentType('dine_in')}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    cart.fulfillmentType === 'dine_in'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Dine-In</span>
                </button>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cart.items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-200">Your Basket is Empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Explore neighborhood restaurants, artisan cafes & Mughlai kitchens to add dishes.
                  </p>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Browse Food & Menus
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Threshold Banner */}
                {cart.fulfillmentType === 'delivery' && (
                  <div className="p-3 rounded-2xl bg-indigo-950/40 border border-gray-500/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-indigo-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gray-300" />
                        {totals.freeDeliveryUnlocked ? 'Free Delivery Unlocked! ⚡' : 'Get Free Delivery'}
                      </span>
                      <span>{totals.freeDeliveryUnlocked ? '₹0 Fee' : `Add ₹${totals.freeDeliveryRemaining}`}</span>
                    </div>
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-white to-white h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (totals.itemTotal / (marketplaceSettings.freeDeliveryThreshold || 500)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Items Ordered</span>
                  {cart.items.map(item => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800/90 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.tags?.includes('v') ? 'bg-white' : 'bg-gray-300'}`} />
                          <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                        </div>
                        <span className="text-xs text-white font-semibold mt-0.5 block">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Qty Counter */}
                      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700/80 rounded-xl px-2 py-1">
                        <button
                          onClick={() => updateCartItemQty(item.id, item.qty - 1)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[16px] text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartItemQty(item.id, item.qty + 1)}
                          className="text-white hover:text-gray-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-white min-w-[50px] text-right">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Selector (For Delivery Mode) */}
                {cart.fulfillmentType === 'delivery' && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-300" />
                        Delivery Location (Chennai)
                      </span>
                      <span className="text-[10px] text-white font-bold bg-gray-950 px-2 py-0.5 rounded-full border border-black/30">
                        {targetRest?.distanceKm || 1.8} km away
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {savedAddresses.map(addr => (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-2 rounded-xl text-left border text-[11px] transition-all cursor-pointer ${
                            selectedAddress?.id === addr.id
                              ? 'bg-gray-950 border-black/50 text-white'
                              : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <div className="font-bold truncate">{addr.label.split(' ')[0]}</div>
                          <div className="text-[9px] text-gray-400 truncate">{addr.locality}</div>
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-gray-400 truncate pt-1 border-t border-gray-850">
                      📍 {selectedAddress?.address}
                    </p>
                  </div>
                )}

                {/* Courier Partner Tip (For Delivery Mode) */}
                {cart.fulfillmentType === 'delivery' && (
                  <div className="p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-300 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-gray-300" /> Tip Your Delivery Partner
                      </span>
                      <span className="text-[10px] text-gray-400">100% goes to rider</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[0, 20, 30, 50].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setCartTipAmount(amt)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            cart.tipAmount === amt
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {amt === 0 ? 'None' : `₹${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Code Input & Quick Coupons */}
                <div className="p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-300" /> Apply Voucher / Coupon
                    </span>
                    {cart.appliedCoupon && (
                      <button 
                        onClick={removePromoCoupon}
                        className="text-[10px] text-gray-300 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {cart.appliedCoupon ? (
                    <div className="p-2.5 rounded-xl bg-gray-900/40 border border-gray-700 flex items-center justify-between text-xs text-gray-200">
                      <div>
                        <div className="font-bold">Code: {cart.appliedCoupon.code} Applied!</div>
                        <div className="text-[10px] text-white">{cart.appliedCoupon.desc}</div>
                      </div>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter promo code (e.g. FIRSTBITE)"
                        className="flex-1 bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black uppercase font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {/* Coupon Pills */}
                  {!cart.appliedCoupon && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PROMO_COUPONS.slice(0, 3).map(cp => (
                        <button
                          key={cp.code}
                          type="button"
                          onClick={() => applyPromoCoupon(cp.code)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-gray-900 border border-gray-800 text-amber-300 hover:border-gray-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{cp.code}</span>
                          <span className="text-gray-400 font-sans">({cp.title})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Special Cooking Instructions */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Special Cooking / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="E.g. Extra spicy, no cutlery, call upon arrival at gate"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-black"
                  />
                </div>

                {/* Bill Breakdown */}
                <div className="p-4 rounded-2xl bg-gray-950/90 border border-gray-800 space-y-2 text-xs">
                  <span className="font-bold text-gray-300 block pb-1 border-b border-gray-850">
                    Bill Summary & Hyperlocal Split
                  </span>

                  <div className="flex justify-between text-gray-400">
                    <span>Items Subtotal</span>
                    <span>₹{totals.itemTotal}</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Restaurant GST (5%)</span>
                    <span>₹{totals.gst}</span>
                  </div>

                  {totals.packagingFee > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Packaging & Handling</span>
                      <span>₹{totals.packagingFee}</span>
                    </div>
                  )}

                  {totals.platformFee > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Platform Fee</span>
                      <span>₹{totals.platformFee}</span>
                    </div>
                  )}

                  {cart.fulfillmentType === 'delivery' && (
                    <div className="flex justify-between text-gray-400">
                      <span>Hyperlocal Delivery Fee</span>
                      <span className={totals.freeDeliveryUnlocked ? 'text-white font-semibold' : ''}>
                        {totals.freeDeliveryUnlocked ? 'FREE' : `₹${totals.deliveryFee}`}
                      </span>
                    </div>
                  )}

                  {totals.surgeFee > 0 && (
                    <div className="flex justify-between text-gray-300 font-semibold">
                      <span className="flex items-center gap-1">
                        {marketplaceSettings.rainSurgeActive ? <CloudRain className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                        Hyperlocal Weather / Rush Surge
                      </span>
                      <span>+₹{totals.surgeFee}</span>
                    </div>
                  )}

                  {totals.tipAmount > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Rider Tip</span>
                      <span>+₹{totals.tipAmount}</span>
                    </div>
                  )}

                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-white font-bold">
                      <span>Promo Discount ({cart.appliedCoupon?.code})</span>
                      <span>-₹{totals.discountAmount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-800 flex justify-between items-baseline font-bold text-white text-sm">
                    <span>To Pay</span>
                    <span className="text-lg text-white">₹{totals.grandTotal}</span>
                  </div>
                </div>

              </>
            )}
          </div>

          {/* Bottom Checkout Action Bar */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-gray-800 bg-gray-950 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> Safe & Contactless
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-gray-300" />
                  {cart.fulfillmentType === 'delivery' ? 'Est. Delivery: 20-30 min' : cart.fulfillmentType === 'takeaway' ? 'Ready in: 15 min' : 'Dine-In Reserved'}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-gray-300 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-gray-950 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-between px-5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span>{isCheckingOut ? 'Processing Order...' : cart.fulfillmentType === 'delivery' ? 'Place Instant Delivery Order' : cart.fulfillmentType === 'takeaway' ? 'Confirm Express Takeaway' : 'Confirm Dine-in Pre-Order'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white bg-black/30 px-2 py-0.5 rounded-lg">₹{totals.grandTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
