import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Store, 
  Mail, 
  Lock, 
  Key, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  ShieldCheck,
  Building,
  AlertCircle
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';

export const AuthModal = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authDefaultRole, 
    loginUser,
    restaurants,
    selectedRestaurantId 
  } = useApp();

  const [activeTab, setActiveTab] = useState(authDefaultRole || 'customer'); // 'customer' | 'admin'

  // Form states
  const [email, setEmail] = useState('hemasundar@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Hema Sundar');
  const [selectedRestId, setSelectedRestId] = useState(selectedRestaurantId || (restaurants[0] ? restaurants[0].id : 'on-de-roof-chennai'));
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!authModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const targetRole = activeTab === 'admin' ? 'owner' : 'customer';
    const res = loginUser(targetRole, {
      username: email.trim(),
      password: password.trim(),
      restaurantId: selectedRestId
    });

    if (!res?.success) {
      setErrorMessage(res?.error || 'Authentication failed. Please check your credentials.');
      return;
    }
    setAuthModalOpen(false);
  };

  const handleQuickCustomerDemo = () => {
    setErrorMessage('');
    const res = loginUser('customer', {
      username: 'user',
      password: 'user123'
    });
    if (res?.success) {
      setAuthModalOpen(false);
    } else {
      setErrorMessage(res?.error || 'Demo login failed.');
    }
  };

  const handleQuickAdminDemo = () => {
    setErrorMessage('');
    const adminRestId = selectedRestaurantId || (restaurants[0] ? restaurants[0].id : 'on-de-roof-chennai');
    const res = loginUser('owner', {
      username: 'owner',
      password: 'owner123',
      restaurantId: adminRestId
    });
    if (res?.success) {
      setAuthModalOpen(false);
    } else {
      setErrorMessage(res?.error || 'Demo login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-black/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/40 via-indigo-950/30 to-gray-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-black/30 border border-gray-700 text-gray-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">SmartTable Portal Access</h3>
              <p className="text-xs text-gray-400">Sign in to manage floor plans or view reservations</p>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Switcher Tabs */}
        <div className="p-4 bg-gray-950/90 border-b border-gray-800">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-900 border border-gray-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('customer');
                setEmail('karthik.subramanian@example.com');
                setName('Karthik Subramanian');
              }}
              className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-gray-900/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer Sign In</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                setEmail('admin@restaurant.com');
                setName('Restaurant Owner Admin');
              }}
              className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-gray-400 to-orange-600 text-white shadow-lg shadow-gray-900/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Restaurant Owner Admin</span>
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Persona Features Banner */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
            activeTab === 'customer'
              ? 'bg-gray-900/50 border-black/30 text-emerald-200'
              : 'bg-gray-900/50 border-gray-400/30 text-amber-200'
          }`}>
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>
                {activeTab === 'customer' ? 'Customer Account Benefits:' : 'Owner / Host Admin Benefits:'}
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-gray-300">
              {activeTab === 'customer' ? (
                <>
                  <li className="flex items-center gap-1">✓ Live real-time floor availability</li>
                  <li className="flex items-center gap-1">✓ Instant table booking & digital QR pass</li>
                  <li className="flex items-center gap-1">✓ AI walk-in probability calculator</li>
                  <li className="flex items-center gap-1">✓ Real-time table alerts</li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-1">✓ Interactive live floor plan manager</li>
                  <li className="flex items-center gap-1">✓ Real-time occupancy & turnover stats</li>
                  <li className="flex items-center gap-1">✓ AI host advice & demand forecasting</li>
                  <li className="flex items-center gap-1">✓ Host reservation queue management</li>
                </>
              )}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-black/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-gray-300" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google & Apple Social Login */}
            <SocialAuthButtons 
              role={activeTab === 'admin' ? 'owner' : 'customer'} 
              theme="dark" 
              dividerText={activeTab === 'admin' ? 'or sign in with owner host ID' : 'or sign in with email'} 
              onSuccess={() => setAuthModalOpen(false)} 
            />

            {activeTab === 'customer' ? (
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-black"
                    placeholder="Alex Rivera"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Select Restaurant Property
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <select
                    value={selectedRestId}
                    onChange={(e) => setSelectedRestId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gray-400"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                {activeTab === 'customer' ? 'Email Address' : 'Admin Account Email / Host ID'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-black"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-black"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700 text-black"
                />
                <span>Remember session</span>
              </label>
              <span className="text-gray-500 hover:text-gray-300 cursor-pointer">Forgot access key?</span>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 hover:brightness-110 shadow-gray-900/50'
                  : 'bg-gradient-to-r from-gray-400 via-orange-500 to-gray-400 hover:brightness-110 shadow-gray-900/50'
              }`}
            >
              <span>{activeTab === 'customer' ? 'Sign In as Customer' : 'Launch Owner Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo Credentials Buttons */}
          <div className="pt-4 border-t border-gray-800/80 space-y-2">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block text-center">
              Quick 1-Click Demo Logins
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickCustomerDemo}
                className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-950 border border-gray-800 hover:border-gray-700 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Demo Customer</span>
              </button>

              <button
                type="button"
                onClick={handleQuickAdminDemo}
                className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-900/60 border border-gray-800 hover:border-gray-400/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Demo Owner / Admin</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
