import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Zap, 
  QrCode, 
  ShieldCheck, 
  IndianRupee, 
  Receipt, 
  Sparkles, 
  CheckCircle2,
  Lock,
  UtensilsCrossed
} from 'lucide-react';
import { UpiPaymentQrCard, UPI_ID, PAYEE_NAME } from './UpiPaymentQrCard';
import confetti from 'canvas-confetti';
import { playOrderAlert } from '../../utils/audioUtils';

export const QuickPayModal = () => {
  const { 
    quickPayModalOpen, 
    setQuickPayModalOpen, 
    quickPayConfig, 
    triggerToast,
    userReservations,
    openPayBill
  } = useApp();

  const initialAmount = quickPayConfig?.amount || 500;
  const initialNote = quickPayConfig?.note || 'SmartTable Dining Payment';

  const [amount, setAmount] = useState(initialAmount);
  const [customNote, setCustomNote] = useState(initialNote);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  if (!quickPayModalOpen) return null;

  const handlePaymentSuccess = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      const txnId = `TXN-UPI-${Math.floor(100000 + Math.random() * 900000)}`;
      const details = {
        transactionId: txnId,
        upiId: UPI_ID,
        payee: PAYEE_NAME,
        amount: Number(amount || 0),
        note: customNote,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
      };
      setTransactionDetails(details);

      playOrderAlert('served');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      triggerToast('UPI Payment Verified! 💸', `₹${amount} paid to ${UPI_ID} successfully.`, 'info');
    }, 1200);
  };

  const handleClose = () => {
    setPaymentSuccess(false);
    setTransactionDetails(null);
    setQuickPayModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-black shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-black">
        
        {/* Top Header */}
        <div className="p-5 border-b border-gray-300 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-black text-black">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black tracking-tight">Instant UPI Payment QR</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white text-black border border-black">
                  LIVE UPI
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Pay directly to <span className="font-mono text-black font-bold">{UPI_ID}</span>
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {paymentSuccess && transactionDetails ? (
            /* SUCCESS RECEIPT */
            <div className="space-y-5 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-gray-800 border border-black/50 text-white flex items-center justify-center mx-auto shadow-xl shadow-gray-900/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-widest block">PAYMENT COMPLETED</span>
                <h4 className="text-2xl font-black text-white">₹{transactionDetails.amount.toLocaleString('en-IN')}</h4>
                <p className="text-xs text-gray-400">
                  Sent to {transactionDetails.upiId} at {transactionDetails.paidAt}
                </p>
              </div>

              {/* Receipt card */}
              <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-gray-800">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono text-white font-bold">{transactionDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payee UPI ID</span>
                  <span className="font-mono text-white">{transactionDetails.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Merchant / Beneficiary</span>
                  <span className="text-white font-medium">{transactionDetails.payee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Purpose</span>
                  <span className="text-white font-medium">{transactionDetails.note}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white">{transactionDetails.date}</span>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between font-black text-sm text-white">
                  <span>Status</span>
                  <span className="text-white flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> SUCCESS
                  </span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg hover:brightness-110 cursor-pointer"
              >
                Close & Return ✨
              </button>
            </div>
          ) : (
            /* PAYMENT FORM & QR CARD */
            <div className="space-y-4">
              
              {/* Amount Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block flex items-center justify-between">
                  <span>Enter / Select Amount:</span>
                  <span className="text-white font-mono font-bold">₹{Number(amount || 0).toLocaleString('en-IN')}</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    placeholder="Enter amount in ₹"
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-900 border border-gray-700/80 rounded-2xl text-white font-mono text-base font-black outline-none focus:border-black"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[250, 500, 1000, 2000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-black text-white shadow-md'
                          : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose / Note */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Payment Note / Table No:
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Table 4 Dinner, Food Pre-Order"
                  className="w-full px-3.5 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-black"
                />
              </div>

              {/* QR Code Card */}
              <UpiPaymentQrCard 
                amount={amount}
                note={customNote}
                onPaymentSuccess={handlePaymentSuccess}
                isProcessing={isProcessing}
              />

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
