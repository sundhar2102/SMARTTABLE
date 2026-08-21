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
  Building2,
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';

export const PlatformAdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useApp();

  const [adminId, setAdminId] = useState('');
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
      const res = loginUser('admin', {
        username: email.trim() || adminId.trim(),
        password: password.trim()
      });

      setIsLoading(false);
      if (!res?.success) {
        setErrorMessage(res?.error || 'Authentication failed. Please verify Super Admin credentials.');
        return;
      }
      navigate('/');
    }, 450);
  };

  const handleQuickDemo = () => {
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      const res = loginUser('admin', {
        username: 'admin',
        password: 'admin123'
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
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-gray-500 to-violet-600 p-0.5 shadow-2xl shadow-purple-950/50 mb-4">
            <div className="w-full h-full bg-gray-950 rounded-[22px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-gray-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            SmartTable<span className="text-gray-400">.ai</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Platform Super Admin Portal</p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-3xl border border-gray-500/20 shadow-2xl shadow-purple-950/30 overflow-hidden">
          
          {/* Role Badge */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-purple-950/50 via-indigo-950/30 to-gray-950 border-b border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-gray-500/30 text-purple-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Platform Admin Sign In</h2>
                <p className="text-xs text-gray-400">Approve restaurants, manage partners & platform analytics</p>
              </div>
            </div>
          </div>

          {/* Benefits Banner */}
          <div className="mx-6 mt-5 p-4 rounded-2xl bg-purple-950/40 border border-gray-500/20 text-xs">
            <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-gray-300" />
              <span>Super Admin Capabilities</span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0" />
                Restaurant onboarding approvals
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0" />
                Partner verification & compliance
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0" />
                Platform-wide analytics dashboard
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0" />
                FSSAI & GSTIN document audit
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
              role="admin" 
              theme="dark" 
              dividerText="or sign in with admin ID" 
              onSuccess={() => navigate('/')} 
            />

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Admin Username or Super Admin ID
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700/60 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-500/70 focus:ring-1 focus:ring-gray-500/20 transition-all"
                  placeholder="admin or SA-ADMIN-001"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Admin Email (Optional if Admin ID provided)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700/60 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-500/70 focus:ring-1 focus:ring-gray-500/20 transition-all"
                  placeholder="admin@smarttable.ai"
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
                  className="w-full bg-gray-900/80 border border-gray-700/60 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-500/70 focus:ring-1 focus:ring-gray-500/20 transition-all"
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
                  className="rounded bg-gray-900 border-gray-700 text-gray-500 w-3.5 h-3.5"
                />
                <span>Remember session</span>
              </label>
              <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Request access</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-purple-600 via-gray-500 to-purple-600 hover:brightness-110 shadow-purple-950/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Super Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
                className="w-full py-3 rounded-xl bg-gray-900/80 hover:bg-purple-950/50 border border-gray-800 hover:border-gray-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-gray-300" />
                <span>Instant Demo Super Admin Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cross-Links to Other Portals */}
        <div className="mt-6 p-4 glass-panel rounded-2xl border border-gray-800/60">
          <p className="text-xs text-gray-400 text-center mb-3">Not a platform admin? Sign in as:</p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/login/customer"
              className="py-2.5 px-3 rounded-xl bg-gray-900/60 hover:bg-gray-900/40 border border-gray-800 hover:border-black/30 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer / Diner</span>
            </Link>
            <Link
              to="/login/owner"
              className="py-2.5 px-3 rounded-xl bg-gray-900/60 hover:bg-gray-900/40 border border-gray-800 hover:border-gray-400/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Restaurant Owner</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-500 mt-4">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            SmartTable AI
          </span>
          {' '}• Platform Administration • Partner Approvals & Compliance
        </p>
      </div>
    </div>
  );
};
