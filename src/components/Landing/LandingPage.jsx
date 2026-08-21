import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MultiRoleLoginModal } from '../Auth/MultiRoleLoginModal';
import { RegisterRestaurantModal } from '../Customer/RegisterRestaurantModal';
import { NotificationToast } from '../NotificationToast';
import {
  UtensilsCrossed,
  Sparkles,
  Flame,
  LayoutGrid,
  Clock,
  ShieldCheck,
  Building2,
  Store,
  User,
  Zap,
  CheckCircle2,
  ArrowRight,
  Search,
  MapPin,
  CalendarCheck,
  ChefHat,
  CreditCard,
  Sliders,
  Star,
  ChevronRight,
  TrendingUp,
  Activity,
  Lock,
  Mail,
  KeyRound,
  Shield,
  Layers,
  Check,
  HelpCircle,
  BarChart3,
  Users,
  Building,
  Quote,
  Timer,
  Play,
  RotateCcw,
  SlidersHorizontal,
  UserPlus,
  Compass,
  QrCode,
  Smartphone,
  Navigation
} from 'lucide-react';

export const LandingPage = () => {
  const { 
    restaurants, 
    setRegisterRestaurantModalOpen 
  } = useApp();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [modalInitialRole, setModalInitialRole] = useState('customer');
  const [modalInitialMode, setModalInitialMode] = useState('signin'); // 'signin' | 'register'

  // Animated Cycling Headline
  const heroKeywords = [
    'zero-wait dining access.',
    'live table radar & GPS.',
    'smart kitchen dish pre-orders.',
    'frictionless restaurant operations.'
  ];
  const [heroKeywordIndex, setHeroKeywordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroKeywordIndex(prev => (prev + 1) % heroKeywords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Interactive Live Table Simulator State
  const [simulatorTables, setSimulatorTables] = useState([
    { id: 'T1', name: 'Table 1', cap: 2, status: 'available', section: 'Rooftop Deck' },
    { id: 'T2', name: 'Table 2', cap: 4, status: 'occupied', section: 'Main Hall', timeLeft: '18 min' },
    { id: 'T3', name: 'Booth 1', cap: 6, status: 'occupied', section: 'Lounge', timeLeft: '24 min' },
    { id: 'T4', name: 'Table 4', cap: 4, status: 'cleaning', section: 'Main Hall' },
    { id: 'T5', name: 'Table 5', cap: 2, status: 'available', section: 'Sky Deck' },
    { id: 'T6', name: 'Table 6', cap: 8, status: 'available', section: 'Family Dining' }
  ]);

  const toggleSimTable = (id) => {
    setSimulatorTables(prev => prev.map(t => {
      if (t.id === id) {
        const next = t.status === 'available' ? 'occupied' : t.status === 'occupied' ? 'cleaning' : 'available';
        return { ...t, status: next };
      }
      return t;
    }));
  };

  // Interactive Time Saved & ROI Calculator
  const [monthlyDiners, setMonthlyDiners] = useState(4);
  const hoursSavedPerYear = (monthlyDiners * 12 * 0.75).toFixed(1);
  const satisfactionGain = Math.min(99, 85 + monthlyDiners * 2);

  const openLogin = (role = 'customer', mode = 'signin') => {
    setModalInitialRole(role);
    setModalInitialMode(mode);
    setLoginModalOpen(true);
  };

  // Smooth scroll handler for the 5 navigation buttons
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90; // header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const totalFreeTables = restaurants.reduce((acc, r) => acc + (r.tables?.filter(t => t.status === 'available').length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                SmartTable
              </span>
              <span className="ml-2 badge-clean badge-low text-[9px]">
                LIVE
              </span>
            </div>
          </div>

          {/* Center: Clean 5 Working Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a 
              href="#about-app" 
              onClick={(e) => scrollToSection(e, 'about-app')}
              className="hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              Platform Overview
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              How It Works
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => scrollToSection(e, 'testimonials')}
              className="hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              Stories
            </a>
            <a 
              href="#floor-simulator" 
              onClick={(e) => scrollToSection(e, 'floor-simulator')}
              className="hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              Floor Lab
            </a>
            <a 
              href="#partner-venues" 
              onClick={(e) => scrollToSection(e, 'partner-venues')}
              className="hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              Partner Venues
            </a>
          </nav>

          {/* Right: Registration & Log In Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openLogin('customer', 'register')}
              className="btn-secondary text-xs h-9 px-3 hidden sm:inline-flex"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Register as Diner</span>
            </button>

            <button
              onClick={() => setRegisterRestaurantModalOpen(true)}
              className="btn-secondary text-xs h-9 px-3 hidden md:inline-flex"
            >
              <Store className="w-3.5 h-3.5 text-slate-600" />
              <span>Partner Onboarding</span>
            </button>

            <button
              onClick={() => openLogin('customer', 'signin')}
              className="btn-primary text-xs h-9 px-3.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log In</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full space-y-16 md:space-y-24">
        
        {/* 2. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Animated Headline, Value Prop & Registration CTAs */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="inline-block">
              <span className="badge-clean badge-low">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>HYPERLOCAL TABLE TELEMETRY & DINING RADAR</span>
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Enjoy Chennai's top dining with <br />
                <span className="text-emerald-700 underline decoration-emerald-300 decoration-2 transition-all duration-500">
                  {heroKeywords[heroKeywordIndex]}
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
              SmartTable is an intelligent dining telemetry platform for food enthusiasts and restaurant hosts. Check real-time free table counts, pre-order signature kitchen dishes, and enjoy zero sidewalk queueing.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => openLogin('customer', 'register')}
                className="btn-primary text-xs h-11 px-5"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Register as Diner</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => setRegisterRestaurantModalOpen(true)}
                className="btn-secondary text-xs h-11 px-5"
              >
                <Store className="w-4 h-4 text-slate-600" />
                <span>Register Restaurant Partner</span>
              </button>
            </div>

            {/* Live Metrics Ticker */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 max-w-lg">
              <div>
                <div className="text-2xl font-black text-slate-900">{totalFreeTables}</div>
                <div className="text-xs text-slate-500 font-medium">Free Tables Right Now</div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">0 - 15m</div>
                <div className="text-xs text-slate-500 font-medium">Average Walk-in Wait</div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">{restaurants.length}</div>
                <div className="text-xs text-slate-500 font-medium">Partner Restaurants</div>
              </div>
            </div>

          </div>

          {/* Right Column: Relatable Visual with Live Telemetry Overlay */}
          <div className="lg:col-span-5">
            <div className="card-clean p-3 space-y-3 shadow-md">
              
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                  alt="Fine Dining Ambience"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="badge-clean badge-low text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LIVE RADAR ACTIVE
                  </span>

                  <span className="badge-clean bg-slate-900/80 text-white border-slate-700 text-[10px]">
                    4.8 ★ (3.8k+ Reviews)
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-sm font-bold">On DE Roof Restaurant</div>
                  <p className="text-[11px] text-slate-300">Shanthi Colony, Anna Nagar • Asian & Sizzlers</p>
                </div>
              </div>

              {/* Live Restaurant Telemetry Rows */}
              <div className="space-y-2 p-1">
                {restaurants.slice(0, 3).map((rest) => {
                  const free = rest.tables?.filter(t => t.status === 'available').length || 0;
                  const total = rest.tables?.length || 5;

                  return (
                    <div
                      key={rest.id}
                      onClick={() => openLogin('customer', 'signin')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {rest.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {rest.cuisine} • {rest.location?.split(',')[0]}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="badge-clean badge-low text-[10px]">
                          {free}/{total} Free
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {rest.waitEstimate || '0 min wait'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant table reservation & kitchen pre-orders live</span>
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* 3. SECTION: PLATFORM OVERVIEW */}
        <section id="about-app" className="bg-white border-y border-slate-200 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
            
            <div className="text-center space-y-2.5 max-w-2xl mx-auto">
              <div className="inline-block">
                <span className="badge-clean badge-low">
                  PLATFORM OVERVIEW
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                How SmartTable transforms your dining experience.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                A connected dining ecosystem synchronizing real-time floor sensors, machine-learning turnover forecasts, and instant kitchen food tickets.
              </p>
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="card-clean overflow-hidden flex flex-col justify-between">
                <div className="h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                    alt="Live Table Radar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">01</span>
                      <span className="text-[10px] font-mono text-slate-400">GPS Radar</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Real-Time Telemetry</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Floor states sync every 5 seconds, revealing exact table availability, vacancy trends, and turnarounds across Chennai.
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold text-emerald-700">5-Second Live Refresh ➔</div>
                </div>
              </div>

              <div className="card-clean overflow-hidden flex flex-col justify-between">
                <div className="h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
                    alt="AI Wait Prediction"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">02</span>
                      <span className="text-[10px] font-mono text-slate-400">ML Turnover</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">AI Wait Predictor</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our ML model analyzes meal pacing, party size, time-of-day, and weather to calculate exact walk-in wait times.
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold text-amber-700">~42 Min Turnover Engine ➔</div>
                </div>
              </div>

              <div className="card-clean overflow-hidden flex flex-col justify-between">
                <div className="h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
                    alt="Kitchen Pre-Orders"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">03</span>
                      <span className="text-[10px] font-mono text-slate-400">Chef Specials</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Kitchen Pre-Orders</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Select your dishes during booking so the culinary team prepares your feast ahead of time. Hot food arrives within seconds!
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold text-teal-700">Zero Table Wait Time ➔</div>
                </div>
              </div>

              <div className="card-clean overflow-hidden flex flex-col justify-between">
                <div className="h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
                    alt="Digital Pay & QR Pass"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">04</span>
                      <span className="text-[10px] font-mono text-slate-400">Instant Pay</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Instant Digital Pay</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Integrated Razorpay, Stripe, and UPI checkout automatically settles dining bills and delivers a digital QR entry pass.
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold text-indigo-700">UPI / QR / Razorpay ➔</div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. SECTION: HOW DINING WORKS */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-block">
              <span className="badge-clean badge-low">
                SEAMLESS 3-STEP FLOW
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Simple. Fast. Zero sidewalk queueing.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Here is how diners and restaurant owners experience the SmartTable platform:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="card-clean p-6 space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Locate on Live Radar</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan nearby dining spots on our interactive map radar. Check live free table vacancies (🟢 Green = Available) and estimated wait times before heading out.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-2 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>Live GPS Radar in Chennai</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-clean p-6 space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Reserve & Pre-Order Food</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your table section (Rooftop Deck, Main AC Hall, Family Lounge) and pre-select your favorite dishes. The kitchen receives your ticket instantly.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-2 border border-slate-200">
                <ChefHat className="w-3.5 h-3.5 text-slate-600" />
                <span>Chef preparation scheduled</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-clean p-6 space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">3. Scan QR Pass & Enjoy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Walk in, show your digital QR entry pass, and get escorted directly to your reserved table. Your hot gourmet food is served without delay.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-2 border border-slate-200">
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
                <span>Instant Digital Entry Pass</span>
              </div>
            </div>

          </div>

        </section>

        {/* 5. SECTION: TESTIMONIALS */}
        <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-block">
              <span className="badge-clean badge-low">
                DINER STORIES & CHEF VOICES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Loved by passionate diners and top chefs.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quote Card 1 */}
            <div className="card-clean p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-emerald-600/60" />
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic">
                  “In fine dining, timing is everything. Knowing your table and chef-prepared signature meal are ready upon arrival changes the entire evening.”
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80"
                  alt="Chef Vikram Bangera"
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Chef Vikram Bangera</div>
                  <div className="text-[11px] text-slate-500">Executive Chef, ITC Grand Chola</div>
                </div>
              </div>
            </div>

            {/* Quote Card 2 */}
            <div className="card-clean p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-emerald-600/60" />
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic">
                  “SmartTable has cut our table vacancy gap to zero. Host captains love the real-time floor toggling and online bill settlements.”
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80"
                  alt="Sundhara Pandian"
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Sundhara Pandian</div>
                  <div className="text-[11px] text-slate-500">Owner, On DE Roof Anna Nagar</div>
                </div>
              </div>
            </div>

            {/* Quote Card 3 */}
            <div className="card-clean p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-emerald-600/60" />
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic">
                  “People who love to eat are always the best people. SmartTable makes sure our weekend family dinners are never ruined by long waits.”
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Ananya Sharma"
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Ananya Sharma</div>
                  <div className="text-[11px] text-slate-500">Verified Diner & Food Blogger</div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* 6. SECTION: LIVE FLOOR LAB & ROI CALCULATOR */}
        <section id="floor-simulator" className="bg-slate-900 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
            
            <div className="text-center space-y-2.5 max-w-2xl mx-auto">
              <div className="inline-block">
                <span className="badge-clean bg-slate-800 text-slate-200 border-slate-700">
                  INTERACTIVE LAB & SIMULATOR
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Simulate Live Floor Telemetry & Time Saved.
              </h2>
              <p className="text-xs text-slate-400">
                Click any table in the simulated restaurant floor below to toggle its live status and see how SmartTable recalculates wait times!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Interactive Floor Grid */}
              <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Live Table Floor Plan (Click to Toggle)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Free: {simulatorTables.filter(t => t.status === 'available').length} / {simulatorTables.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {simulatorTables.map(t => (
                    <div
                      key={t.id}
                      onClick={() => toggleSimTable(t.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                        t.status === 'available'
                          ? 'bg-slate-900 border-emerald-600/40 text-emerald-300'
                          : t.status === 'occupied'
                            ? 'bg-slate-900 border-rose-600/40 text-rose-300'
                            : 'bg-slate-900 border-amber-600/40 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          t.status === 'available' ? 'bg-emerald-400 animate-pulse' : t.status === 'occupied' ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {t.cap} Guests • {t.section}
                      </div>

                      <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                        <span>{t.status}</span>
                        {t.status === 'occupied' && <span>{t.timeLeft}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-2">
                  💡 <em>Click any table to switch between Free 🟢, Occupied 🔴, and Cleaning 🧹.</em>
                </div>

              </div>

              {/* Right Column: Time Saved Calculator */}
              <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    BENEFIT CALCULATOR
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Your Annual Dining ROI</h3>
                  <p className="text-xs text-slate-400">
                    Estimate the sidewalk waiting time you save with SmartTable.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Dining Out / Month:</span>
                    <span className="font-mono text-white font-bold text-sm">{monthlyDiners} times</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={monthlyDiners}
                    onChange={(e) => setMonthlyDiners(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xl font-black text-white">{hoursSavedPerYear} hrs</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Wait Saved/Year</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xl font-black text-emerald-400">{satisfactionGain}%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Seating Confidence</div>
                  </div>
                </div>

                <button
                  onClick={() => openLogin('customer', 'register')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Register Free as Diner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* 7. SECTION: PARTNER VENUES */}
        <section id="partner-venues" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-block">
              <span className="badge-clean badge-low">
                FEATURED PARTNERS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Top dining venues live on SmartTable.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Explore authentic Chennai restaurants with live table vacancy radar and kitchen dish pre-orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {restaurants.slice(0, 4).map((rest) => {
              const free = rest.tables?.filter(t => t.status === 'available').length || 0;
              const total = rest.tables?.length || 5;

              return (
                <div
                  key={rest.id}
                  className="card-clean overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={rest.image} 
                      alt={rest.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="badge-clean badge-low text-[10px]">
                        {free}/{total} Free
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="badge-clean bg-white/95 text-slate-900 border-slate-200 text-[10px] flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {rest.rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{rest.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{rest.cuisine}</p>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{rest.location}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => openLogin('customer', 'signin')}
                      className="btn-primary text-xs h-9 w-full"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Book Table</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Restaurant Partner Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="badge-clean bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                FOR RESTAURANT OWNERS & HOSTS
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Own a dining venue in Chennai?</h3>
              <p className="text-xs text-slate-300 max-w-lg">
                Join our network to eliminate table turnover gaps, receive advance kitchen tickets, and manage walk-in queues with real-time floor telemetry.
              </p>
            </div>

            <button
              onClick={() => setRegisterRestaurantModalOpen(true)}
              className="btn-accent text-xs h-11 px-5 shrink-0"
            >
              <Store className="w-4 h-4 text-white" />
              <span>Register Your Restaurant</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </section>

      </main>

      {/* 8. MINIMALIST FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 md:px-8 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
              ST
            </div>
            <span className="font-bold text-slate-900">SmartTable</span>
            <span>•</span>
            <span className="text-slate-500">Real-Time Table Telemetry & Dining Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600">
            <button onClick={() => openLogin('customer', 'register')} className="hover:text-slate-900 cursor-pointer">
              Register as Diner
            </button>
            <button onClick={() => setRegisterRestaurantModalOpen(true)} className="hover:text-slate-900 cursor-pointer">
              Register Restaurant
            </button>
            <button onClick={() => openLogin('customer', 'signin')} className="hover:text-slate-900 cursor-pointer">
              Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* 9. MULTI-ROLE LOGIN & REGISTRATION MODAL OVERLAY */}
      <MultiRoleLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        initialRole={modalInitialRole}
        initialMode={modalInitialMode}
      />

      {/* 10. RESTAURANT PARTNER ONBOARDING & REGISTRATION MODAL */}
      <RegisterRestaurantModal />

      {/* 11. GLOBAL NOTIFICATION TOAST */}
      <NotificationToast />

    </div>
  );
};
