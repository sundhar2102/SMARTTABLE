import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DEV_DEMO_ACCOUNTS } from '../../data/mockData';
import {
  X,
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
  Building,
  KeyRound,
  AlertCircle,
  Phone,
  UtensilsCrossed,
  UserPlus,
  LogIn
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';

export const MultiRoleLoginModal = ({ 
  isOpen, 
  onClose, 
  initialRole = 'customer',
  initialMode = 'signin' // 'signin' | 'register'
}) => {
  const { 
    loginUser, 
    restaurants, 
    triggerToast, 
    setRegisterRestaurantModalOpen,
    addUser,
    registerUser,
    verifyOtpUser
  } = useApp();

  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'register'
  const [activeRole, setActiveRole] = useState(initialRole); // 'customer' | 'owner' | 'admin'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [favoriteCuisine, setFavoriteCuisine] = useState('South Indian');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || 'on-de-roof-chennai');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setActiveRole(initialRole === 'admin' && initialMode === 'register' ? 'customer' : initialRole);
      setErrorMessage('');
    }
  }, [isOpen, initialRole, initialMode]);

  if (!isOpen) return null;

  // Handle Role Tab Change
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
      'Demo Credentials Loaded 🔑',
      `Filled ${demo.name} (${demo.badge}). Click Sign In to enter.`,
      'info'
    );
  };  // Quick 1-Click Instant Login
  const handleInstantDemoLogin = async (roleKey) => {
    const demo = DEV_DEMO_ACCOUNTS[roleKey];
    if (!demo) return;

    setIsLoading(true);
    try {
      const res = await loginUser(roleKey, {
        username: demo.username,
        password: demo.password,
        name: demo.name,
        email: demo.email,
        restaurantId: demo.restaurantId || selectedRestaurantId
      });
      if (res?.success) {
        onClose();
      } else if (res?.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit for Login or Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'register') {
      // REGISTRATION SUBMIT
      if (activeRole === 'customer') {
        if (!fullName.trim() || !usernameOrEmail.trim() || !password.trim()) {
          setErrorMessage('Please fill in your full name, email/username, and password.');
          return;
        }

        setIsLoading(true);
        try {
          const newUserData = {
            id: `USR-${Date.now()}`,
            name: fullName.trim(),
            username: usernameOrEmail.trim().toLowerCase(),
            email: usernameOrEmail.includes('@') ? usernameOrEmail.trim() : `${usernameOrEmail.trim()}@gmail.com`,
            phone: phoneNumber.trim() || '+91 98400 12345',
            password: password.trim(),
            role: 'customer',
            favoriteCuisine,
            reservationsCount: 0,
            status: 'active'
          };

          const regRes = registerUser ? await registerUser(newUserData) : await addUser(newUserData);
          if (regRes && !regRes.success) {
            setErrorMessage(regRes.error || 'Failed to register account.');
            return;
          }

          if (regRes && regRes.requireOtp) {
            setShowOtpStep(true);
            setRegisteredEmail(newUserData.email);
            return;
          }

          onClose();
        } catch (err) {
          setErrorMessage(err.message || 'Failed to register account.');
        } finally {
          setIsLoading(false);
        }

      } else if (activeRole === 'owner') {
        // Switch to full restaurant wizard
        onClose();
        setRegisterRestaurantModalOpen(true);
      }
      return;
    }

    // SIGN IN SUBMIT
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const authRes = await loginUser(activeRole, {
        username: usernameOrEmail.trim(),
        password: password.trim(),
        restaurantId: selectedRestaurantId
      });

      if (!authRes.success) {
        setErrorMessage(authRes.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Theme settings
  const getRoleTheme = () => {
    if (activeRole === 'admin') {
      return {
        accent: 'purple',
        pillBg: 'bg-purple-100 text-purple-900 border-purple-200',
        title: 'Platform Super Admin',
        subtitle: 'Platform metrics, partner verification, user governance & refunds',
        btnBg: 'bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white',
        icon: <Building2 className="w-5 h-5 text-purple-600" />
      };
    }
    if (activeRole === 'owner') {
      return {
        accent: 'amber',
        pillBg: 'bg-amber-100 text-amber-900 border-amber-200',
        title: authMode === 'register' ? 'Restaurant Partner Registration' : 'Restaurant Owner Console',
        subtitle: authMode === 'register' 
          ? 'List your dining establishment, configure live table radar & accept pre-orders' 
          : 'Floor plan manager, wait time auto-calc, billing & online payments',
        btnBg: 'bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white',
        icon: <Store className="w-5 h-5 text-gray-400" />
      };
    }
    return {
      accent: 'emerald',
      pillBg: 'bg-[#d2f9d5] text-[#0f5128] border-[#bbf7c1]',
      title: authMode === 'register' ? 'New Diner Registration' : 'User (Diner) Portal',
      subtitle: authMode === 'register'
        ? 'Create your diner account for instant bookings & kitchen pre-orders'
        : 'Live table vacancy radar, reservations, dish pre-orders & QR entry pass',
      btnBg: 'bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white',
      icon: <User className="w-5 h-5 text-emerald-600" />
    };
  };

  const theme = getRoleTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 bg-[#f9fbf9]">
          
          {/* Top Switcher: Sign In vs Create Account */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d2f9d5] text-[#0f5128]">
              {authMode === 'register' ? 'ACCOUNT REGISTRATION' : 'AUTHENTICATION PORTAL'}
            </span>

            {/* Auth Mode Toggle Buttons */}
            <div className="flex items-center p-0.5 bg-gray-200/80 rounded-xl text-xs font-bold mr-8">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage('');
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  if (activeRole === 'admin') setActiveRole('customer');
                  setErrorMessage('');
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#0a0d0a] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>Register</span>
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-[#0a0d0a] tracking-tight">
            {authMode === 'register' ? 'Create Your Account.' : 'Sign In to SmartTable.'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {authMode === 'register'
              ? 'Join SmartTable as a Diner or register your Restaurant as a Partner.'
              : 'Select your role to access your personalized dining, host, or admin dashboard.'}
          </p>

          {/* Role Selection Tabs (Registration only allows User & Owner) */}
          <div className={`grid gap-1.5 p-1 rounded-2xl bg-gray-100/90 border border-gray-200 mt-4 ${
            authMode === 'register' ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            
            <button
              type="button"
              onClick={() => handleRoleChange('customer')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'customer'
                  ? 'bg-[#0a0d0a] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{authMode === 'register' ? '1. User (Diner) Signup' : 'User (Diner)'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('owner')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'owner'
                  ? 'bg-[#0a0d0a] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{authMode === 'register' ? '2. Restaurant Owner' : 'Owner'}</span>
            </button>

            {authMode === 'signin' && (
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-[#0a0d0a] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

          </div>
        </div>

        {/* Modal Body: Login / Register Form */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Active Role Feature Summary */}
          <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-gray-200 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm shrink-0">
              {theme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-[#0a0d0a]">{theme.title}</div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{theme.subtitle}</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* If Owner Registration is selected */}
          {authMode === 'register' && activeRole === 'owner' ? (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-400 text-white flex items-center justify-center mx-auto shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">Partner Restaurant Registration</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                Ready to register your dining establishment? Use our 4-step Partner Wizard with GPS location mapping, floor table manager, and instant UPI payout configuration.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setRegisterRestaurantModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Restaurant Registration Wizard</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          ) : showOtpStep ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-2 mb-4">
                <Mail className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
                <h3 className="text-gray-900 font-bold text-lg">Verify Your Email</h3>
                <p className="text-xs text-gray-500">
                  We've sent a 6-digit verification code to <br/>
                  <strong className="text-gray-700">{registeredEmail}</strong>
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-gray-900 placeholder-gray-400 outline-none focus:border-[#0a0d0a] transition-all"
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  setErrorMessage('');
                  if (otp.length !== 6) {
                    setErrorMessage('Please enter a 6-digit code.');
                    return;
                  }
                  setIsLoading(true);
                  const res = await verifyOtpUser(registeredEmail, otp, activeRole);
                  setIsLoading(false);
                  if (res.success) {
                    onClose();
                  } else {
                    setErrorMessage(res.error || 'Invalid OTP code.');
                  }
                }}
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Complete Registration</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowOtpStep(false);
                  setOtp('');
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Back to details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Google & Apple Social Login */}
              <SocialAuthButtons 
                role={activeRole} 
                theme="light" 
                dividerText={authMode === 'register' ? 'or register with email' : 'or sign in with credentials'}
                onSuccess={onClose} 
              />
              
              {/* Full Name field for Diner registration */}
              {authMode === 'register' && activeRole === 'customer' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sundaram"
                      className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0a0d0a] focus:ring-1 focus:ring-[#0a0d0a] transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Phone Number for Diner registration */}
              {authMode === 'register' && activeRole === 'customer' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Phone Number (for SMS QR Pass)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98400 12345"
                      className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono outline-none focus:border-[#0a0d0a] focus:ring-1 focus:ring-[#0a0d0a] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Restaurant Selector for Owners (Sign In mode) */}
              {authMode === 'signin' && activeRole === 'owner' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Assigned Restaurant Property
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <select
                      value={selectedRestaurantId}
                      onChange={(e) => setSelectedRestaurantId(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0a0d0a] focus:ring-1 focus:ring-[#0a0d0a] transition-all"
                    >
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.location?.split(',')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Username / Email Input */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  {authMode === 'register' 
                    ? 'Email Address or Desired Username *' 
                    : activeRole === 'admin' 
                      ? 'Admin Username or Email' 
                      : activeRole === 'owner' 
                        ? 'Owner / Manager Username' 
                        : 'Username or Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder={
                      authMode === 'register'
                        ? 'name@example.com'
                        : activeRole === 'admin'
                          ? 'e.g. admin'
                          : activeRole === 'owner'
                            ? 'e.g. owner'
                            : 'e.g. user'
                    }
                    className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0a0d0a] focus:ring-1 focus:ring-[#0a0d0a] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  {authMode === 'register' ? 'Create Password *' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      authMode === 'register'
                        ? 'At least 6 characters'
                        : activeRole === 'admin' ? 'Default: admin' : activeRole === 'owner' ? 'Default: owner' : 'Default: user'
                    }
                    className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0a0d0a] focus:ring-1 focus:ring-[#0a0d0a] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Auto-fill Link (Sign In mode) */}
              {authMode === 'signin' && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#0a0d0a] focus:ring-[#0a0d0a] w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Keep me signed in</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleFillDemo(activeRole === 'admin' ? 'admin' : activeRole === 'owner' ? 'owner' : 'user')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    Auto-fill credentials
                  </button>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {authMode === 'register'
                        ? 'Create Diner Account & Start'
                        : `Sign In as ${activeRole === 'admin' ? 'Super Admin' : activeRole === 'owner' ? 'Restaurant Owner' : 'Diner'}`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#d2f9d5]" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Switch between Sign in and Register at bottom */}
          <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
            {authMode === 'signin' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    if (activeRole === 'admin') setActiveRole('customer');
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Register as Diner or Owner
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Sign In here
                </button>
              </span>
            )}
          </div>

          {/* Dev / Demo Seed 1-Click Access Pill Box (Sign In mode) */}
          {authMode === 'signin' && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                <span>Quick 1-Click Demo Login:</span>
                <span className="text-[10px] text-emerald-700 font-mono font-normal">Pre-configured Seed</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('user')}
                  className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#d2f9d5]/40 border border-gray-200 hover:border-black text-left transition-all cursor-pointer group"
                >
                  <div className="text-[11px] font-extrabold text-gray-900 group-hover:text-emerald-800 flex items-center justify-between">
                    <span>Diner</span>
                    <Zap className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">user/user</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('owner')}
                  className="p-2.5 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-gray-400 text-left transition-all cursor-pointer group"
                >
                  <div className="text-[11px] font-extrabold text-gray-900 group-hover:text-amber-800 flex items-center justify-between">
                    <span>Owner</span>
                    <Zap className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">owner/owner</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('admin')}
                  className="p-2.5 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-gray-500 text-left transition-all cursor-pointer group"
                >
                  <div className="text-[11px] font-extrabold text-gray-900 group-hover:text-purple-800 flex items-center justify-between">
                    <span>Admin</span>
                    <Zap className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">admin/admin</div>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
