import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  X, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  QrCode, 
  Percent, 
  Heart, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight,
  Download,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Tag,
  Smile,
  Check
} from 'lucide-react';
import { UpiPaymentQrCard, UPI_ID } from './UpiPaymentQrCard';

export const PayBillModal = () => {
  const { 
    payBillModalOpen, 
    setPayBillModalOpen, 
    activeBillReservation, 
    settleBillPayment,
    triggerToast 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'custom'
  const [customUpiId, setCustomUpiId] = useState('');
  const [tipAmount, setTipAmount] = useState(50);
  const [customTip, setCustomTip] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');

  // Rating & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(null);
  const [starRating, setStarRating] = useState(5);
  const [selectedCompliments, setSelectedCompliments] = useState(['Delicious Food ✨', 'Fast Service ⚡']);

  if (!payBillModalOpen || !activeBillReservation) return null;

  const items = activeBillReservation.preOrderedItems || [];
  
  // If no dishes pre-ordered, provide a default dining charge based on party size
  const itemsSubtotal = items.length > 0 
    ? items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    : (activeBillReservation.partySize || 2) * 650; // default average cover per guest

  const effectiveTip = customTip ? (Number(customTip) || 0) : tipAmount;
  const gstAmount = Math.round(itemsSubtotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, itemsSubtotal + gstAmount + effectiveTip - discountAmount);

  // Apply voucher
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'DINING10' || code === 'SMART10') {
      const discount = Math.round(itemsSubtotal * 0.10);
      setDiscountAmount(discount);
      setAppliedCoupon({ code, discountPercent: 10, amount: discount });
      triggerToast('Coupon Applied! 🎉', `Saved ₹${discount} with ${code}.`, 'info');
    } else if (code === 'TASTING50' || code === 'CHEF50') {
      const discount = Math.min(itemsSubtotal, 50);
      setDiscountAmount(discount);
      setAppliedCoupon({ code, amount: discount });
      triggerToast('Coupon Applied! 🎉', `Saved ₹50 with ${code}.`, 'info');
    } else {
      setCouponError('Invalid promo coupon. Try "DINING10" for 10% OFF!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponError('');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaidSuccess(true);

      const txnId = `TXN-UPI-${Math.floor(100000 + Math.random() * 900000)}`;
      const invoiceId = `INV-ST-${Date.now().toString().slice(-6)}`;
      const paidData = {
        transactionId: txnId,
        invoiceId: invoiceId,
        paidAmount: grandTotal,
        itemsSubtotal,
        gstAmount,
        tipAmount: effectiveTip,
        discountAmount,
        paymentMethod: paymentMethod === 'upi' ? `Instant UPI (${UPI_ID})` : paymentMethod === 'card' ? 'Credit Card (Visa)' : 'Net Banking',
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
      };

      setReceiptDetails(paidData);

      // Settle in central AppContext
      settleBillPayment(activeBillReservation.id, paidData);
    }, 1400);
  };

  const toggleCompliment = (comp) => {
    if (selectedCompliments.includes(comp)) {
      setSelectedCompliments(prev => prev.filter(c => c !== comp));
    } else {
      setSelectedCompliments(prev => [...prev, comp]);
    }
  };

  const handleClose = () => {
    setIsPaidSuccess(false);
    setReceiptDetails(null);
    setPayBillModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-black/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-200">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/50 via-teal-950/30 to-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gray-800 border border-gray-700 text-white">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Tableside Digital Bill Settlement</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-gray-900 text-gray-200 border border-gray-700">
                  INSTANT UPI / CARD
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {activeBillReservation.restaurantName} • {activeBillReservation.tableName || 'Table Seated'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* SUCCESS SCREEN */}
          {isPaidSuccess && receiptDetails ? (
            <div className="space-y-6 text-center animate-in zoom-in-95">
              
              <div className="w-16 h-16 rounded-full bg-gray-800 border border-black/50 text-white flex items-center justify-center mx-auto shadow-xl shadow-gray-900/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-widest block">PAYMENT SUCCESSFUL</span>
                <h4 className="text-2xl font-black text-white">₹{receiptDetails.paidAmount.toLocaleString('en-IN')}</h4>
                <p className="text-xs text-gray-400">
                  Bill settled via {receiptDetails.paymentMethod} at {receiptDetails.paidAt}
                </p>
              </div>

              {/* Digital Tax Invoice Card */}
              <div className="p-5 rounded-3xl bg-gray-900/90 border border-gray-800 text-left space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs">
                  <div>
                    <span className="font-bold text-white block">{activeBillReservation.restaurantName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Invoice: {receiptDetails.invoiceId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">{receiptDetails.date}</span>
                    <span className="text-[10px] text-white font-mono font-bold">{receiptDetails.transactionId}</span>
                  </div>
                </div>

                {/* Items in Receipt */}
                <div className="space-y-1.5 text-xs text-gray-300">
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-mono text-white">₹{item.price * item.qty}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between">
                      <span>Dining Cover ({activeBillReservation.partySize} guests)</span>
                      <span className="font-mono text-white">₹{itemsSubtotal}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-800 space-y-1 text-[11px] text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{itemsSubtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5% Dining GST</span>
                      <span>₹{gstAmount}</span>
                    </div>
                    {effectiveTip > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span>Waitstaff Service Tip</span>
                        <span>₹{effectiveTip}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-white">
                        <span>Dining Discount Voucher</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-700 flex justify-between font-black text-sm text-white">
                    <span>Total Amount Paid</span>
                    <span className="text-white">₹{receiptDetails.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Star Rating & Experience Feedback */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800/90 space-y-3 text-left">
                <span className="text-xs font-bold text-white block">Rate Your Dining Experience:</span>
                
                <div className="flex items-center gap-2 justify-center py-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= starRating ? 'text-gray-300 fill-gray-300' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                  {[
                    'Delicious Food ✨',
                    'Fast Kitchen Service ⚡',
                    'Great Ambience 🕯️',
                    'Courteous Staff 👨‍🍳',
                    'Accurate Wait Time ⏱️'
                  ].map(compliment => (
                    <button
                      key={compliment}
                      type="button"
                      onClick={() => toggleCompliment(compliment)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedCompliments.includes(compliment)
                          ? 'bg-gray-900 text-gray-200 border border-gray-700'
                          : 'bg-gray-900 text-gray-400 border border-gray-800'
                      }`}
                    >
                      {compliment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-gray-900/50 hover:brightness-110 cursor-pointer"
              >
                Done & Return to Table Bookings ✨
              </button>

            </div>
          ) : (
            /* PAYMENT CHECKOUT FORM */
            <div className="space-y-6">
              
              {/* Itemized Bill Accordion */}
              <div className="p-4 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                  <span className="flex items-center gap-1.5 text-white">
                    <UtensilsCrossed className="w-4 h-4 text-white" />
                    <span>Itemized Meal Bill ({items.length > 0 ? items.length : `${activeBillReservation.partySize} Guests`})</span>
                  </span>
                  <span className="text-white font-black">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-800 text-xs">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-gray-300">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-mono text-white">₹{item.price * item.qty}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Tableside Dining Menu ({activeBillReservation.partySize} Guests)</span>
                      <span className="font-mono text-white">₹{itemsSubtotal}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Waitstaff Tipping Selector */}
              <div className="p-4 rounded-3xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-gray-300" /> Add Tip for Service Staff
                  </span>
                  <span className="text-amber-300 font-extrabold text-xs">₹{effectiveTip}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '₹0', val: 0 },
                    { label: '₹50', val: 50 },
                    { label: '₹100', val: 100 },
                    { label: '₹200', val: 200 }
                  ].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => {
                        setTipAmount(t.val);
                        setCustomTip('');
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        effectiveTip === t.val && !customTip
                          ? 'bg-gray-400 text-black shadow-md'
                          : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dining Promo Coupon Code */}
              <div className="p-4 rounded-3xl bg-gray-950 border border-gray-800 space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-white" /> Apply Dining Voucher:
                </label>

                {appliedCoupon ? (
                  <div className="p-2.5 rounded-2xl bg-gray-900/80 border border-gray-700 flex items-center justify-between text-xs text-gray-200">
                    <div>
                      <span className="font-bold">✓ {appliedCoupon.code} Applied</span>
                      <span className="text-[11px] block text-white">Saved ₹{appliedCoupon.amount} on meal bill</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-gray-300 hover:underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo (e.g. DINING10)"
                      className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-black font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold cursor-pointer border border-gray-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <span className="text-[11px] text-gray-300 font-semibold">{couponError}</span>}
              </div>

              {/* Payment Methods Selection (UPI vs Card vs NetBanking) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white block">Select Payment Method:</label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: '⚡ Instant UPI', sub: 'GPay, PhonePe, Paytm' },
                    { id: 'card', label: '💳 Cards', sub: 'Debit / Credit' },
                    { id: 'netbanking', label: '🏦 Net Banking', sub: 'HDFC, SBI, ICICI' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? 'bg-gray-900/80 border-black text-emerald-200 shadow-md'
                          : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{method.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{method.sub}</div>
                    </button>
                  ))}
                </div>

                {/* UPI QR Payment Card */}
                {paymentMethod === 'upi' && (
                  <UpiPaymentQrCard
                    amount={grandTotal}
                    orderId={activeBillReservation.id}
                    note={`Table Bill - ${activeBillReservation.restaurantName}`}
                    onPaymentSuccess={handleProcessPayment}
                    isProcessing={isProcessing}
                  />
                )}

                {/* Card Sub-Options */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 font-mono text-xs outline-none focus:border-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 font-mono text-xs outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 font-mono text-xs outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking Sub-Options */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 text-xs">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Popular Banks</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak', 'Others'].map(bank => (
                        <button
                          key={bank}
                          type="button"
                          className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 text-xs font-semibold"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Summary Breakdown */}
              <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Meal Subtotal</span>
                  <span className="font-mono text-white">₹{itemsSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>5% Dining GST</span>
                  <span className="font-mono text-white">₹{gstAmount}</span>
                </div>
                {effectiveTip > 0 && (
                  <div className="flex justify-between text-amber-300 font-semibold">
                    <span>Waitstaff Tip</span>
                    <span className="font-mono">₹{effectiveTip}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-white font-semibold">
                    <span>Discount Voucher</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-800 flex justify-between font-black text-sm text-white">
                  <span>Final Bill Amount:</span>
                  <span className="text-white text-base font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Non-UPI Pay Button (If Card or Net Banking is active) */}
              {paymentMethod !== 'upi' && (
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 text-white text-sm font-extrabold shadow-xl shadow-gray-950 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : 'hover:brightness-110 hover:scale-[1.01]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Processing Card Payment (₹{grandTotal})...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-gray-200" />
                      <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Settle Table ➔</span>
                    </>
                  )}
                </button>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
