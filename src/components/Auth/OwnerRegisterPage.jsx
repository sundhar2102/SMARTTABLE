import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  LayoutGrid,
  Users,
  UtensilsCrossed,
  User,
  FileCheck
} from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';
import { useAuthForm } from '../../hooks/useAuthForm';
import { getPasswordStrength } from '../../utils/authValidation';
import { useApp } from '../../context/AppContext';

export const OwnerRegisterPage = () => {
  const navigate = useNavigate();
  const { restaurants } = useApp();
  const {
    isLoading,
    errors,
    showPassword,
    setShowPassword,
    handleRegister
  } = useAuthForm({ role: 'owner', redirectPath: '/' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
    location: 'T. Nagar, Chennai',
    city: 'Chennai',
    tablesCount: 10,
    capacity: 40,
    gstin: '',
    fssai: '',
    linkExistingRestaurantId: '',
    agreeTerms: true
  });

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      alert('Please agree to the Partner Terms of Service to continue.');
      return;
    }

    await handleRegister(formData, {
      restaurantName: formData.restaurantName.trim(),
      restaurantId: formData.linkExistingRestaurantId || `rest-${Date.now().toString().slice(-4)}`,
      location: formData.location,
      city: formData.city,
      tablesCount: Number(formData.tablesCount) || 10,
      capacity: Number(formData.capacity) || 40,
      gstin: formData.gstin?.trim() || null,
      fssai: formData.fssai?.trim() || null
    });
  };

  return (
    <div className="min-h-screen bg-[#090d14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Ambient Radial Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gray-400/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-600/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl z-10 my-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-gray-400 to-orange-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-gray-900/60 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">SmartTable<span className="text-gray-300">.ai</span></span>
          </Link>
          
          <div className="inline-block pt-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest bg-gray-400/10 text-amber-300 border border-gray-400/30">
              Restaurant Partner Onboarding
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Register as Restaurant Owner
          </h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Take full control of your floor plan, live occupancy radar, dish pre-orders, and contactless bill settlements.
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Rounded-Pill Role Tab Selector (Exact Sign-In Style) */}
          <div className="bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800/80 grid grid-cols-2 gap-1.5">
            <Link
              to="/register/user"
              className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
            >
              <User className="w-3.5 h-3.5 text-white" />
              <span>Diner Sign Up</span>
            </Link>

            <div className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-gray-900/60 to-gray-900 border border-gray-400/60 shadow-lg ring-1 ring-gray-400/40 text-amber-300 cursor-default">
              <Store className="w-3.5 h-3.5" />
              <span>Owner Registration</span>
            </div>
          </div>

          {/* Social OAuth Sign Up */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              1-Tap Partner Onboarding
            </span>
            <SocialAuthButtons 
              role="owner" 
              theme="dark" 
              dividerText="or register with business details"
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
                {/* Section 1: Owner Profile */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-300 block border-b border-gray-800 pb-1">
                    1. Owner / Manager Profile
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                        <span>Your Full Name</span>
                        {errors.name && <span className="text-[10px] text-gray-300 font-normal">{errors.name}</span>}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Sundhara Pandian"
                        className={`w-full bg-gray-950/80 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                          errors.name ? 'border-black/80' : 'border-gray-800 focus:border-gray-400'
                        }`}
                      />
                    </div>

                    {/* Direct Phone */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                        <span>Contact Phone</span>
                        {errors.phone && <span className="text-[10px] text-gray-300 font-normal">{errors.phone}</span>}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98400 98765"
                        className={`w-full bg-gray-950/80 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                          errors.phone ? 'border-black/80' : 'border-gray-800 focus:border-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Business Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>Business Email</span>
                      {errors.email && <span className="text-[10px] text-gray-300 font-normal">{errors.email}</span>}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="manager@restaurant.com"
                      className={`w-full bg-gray-950/80 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                        errors.email ? 'border-black/80' : 'border-gray-800 focus:border-gray-400'
                      }`}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-300">Console Password</label>
                      {formData.password && (
                        <span className={`text-[10px] font-mono font-bold ${passwordStrength.text}`}>
                          Strength: {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="At least 6 characters"
                        className={`w-full bg-gray-950/80 border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                          errors.password ? 'border-black/80' : 'border-gray-800 focus:border-gray-400'
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
                  </div>
                </div>

                {/* Section 2: Restaurant & Venue Info */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-300 block border-b border-gray-800 pb-1">
                    2. Restaurant & Venue Details
                  </span>

                  {/* Restaurant Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>Restaurant Brand Name</span>
                      {errors.restaurantName && <span className="text-[10px] text-gray-300 font-normal">{errors.restaurantName}</span>}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.restaurantName}
                      onChange={(e) => handleChange('restaurantName', e.target.value)}
                      placeholder="e.g. Copper Chimney or Anjappar Chettinad"
                      className={`w-full bg-gray-950/80 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none transition-all ${
                        errors.restaurantName ? 'border-black/80' : 'border-gray-800 focus:border-gray-400'
                      }`}
                    />
                  </div>

                  {/* Locality and Capacity Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300 block">Locality / Zone</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="e.g. T. Nagar, Chennai"
                        className="w-full bg-gray-950/80 border border-gray-800 focus:border-gray-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300 block">Tables Count</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.tablesCount}
                        onChange={(e) => handleChange('tablesCount', e.target.value)}
                        className="w-full bg-gray-950/80 border border-gray-800 focus:border-gray-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Optional Registration Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 block">GSTIN (Optional)</label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => handleChange('gstin', e.target.value)}
                        placeholder="33AAACA1234F1Z5"
                        className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 block">FSSAI License (Optional)</label>
                      <input
                        type="text"
                        value={formData.fssai}
                        onChange={(e) => handleChange('fssai', e.target.value)}
                        placeholder="12423002000892"
                        className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="agreePartnerTerms"
                    checked={formData.agreePartnerTerms ?? formData.agreeTerms}
                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-gray-400 focus:ring-gray-400 cursor-pointer"
                  />
                  <label htmlFor="agreePartnerTerms" className="text-[11px] text-gray-400 cursor-pointer">
                    I agree to the <span className="text-gray-300 hover:underline">Restaurant Partner Terms & Commission Policy</span>.
                  </label>
                </div>

                {/* Black Primary Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0a0d0a] hover:bg-[#2a1d0a] border border-gray-800 hover:border-gray-400/40 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-gray-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Partner Registration & Launch Console</span>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </>
                  )}
                </button>
              </>
          </form>

          {/* Links & Role Switcher */}
          <div className="pt-4 border-t border-gray-800/80 space-y-3 text-center text-xs">
            <p className="text-gray-400">
              Already registered as a partner?{' '}
              <Link to="/login/owner" className="font-bold text-gray-300 hover:underline">
                Sign In to Owner Console
              </Link>
            </p>

            <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black/10 border border-gray-800 flex items-center justify-center text-white">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Looking to book tables as a diner?</h4>
                  <p className="text-[10px] text-gray-400">Explore restaurants, menus & food pre-orders.</p>
                </div>
              </div>
              <Link
                to="/register/user"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-[#0a0d0a] border border-gray-300 text-[11px] font-bold shrink-0 transition-colors shadow-xs"
              >
                Diner Sign Up →
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
