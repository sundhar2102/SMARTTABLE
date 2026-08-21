import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DEV_DEMO_ACCOUNTS } from '../../data/mockData';
import {
  User,
  Store,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  UtensilsCrossed,
  Flame,
  LayoutGrid,
  Clock,
  KeyRound,
  Compass,
  Building,
  AlertCircle
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';

export const UnifiedLandingLoginPage = () => {
  const navigate = useNavigate();
  const { loginUser, restaurants, triggerToast } = useApp();

  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'owner' | 'admin'
  
  // Form fields
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || 'on-de-roof-chennai');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Role Change
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMessage('');
    setUsernameOrEmail('');
    setPassword('');
  };

  // Quick 1-Click Fill of Dev/Demo Seed Account
  const handleFillDemo = (roleKey) => {
    const demo = DEV_DEMO_ACCOUNTS[roleKey];
    if (!demo) return;
    
    setActiveRole(roleKey === 'admin' ? 'admin' : roleKey === 'owner' ? 'owner' : 'customer');
    setUsernameOrEmail(demo.username);
    setPassword(demo.password);
    if (demo.restaurantId) {
      setSelectedRestaurantId(demo.restaurantId);
    }
    setErrorMessage('');
    triggerToast(
      'Demo Account Loaded 🔑',
      `Filled credentials for ${demo.name} (Role: ${demo.badge}). Click Sign In to enter.`,
      'info'
    );
  };

  // Quick 1-Click Instant Login
  const handleInstantDemoLogin = (roleKey) => {
    const demo = DEV_DEMO_ACCOUNTS[roleKey];
    if (!demo) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const res = loginUser(roleKey, {
        username: demo.username,
        password: demo.password,
        name: demo.name,
        email: demo.email,
        restaurantId: demo.restaurantId || selectedRestaurantId
      });
      setIsLoading(false);
      if (res?.success) {
        navigate('/');
      } else if (res?.error) {
        setErrorMessage(res.error);
      }
    }, 400);
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(activeRole, {
        username: usernameOrEmail.trim(),
        password: password.trim(),
        restaurantId: selectedRestaurantId
      });

      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      navigate('/');
    }, 450);
  };

  // Theme styling helpers based on active role
  const getTheme = () => {
    if (activeRole === 'admin') {
      return {
        accent: 'purple',
        badgeBg: 'bg-gray-500/10 border-gray-500/30 text-purple-300',
        cardBorder: 'border-gray-500/30 shadow-purple-950/40',
        glowBg: 'from-purple-950/50 via-indigo-950/30 to-gray-950',
        btnBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 shadow-purple-950/60',
        focusBorder: 'focus:border-gray-500/70 focus:ring-gray-500/20',
        iconBg: 'bg-purple-600/20 border-gray-500/30 text-purple-300',
        title: 'Platform Super Admin',
        subtitle: 'Platform oversight, user directory, partner verification & dispute resolution'
      };
    }
    if (activeRole === 'owner') {
      return {
        accent: 'amber',
        badgeBg: 'bg-gray-400/10 border-gray-400/30 text-amber-300',
        cardBorder: 'border-gray-400/30 shadow-gray-900/40',
        glowBg: 'from-gray-900/50 via-orange-950/30 to-gray-950',
        btnBg: 'bg-gradient-to-r from-gray-400 via-orange-500 to-gray-400 hover:brightness-110 shadow-gray-900/60',
        focusBorder: 'focus:border-gray-400/70 focus:ring-gray-800',
        iconBg: 'bg-gray-400/20 border-gray-400/30 text-amber-300',
        title: 'Restaurant Owner & Host Console',
        subtitle: 'Live floor plan manager, table status toggling, billing & kitchen dispatch'
      };
    }
    return {
      accent: 'emerald',
      badgeBg: 'bg-black/10 border-black/30 text-gray-200',
      cardBorder: 'border-black/30 shadow-gray-900/40',
      glowBg: 'from-gray-900/50 via-teal-950/30 to-gray-950',
      btnBg: 'bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 hover:brightness-110 shadow-gray-950',
      focusBorder: 'focus:border-black/70 focus:ring-gray-800',
      iconBg: 'bg-black/20 border-black/30 text-gray-200',
      title: 'User (Diner) Portal',
      subtitle: 'Live table availability, instant reservations, food pre-ordering & crowd radar'
    };
  };

  const theme = getTheme();

  return (
    <div className="min-h-screen bg-[#0b0f17] text-gray-100 flex flex-col justify-between relative overflow-hidden selection:bg-black selection:text-black">
      
      {/* Background Animated Glow Spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-black/8 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-gray-400/8 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      {/* Top Navbar */}
      <nav className="w-full border-b border-gray-800/80 glass-panel backdrop-blur-xl px-4 md:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-gray-300 to-indigo-600 p-0.5 shadow-lg shadow-gray-900/50 flex items-center justify-center">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight">
                  SmartTable<span className="text-white">.ai</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-gray-900 text-gray-200 border border-gray-700 rounded-full">
                  MULTI-ROLE AUTH
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Role-Based Table Telemetry, Reservation & Operations Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 hidden md:inline">Quick Test Fill:</span>
            <button
              onClick={() => handleFillDemo('user')}
              className="px-2.5 py-1 rounded-xl bg-gray-900/80 border border-gray-700 text-gray-200 text-[11px] font-bold hover:bg-emerald-900 transition-all cursor-pointer"
            >
              user / user
            </button>
            <button
              onClick={() => handleFillDemo('owner')}
              className="px-2.5 py-1 rounded-xl bg-gray-900/80 border border-gray-400/40 text-amber-300 text-[11px] font-bold hover:bg-gray-900 transition-all cursor-pointer"
            >
              owner / owner
            </button>
            <button
              onClick={() => handleFillDemo('admin')}
              className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-gray-500/40 text-purple-300 text-[11px] font-bold hover:bg-purple-900 transition-all cursor-pointer"
            >
              admin / admin
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 z-10">
        
        {/* Left Column: Hero & Role Selector Cards */}
        <div className="w-full lg:w-1/2 space-y-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 border border-black/30 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gray-300" />
              <span>3 Dedicated Portals • Real-Time Floor Telemetry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              One Unified System for <br />
              <span className="bg-gradient-to-r from-white via-teal-300 to-gray-400 bg-clip-text text-transparent">
                Diners, Owners & Admins
              </span>
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed">
              Select your role below to log in to your dedicated dashboard. Experience instant live table vacancy radar, full floor plan management, real-time wait estimation, and platform-wide governance.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              1. Choose Your Portal Role:
            </label>

            {/* Role Card 1: User (Diner) */}
            <div
              onClick={() => handleRoleChange('customer')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                activeRole === 'customer'
                  ? 'bg-gradient-to-r from-gray-950 to-gray-900 border-black/60 shadow-lg shadow-gray-900/40 ring-1 ring-gray-700'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/90'
              }`}
            >
              <div className={`p-3 rounded-xl ${activeRole === 'customer' ? 'bg-black text-white' : 'bg-gray-800 text-gray-400'}`}>
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-white text-base">User (Diner)</h3>
                  {activeRole === 'customer' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-800 text-gray-200 border border-gray-700 rounded-full">
                      ACTIVE SELECTION
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Browse restaurants with live table vacancy, book tables, pre-order dishes, and track wait times.
                </p>
              </div>
            </div>

            {/* Role Card 2: Restaurant Owner */}
            <div
              onClick={() => handleRoleChange('owner')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                activeRole === 'owner'
                  ? 'bg-gradient-to-r from-gray-900/60 to-gray-900 border-gray-400/60 shadow-lg shadow-gray-900/40 ring-1 ring-gray-400/40'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/90'
              }`}
            >
              <div className={`p-3 rounded-xl ${activeRole === 'owner' ? 'bg-gray-400 text-white' : 'bg-gray-800 text-gray-400'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-white text-base">Restaurant Owner</h3>
                  {activeRole === 'owner' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-800 text-amber-300 border border-gray-400/40 rounded-full">
                      ACTIVE SELECTION
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Accept/decline requests, toggle table status, auto-calculate wait times, manage bills & collect payments online.
                </p>
              </div>
            </div>

            {/* Role Card 3: Admin */}
            <div
              onClick={() => handleRoleChange('admin')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-purple-950/60 to-gray-900 border-gray-500/60 shadow-lg shadow-purple-950/40 ring-1 ring-gray-500/40'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/90'
              }`}
            >
              <div className={`p-3 rounded-xl ${activeRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-white text-base">Platform Super Admin</h3>
                  {activeRole === 'admin' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-500/20 text-purple-300 border border-gray-500/40 rounded-full">
                      ACTIVE SELECTION
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Manage registered users/owners, deactivate accounts, approve partner listings, view platform analytics & resolve disputes.
                </p>
              </div>
            </div>

          </div>

          {/* Dev/Demo Accounts Info Banner */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <KeyRound className="w-3.5 h-3.5" /> Dev / Demo Seed Accounts (Pre-configured)
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Local Testing Only</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div 
                onClick={() => handleInstantDemoLogin('user')}
                className="p-2.5 rounded-xl bg-gray-950 border border-black/30 hover:border-white transition-all cursor-pointer space-y-0.5 group"
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Diner</span>
                  <Zap className="w-3 h-3 text-white group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-gray-300 font-mono text-[10px]">user / user</div>
                <span className="text-[9px] text-black block">Click for 1-Click Login ➔</span>
              </div>

              <div 
                onClick={() => handleInstantDemoLogin('owner')}
                className="p-2.5 rounded-xl bg-gray-950 border border-gray-400/30 hover:border-gray-300 transition-all cursor-pointer space-y-0.5 group"
              >
                <div className="font-bold text-gray-300 flex items-center justify-between">
                  <span>Owner</span>
                  <Zap className="w-3 h-3 text-gray-300 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-gray-300 font-mono text-[10px]">owner / owner</div>
                <span className="text-[9px] text-gray-400 block">Click for 1-Click Login ➔</span>
              </div>

              <div 
                onClick={() => handleInstantDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-gray-950 border border-gray-500/30 hover:border-gray-400 transition-all cursor-pointer space-y-0.5 group"
              >
                <div className="font-bold text-gray-400 flex items-center justify-between">
                  <span>Admin</span>
                  <Zap className="w-3 h-3 text-gray-400 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-gray-300 font-mono text-[10px]">admin / admin</div>
                <span className="text-[9px] text-gray-500 block">Click for 1-Click Login ➔</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Tailored Authentication Form */}
        <div className="w-full lg:w-1/2 max-w-lg">
          <div className={`glass-panel rounded-3xl border ${theme.cardBorder} shadow-2xl overflow-hidden transition-all duration-300`}>
            
            {/* Form Header */}
            <div className={`p-6 border-b border-gray-800/80 bg-gradient-to-r ${theme.glowBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${theme.iconBg}`}>
                    {activeRole === 'admin' ? (
                      <Building2 className="w-6 h-6" />
                    ) : activeRole === 'owner' ? (
                      <Store className="w-6 h-6" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                      {theme.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {theme.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-black/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Google & Apple Social Login */}
              <SocialAuthButtons 
                role={activeRole} 
                theme="dark" 
                dividerText={`or sign in as ${activeRole === 'admin' ? 'super admin' : activeRole === 'owner' ? 'restaurant partner' : 'diner'}`}
                onSuccess={() => navigate('/')} 
              />

              {/* Restaurant Selector for Owner */}
              {activeRole === 'owner' && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Select Restaurant Property
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <select
                      value={selectedRestaurantId}
                      onChange={(e) => setSelectedRestaurantId(e.target.value)}
                      className={`w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none ${theme.focusBorder} transition-all`}
                    >
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id} className="bg-gray-900 text-white">
                          {r.name} ({r.location})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Username or Email Input */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {activeRole === 'admin' ? 'Admin Username or Email' : activeRole === 'owner' ? 'Owner Username or Host Email' : 'Username or Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder={
                      activeRole === 'admin' 
                        ? 'e.g. admin or admin@smarttable.ai' 
                        : activeRole === 'owner' 
                          ? 'e.g. owner or owner@restaurant.com' 
                          : 'e.g. user or yourname@example.com'
                    }
                    className={`w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none ${theme.focusBorder} transition-all`}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
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
                    placeholder={
                      activeRole === 'admin' ? 'Default: admin' : activeRole === 'owner' ? 'Default: owner' : 'Default: user'
                    }
                    className={`w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none ${theme.focusBorder} transition-all`}
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Help Links */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-black w-3.5 h-3.5"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span 
                  onClick={() => handleFillDemo(activeRole === 'admin' ? 'admin' : activeRole === 'owner' ? 'owner' : 'user')}
                  className="text-gray-400 hover:text-white cursor-pointer underline text-[11px]"
                >
                  Auto-fill demo credentials
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${theme.btnBg} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {activeRole === 'admin' 
                        ? 'Enter Super Admin Dashboard' 
                        : activeRole === 'owner' 
                          ? 'Enter Restaurant Owner Console' 
                          : 'Enter Diner Booking Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Dynamic Role-Based Registration Redirect */}
            <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 mx-6 mb-6 text-center text-xs space-y-2">
              <span className="text-gray-400 block text-[11px]">
                {activeRole === 'customer' 
                  ? "New to SmartTable? Join as a Diner for zero-wait reservations & pre-orders."
                  : activeRole === 'owner'
                    ? "New Restaurant Partner? Register your venue to take live table bookings."
                    : "Platform Administrator credentials are provisioned by system security."}
              </span>
              {activeRole !== 'admin' ? (
                <Link
                  to={activeRole === 'owner' ? '/register/owner' : '/register/user'}
                  className={`inline-flex items-center gap-1.5 font-bold text-xs hover:underline cursor-pointer ${
                    activeRole === 'owner' ? 'text-gray-300' : 'text-white'
                  }`}
                >
                  <span>Create New {activeRole === 'owner' ? 'Restaurant Partner' : 'Diner'} Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-[10px] text-gray-500 font-mono">Invite-only role access</span>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950 py-6 px-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="font-bold text-gray-300">SmartTable.ai</span> • Chennai Hyperlocal Live Floor Availability & Multi-Role Operations
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-[11px]">
            <span>Admin Gateway (Razorpay/Stripe)</span>
            <span>•</span>
            <span>Real-Time Turnaround Telemetry</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
