import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  UtensilsCrossed, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Leaf, 
  ShieldCheck, 
  AlertCircle,
  Store,
  Compass
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';
import { useAuthForm } from '../../hooks/useAuthForm';
import { getPasswordStrength } from '../../utils/authValidation';

const DIETARY_OPTIONS = [
  { id: 'all', label: 'All Cuisines', icon: '🍽️' },
  { id: 'veg', label: 'Pure Veg', icon: '🍃' },
  { id: 'nonveg', label: 'Non-Veg & Biryani', icon: '🍗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'halal', label: 'Halal Certified', icon: '🥩' },
  { id: 'jain', label: 'Jain Special', icon: '✨' }
];

const CITIES = [
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'New Delhi'
];

export const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    errors,
    showPassword,
    setShowPassword,
    handleRegister
  } = useAuthForm({ role: 'customer', redirectPath: '/' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dietaryPreference: 'all',
    city: 'Chennai',
    agreeTerms: true
  });

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      alert('Please agree to the Terms of Service to continue.');
      return;
    }
    await handleRegister(formData, {
      dietaryPreference: formData.dietaryPreference,
      city: formData.city
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Ambient Radial Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-black/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl z-10 my-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-gray-300 flex items-center justify-center text-white font-extrabold shadow-lg shadow-gray-950 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">SmartTable<span className="text-white">.ai</span></span>
          </Link>
          
          <div className="inline-block pt-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest bg-black/10 text-white border border-black/30">
              Diner & Foodie Registration
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Create Your Diner Account
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Get instant zero-wait seating reservations, live table vacancy radar, and exclusive foodie perks.
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Rounded-Pill Role Tab Selector (Exact Sign-In Style) */}
          <div className="bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800/80 grid grid-cols-2 gap-1.5">
            <div className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-gray-950 to-gray-900 border border-black/60 shadow-lg ring-1 ring-gray-700 text-gray-200 cursor-default">
              <User className="w-3.5 h-3.5" />
              <span>Diner Sign Up</span>
            </div>

            <Link
              to="/register/owner"
              className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
            >
              <Store className="w-3.5 h-3.5 text-gray-400" />
              <span>Restaurant Owner</span>
            </Link>
          </div>

          {/* Social OAuth Sign Up */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              Fast 1-Tap Sign Up
            </span>
            <SocialAuthButtons 
              role="customer" 
              theme="dark" 
              dividerText="or register with email & mobile"
              onSuccess={() => navigate('/')} 
            />
          </div>

          {/* Form Error Banner */}
          {errors.form && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-gray-300" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            
            <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                    <span>Full Name</span>
                    {errors.name && <span className="text-[11px] text-gray-300 font-normal">{errors.name}</span>}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Sundhara Pandian"
                      className={`w-full bg-gray-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                        errors.name ? 'border-black/80 focus:border-gray-300' : 'border-gray-800 focus:border-black'
                      }`}
                    />
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>Email Address</span>
                      {errors.email && <span className="text-[10px] text-gray-300 font-normal">{errors.email}</span>}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full bg-gray-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                          errors.email ? 'border-black/80 focus:border-gray-300' : 'border-gray-800 focus:border-black'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mobile Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>Mobile Phone</span>
                      {errors.phone && <span className="text-[10px] text-gray-300 font-normal">{errors.phone}</span>}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98400 12345"
                        className={`w-full bg-gray-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                          errors.phone ? 'border-black/80 focus:border-gray-300' : 'border-gray-800 focus:border-black'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-300">Create Password</label>
                    {formData.password && (
                      <span className={`text-[10px] font-mono font-bold ${passwordStrength.text}`}>
                        Strength: {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="At least 6 characters"
                      className={`w-full bg-gray-950/80 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                        errors.password ? 'border-black/80 focus:border-gray-300' : 'border-gray-800 focus:border-black'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength mini bar */}
                  {formData.password && (
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 rounded-full transition-all ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-gray-800'
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Diner Dietary Preference Pills */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-gray-300 block">
                    Primary Dietary Preference (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DIETARY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleChange('dietaryPreference', opt.id)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          formData.dietaryPreference === opt.id
                            ? 'bg-black/20 border-black text-gray-200 ring-1 ring-black/30'
                            : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* City Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block">Default City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-black cursor-pointer"
                    >
                      {CITIES.map(c => (
                        <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-emerald-600 focus:ring-black cursor-pointer"
                  />
                  <label htmlFor="agreeTerms" className="text-[11px] text-gray-400 cursor-pointer">
                    I agree to SmartTable's <span className="text-white hover:underline">Terms of Service</span> and <span className="text-white hover:underline">Privacy Policy</span>.
                  </label>
                </div>

                {/* Black Primary Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0a0d0a] hover:bg-[#1a2e1d] border border-gray-800 hover:border-gray-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-gray-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Diner Account & Start Dining</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </>
          </form>

          {/* Links & Role Switcher */}
          <div className="pt-4 border-t border-gray-800/80 space-y-3 text-center text-xs">
            <p className="text-gray-400">
              Already have a diner account?{' '}
              <Link to="/login/customer" className="font-bold text-white hover:underline">
                Sign In here
              </Link>
            </p>

            <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gray-400/10 border border-gray-800 flex items-center justify-center text-gray-300">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Are you a restaurant owner?</h4>
                  <p className="text-[10px] text-gray-400">Manage floor seating, live radar & pre-orders.</p>
                </div>
              </div>
              <Link
                to="/register/owner"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-[#0a0d0a] border border-gray-300 text-[11px] font-bold shrink-0 transition-colors shadow-xs"
              >
                Owner Sign Up →
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
