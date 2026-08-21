import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Download, 
  CheckCircle2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UPI_ID = 'sundhar8074@axl';
export const PAYEE_NAME = 'SmartTable Dining';

export const UpiPaymentQrCard = ({ 
  amount = 0, 
  note = 'SmartTable Dining Payment',
  orderId = '',
  onPaymentSuccess,
  isProcessing = false
}) => {
  const { triggerToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState('all'); // 'all' | 'gpay' | 'phonepe' | 'paytm'

  // Construct UPI Deep-link & QR payload
  const formattedAmount = Number(amount || 0).toFixed(2);
  const upiPayload = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note + (orderId ? ` (#${orderId})` : ''))}`;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      if (triggerToast) {
        triggerToast('UPI ID Copied! 📋', `${UPI_ID} copied to clipboard.`, 'info');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 border border-black/30 p-5 shadow-2xl space-y-4 text-gray-200">
      
      {/* Top Banner with UPI Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-gray-800 border border-gray-700 text-white font-black text-xs tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>BHIM UPI QR</span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Zero Fee • Instant</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>NPCI 256-bit Encrypted</span>
        </div>
      </div>

      {/* QR Code Canvas & Scanner Box */}
      <div className="relative mx-auto w-fit flex flex-col items-center">
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-500/20 rounded-3xl blur-xl -z-10" />

        <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-gray-900 flex flex-col items-center relative group">
          
          {/* Top UPI Brand in White Box */}
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-gray-200 text-gray-800 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-700">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Scan & Pay
            </span>
            <span className="font-mono text-gray-600 tracking-tighter">UPI 2.0</span>
          </div>

          {/* Dynamic SVG QR */}
          <div className="p-1 rounded-xl bg-white">
            <QRCodeSVG 
              value={upiPayload}
              size={180}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>

          {/* Amount Badge at bottom of QR */}
          <div className="mt-2 w-full text-center py-1 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs font-black text-emerald-800">
              ₹{Number(amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-2.5 flex items-center gap-1.5 font-medium">
          <span>Scan using Google Pay, PhonePe, Paytm, BHIM, or any banking app</span>
        </p>
      </div>

      {/* UPI ID Details & 1-Click Copy */}
      <div className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Payee UPI ID</div>
          <div className="font-mono text-xs sm:text-sm font-black text-gray-200 truncate">
            {UPI_ID}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyUpiId}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            copied
              ? 'bg-black text-white shadow-md'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy ID</span>
            </>
          )}
        </button>
      </div>

      {/* Direct App Launchers & Deep link */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
          <span>Or Open Directly in UPI App:</span>
          <span className="text-white font-mono text-[9px]">Tap to Launch</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'gpay', name: 'Google Pay', icon: '🟢' },
            { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
            { id: 'paytm', name: 'Paytm', icon: '🔵' },
            { id: 'all', name: 'Any UPI', icon: '⚡' }
          ].map(app => (
            <a
              key={app.id}
              href={upiPayload}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-900 hover:bg-gray-950 border border-gray-800 hover:border-black/50 text-center transition-all cursor-pointer group"
            >
              <div className="text-base leading-none mb-1 group-hover:scale-110 transition-transform">{app.icon}</div>
              <div className="text-[10px] font-bold text-gray-300 group-hover:text-gray-200 truncate">{app.name}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Manual Settle / Verification Button if provided */}
      {onPaymentSuccess && (
        <div className="pt-2 border-t border-gray-800 space-y-2">
          <button
            type="button"
            onClick={onPaymentSuccess}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-gray-900/50 flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : 'hover:brightness-110 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying UPI Payment (₹{Number(amount || 0).toLocaleString('en-IN')})...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-gray-200" />
                <span>I Have Paid ₹{Number(amount || 0).toLocaleString('en-IN')} via UPI ➔</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            <span>After scanning & completing transaction on your phone, click above to verify table receipt.</span>
          </p>
        </div>
      )}

    </div>
  );
};
