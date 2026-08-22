import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  Receipt,
  Smartphone,
  Building,
  Zap
} from 'lucide-react';
export const PaymentGatewayModal = ({ isOpen, onClose, billData, onPaymentSuccess }) => {
  const { triggerToast } = useApp();

  const [selectedGateway, setSelectedGateway] = useState('razorpay'); // 'razorpay' | 'stripe' | 'upi'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Form states for card/upi
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState('diner@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen || !billData) return null;

  const totalAmount = billData.amount || billData.grandTotal || 850;
  const tableName = billData.tableName || `Table ${billData.tableId || '1'}`;
  const restaurantName = billData.restaurantName || 'SmartTable Restaurant';
  const guestName = billData.guestName || 'Diner Guest';

  const handleProcessPayment = async (e) => {
    e?.preventDefault();
    setIsProcessing(true);

    try {
      const res = await apiService.initiatePayment({
        bookingId: billData.id || billData.bookingId || null,
        restaurantId: billData.restaurantId || 'on-de-roof-chennai',
        amount: totalAmount,
        paymentMethod: selectedGateway.toUpperCase(),
        gateway: selectedGateway === 'razorpay' ? 'Razorpay PG (Demo Mode)' : selectedGateway === 'stripe' ? 'Stripe Payments (Demo Mode)' : 'Instant UPI Gateway (Demo Mode)'
      });

      setIsProcessing(false);
      setIsPaidSuccess(true);

      const txnId = res?.data?.transactionId || (selectedGateway === 'razorpay' 
        ? `pay_rzp_${Math.floor(10000000 + Math.random() * 90000000)}` 
        : selectedGateway === 'stripe'
          ? `ch_strp_${Math.floor(10000000 + Math.random() * 90000000)}`
          : `upi_txn_${Math.floor(10000000 + Math.random() * 90000000)}`);

      const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const successPayload = {
        transactionId: txnId,
        invoiceId,
        gateway: selectedGateway === 'razorpay' ? 'Razorpay PG (Demo Mode)' : selectedGateway === 'stripe' ? 'Stripe Payments (Demo Mode)' : 'Instant UPI Gateway (Demo Mode)',
        paidAmount: totalAmount,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: selectedGateway.toUpperCase()
      };

      setPaymentDetails(successPayload);

      triggerToast(
        'Payment Collected & Recorded ✅',
        `₹${totalAmount} settled via ${successPayload.gateway} (Ref: ${txnId}).`,
        'info'
      );

      if (onPaymentSuccess) {
        onPaymentSuccess(successPayload);
      }
    } catch (err) {
      setIsProcessing(false);
      triggerToast('Payment Error ❌', err.message || 'Could not process payment.', 'alert');
    }
  };

  const handleClose = () => {
    setIsPaidSuccess(false);
    setPaymentDetails(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-black/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900/40 via-teal-950/30 to-gray-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-black/30 border border-gray-700 text-gray-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Collect Payment Online
              </h3>
              <p className="text-xs text-gray-400">
                {restaurantName} • {tableName} ({guestName})
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {isPaidSuccess && paymentDetails ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center mx-auto text-white shadow-xl shadow-gray-950">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">Payment Received!</h4>
                <p className="text-xs text-gray-200 font-semibold">
                  ₹{paymentDetails.paidAmount} confirmed via {paymentDetails.gateway}
                </p>
              </div>

              {/* Digital Receipt Box */}
              <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-gray-400 border-b border-gray-800 pb-2 font-sans font-bold">
                  <span>DIGITAL INVOICE</span>
                  <span className="text-white">STATUS: SETTLED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice ID:</span>
                  <span className="text-white font-bold">{paymentDetails.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Ref:</span>
                  <span className="text-white font-bold">{paymentDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gateway:</span>
                  <span className="text-indigo-300 font-bold">{paymentDetails.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Table:</span>
                  <span className="text-white">{tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Settled At:</span>
                  <span className="text-white">{paymentDetails.paidAt}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800 text-sm font-sans font-black text-white">
                  <span>Grand Total:</span>
                  <span className="text-white">₹{paymentDetails.paidAmount}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-black hover:bg-black text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                Close & Release Table
              </button>
            </div>
          ) : (
            /* PAYMENT FORM */
            <>
              {/* Bill Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900/50 to-gray-900 border border-black/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white font-extrabold uppercase tracking-wider block">
                    Bill Amount Due
                  </span>
                  <div className="text-2xl font-black text-white">
                    ₹{totalAmount}
                  </div>
                  <span className="text-[11px] text-gray-400">Includes 5% GST & applicable service charges</span>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-900 text-amber-300 border border-gray-400/30 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gray-300" />
                    {tableName}
                  </span>
                </div>
              </div>

              {/* Gateway Selector Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Select Payment Gateway:
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* Razorpay */}
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('razorpay')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      selectedGateway === 'razorpay'
                        ? 'bg-blue-950/70 border-gray-500 text-blue-200 shadow-md shadow-blue-950/50'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      <span>Razorpay</span>
                    </div>
                    <p className="text-[10px] text-gray-400">UPI, Cards, Netbanking</p>
                  </button>

                  {/* Stripe */}
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('stripe')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      selectedGateway === 'stripe'
                        ? 'bg-indigo-950/70 border-gray-500 text-indigo-200 shadow-md shadow-indigo-950/50'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      <span>Stripe</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Credit/Debit Cards</p>
                  </button>

                  {/* UPI Direct */}
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('upi')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      selectedGateway === 'upi'
                        ? 'bg-gray-900/70 border-black text-emerald-200 shadow-md shadow-gray-900/50'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>UPI QR</span>
                    </div>
                    <p className="text-[10px] text-gray-400">GPay, PhonePe, Paytm</p>
                  </button>
                </div>
              </div>

              {/* Dynamic Gateway Form Elements */}
              {selectedGateway === 'razorpay' && (
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-gray-500/20 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-300">
                    <span>Razorpay Standard Checkout v2.0</span>
                    <span className="text-[10px] text-gray-400 font-mono">ID: rzp_live_984421</span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Select Bank for Netbanking / UPI</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                    >
                      <option value="HDFC Bank">HDFC Bank (Instant Confirmation)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Google Pay / BHIM UPI">Google Pay / BHIM UPI</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedGateway === 'stripe' && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-gray-500/20 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-indigo-300">
                    <span>Stripe Elements Secure Payment</span>
                    <span className="text-[10px] text-gray-400 font-mono">SSL 256-bit</span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedGateway === 'upi' && (
                <div className="p-4 rounded-2xl bg-gray-900/30 border border-gray-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-200">
                    <span>Scan UPI QR Code</span>
                    <span className="text-[10px] text-white font-bold">VPA: sundhar8074@axl</span>
                  </div>

                  <div className="flex items-center justify-center p-3 bg-white rounded-xl max-w-[140px] mx-auto">
                    <QrCode className="w-24 h-24 text-black" />
                  </div>

                  <p className="text-[11px] text-center text-gray-400">
                    Scan using any UPI App (Google Pay, PhonePe, Paytm, CRED). Instant auto-verification enabled.
                  </p>
                </div>
              )}

              {/* Submit / Authorize Button */}
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-gray-300 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-gray-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize & Collect ₹{totalAmount} via {selectedGateway.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
