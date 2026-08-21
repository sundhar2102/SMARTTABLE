import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  UtensilsCrossed,
  Store,
  Building,
  Building2,
  Zap,
  AlertCircle
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';

export const OwnerLoginPage = () => {
  const navigate = useNavigate();
  const { loginUser, restaurants, selectedRestaurantId } = useApp();

  const [selectedRestId, setSelectedRestId] = useState(
    selectedRestaurantId || (restaurants[0] ? restaurants[0].id : '')
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser('owner', {
        username: email.trim(),
        password: password.trim(),
        restaurantId: selectedRestId
      });

      setIsLoading(false);
      if (!res?.success) {
        setErrorMessage(res?.error || 'Authentication failed. Please check your owner email and password.');
        return;
      }
      navigate('/');
    }, 450);
  };

  const handleQuickDemo = () => {
    setErrorMessage('');
    setIsLoading(true);
    const adminRestId = selectedRestaurantId || (restaurants[0] ? restaurants[0].id : 'on-de-roof-chennai');
    setTimeout(() => {
      const res = loginUser('owner', {
        username: 'owner',
        password: 'owner123',
        restaurantId: adminRestId
      });
      setIsLoading(false);
      if (res?.success) {
        navigate('/');
      } else {
        setErrorMessage(res?.error || 'Demo login failed.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gray-400/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-orange-600/8 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-rose-600/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-gray-400 via-orange-500 to-rose-600 p-0.5 shadow-2xl shadow-gray-900/50 mb-4">
            <div className="w-full h-full bg-gray-950 rounded-[22px] flex items-center justify-center">
              <Store className="w-7 h-7 text-gray-300" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            SmartTable<span className="text-gray-300">.ai</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Restaurant Owner Portal</p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-3xl border border-gray-800 shadow-2xl shadow-gray-900/30 overflow-hidden">
          
          {/* Role Badge */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-gray-900/50 via-orange-950/30 to-gray-950 border-b border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gray-400/20 border border-gray-400/30 text-amber-300">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Restaurant Owner Sign In</h2>
                <p className="text-xs text-gray-400">Manage floor plans, tables & kitchen operations</p>
              </div>
            </div>
          </div>

          {/* Benefits Banner */}
          <div className="mx-6 mt-5 p-4 rounded-2xl bg-gray-900/40 border border-gray-800 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-gray-300" />
              <span>Owner / Host Admin Benefits</span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-300 shrink-0" />
                Interactive live floor plan manager
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-300 shrink-0" />
                Real-time occupancy & turnover stats
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-300 shrink-0" />
                AI host advice & demand forecasting
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-300 shrink-0" />
                Host reservation queue management
              </li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-black/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-gray-300" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google & Apple Social Login */}
            <SocialAuthButtons 
              role="owner" 
              theme="dark" 
              dividerText="or sign in with partner email" 
              onSuccess={() => navigate('/')} 
            />

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Select Restaurant Property
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700/60 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-400/70 focus:ring-1 focus:ring-gray-800 transition-all"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Admin Account Email / Host ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700/60 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-400/70 focus:ring-1 focus:ring-gray-800 transition-all"
                  placeholder="owner@restaurant.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700/60 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-400/70 focus:ring-1 focus:ring-gray-800 transition-all"
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
                  className="rounded bg-gray-900 border-gray-700 text-gray-400 w-3.5 h-3.5"
                />
                <span>Remember session</span>
              </label>
              <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Forgot access key?</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-gray-400 via-orange-500 to-gray-400 hover:brightness-110 shadow-gray-900/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Launch Owner Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-2 text-xs text-gray-400">
              <span>New restaurant partner? </span>
              <Link to="/register/owner" className="font-bold text-gray-300 hover:underline">
                Register Your Venue →
              </Link>
            </div>
          </form>

          {/* Quick Demo */}
          <div className="px-6 pb-6 space-y-3">
            <div className="border-t border-gray-800/60 pt-4">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block text-center mb-3">
                Quick 1-Click Demo Login
              </span>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-3 rounded-xl bg-gray-900/80 hover:bg-gray-900/50 border border-gray-800 hover:border-gray-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-gray-300" />
                <span>Instant Demo Owner Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cross-Links to Other Portals */}
        <div className="mt-6 p-4 glass-panel rounded-2xl border border-gray-800/60">
          <p className="text-xs text-gray-400 text-center mb-3">Not a restaurant owner? Sign in as:</p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/login/customer"
              className="py-2.5 px-3 rounded-xl bg-gray-900/60 hover:bg-gray-900/40 border border-gray-800 hover:border-black/30 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer / Diner</span>
            </Link>
            <Link
              to="/login/admin"
              className="py-2.5 px-3 rounded-xl bg-gray-900/60 hover:bg-purple-950/40 border border-gray-800 hover:border-gray-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-500 mt-4">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            SmartTable AI
          </span>
          {' '}• Restaurant Owner Console • Floor Plan & Kitchen Operations
        </p>
      </div>
    </div>
  );
};
