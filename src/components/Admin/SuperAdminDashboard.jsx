import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Users, 
  Store, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Eye, 
  CreditCard, 
  ExternalLink, 
  RotateCcw, 
  Activity, 
  Globe, 
  Lock, 
  Unlock, 
  ChevronRight,
  Sparkles,
  Award,
  CalendarCheck,
  Zap,
  Phone,
  Mail,
  Receipt,
  Clock,
  X,
  RefreshCw,
  Database,
  LayoutDashboard,
  UtensilsCrossed,
  Check,
  Ban
} from 'lucide-react';
import { RestaurantApprovalsAdmin } from './RestaurantApprovalsAdmin';
import { apiService } from '../../services/api';

export const SuperAdminDashboard = () => {
  const { 
    registeredUsers, 
    toggleUserStatus, 
    deleteUser, 
    addUser, 
    restaurantOwners, 
    toggleOwnerStatus, 
    deleteOwner, 
    addOwner,
    disputes, 
    resolveDispute,
    restaurantApplications,
    restaurants,
    userReservations,
    triggerToast,
    setSelectedRestaurantId,
    setViewMode,
    adminLoading,
    loadAdminUsers,
    loadAdminOwners,
    acceptReservation,
    declineReservation,
    setRestaurants
  } = useApp();

  // Active Admin Sidebar Section State
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard'); // 'dashboard' | 'restaurants' | 'approvals' | 'live_restaurants' | 'users' | 'bookings' | 'reports' | 'settings'

  // Search & Filter States
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [restaurantStatusFilter, setRestaurantStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });

  // Menu Preview Modal State
  const [menuPreviewModal, setMenuPreviewModal] = useState({ open: false, restaurant: null });

  // Platform Analytics
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [isLoadingPlatformAnalytics, setIsLoadingPlatformAnalytics] = useState(false);

  const fetchPlatformAnalytics = async () => {
    setIsLoadingPlatformAnalytics(true);
    try {
      const res = await apiService.admin.getPlatformAnalytics();
      if (res?.success && res.data) {
        setPlatformAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch platform metrics:', err);
    } finally {
      setIsLoadingPlatformAnalytics(false);
    }
  };

  useEffect(() => {
    loadAdminUsers();
    loadAdminOwners();
    fetchPlatformAnalytics();
  }, []);

  useEffect(() => {
    if (activeAdminTab === 'users') loadAdminUsers();
    if (activeAdminTab === 'reports' || activeAdminTab === 'dashboard') fetchPlatformAnalytics();
  }, [activeAdminTab]);

  // Comprehensive Metrics Calculation
  const totalRestaurantsCount = restaurants.length;
  const liveRestaurantsCount = restaurants.filter(r => r.status === 'live' || r.status === 'approved' || !r.status).length;
  const pendingRestaurantsCount = restaurantApplications.filter(a => a.status === 'pending').length;
  const deactivatedRestaurantsCount = restaurants.filter(r => r.status === 'deactivated').length;

  const totalUsersCount = registeredUsers.length;
  const activeUsersCount = registeredUsers.filter(u => u.status === 'active' || !u.status).length;
  const newUsersCount = registeredUsers.filter(u => {
    if (!u.createdAt && !u.registrationDate) return false;
    const date = new Date(u.createdAt || u.registrationDate);
    const now = new Date();
    return (now - date) < 7 * 24 * 60 * 60 * 1000; // registered in last 7 days
  }).length;

  const totalBookingsCount = userReservations.length;
  const pendingBookingsCount = userReservations.filter(r => r.status === 'Pending' || r.orderStatus === 'Pending' || r.orderStatus === 'Received').length;
  const confirmedBookingsCount = userReservations.filter(r => r.status === 'Accepted' || r.status === 'Confirmed' || r.orderStatus === 'Accepted').length;

  // Restaurant Status Management Actions
  const handleUpdateRestaurantStatus = (restaurantId, newStatus) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return { ...r, status: newStatus };
      }
      return r;
    }));

    const target = restaurants.find(r => r.id === restaurantId);
    const restName = target?.name || restaurantId;

    if (newStatus === 'live') {
      triggerToast('Restaurant Made Live 🚀', `${restName} is now visible to customers for table bookings.`, 'info');
    } else if (newStatus === 'deactivated') {
      triggerToast('Restaurant Deactivated', `${restName} has been deactivated. New customer bookings are disabled.`, 'alert');
    } else if (newStatus === 'approved') {
      triggerToast('Restaurant Approved ✅', `${restName} has been approved.`, 'info');
    } else if (newStatus === 'rejected') {
      triggerToast('Restaurant Rejected', `${restName} application has been rejected.`, 'alert');
    }
  };

  const openConfirmation = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const executeConfirmation = () => {
    if (confirmModal.action) {
      confirmModal.action();
    }
    setConfirmModal({ open: false, title: '', message: '', action: null });
  };

  // Filtered Restaurant Dataset
  const filteredRestaurants = restaurants.filter(r => {
    const q = restaurantSearch.toLowerCase();
    const matchesQuery = !restaurantSearch || r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
    
    let statusMatch = true;
    if (restaurantStatusFilter === 'live') statusMatch = r.status === 'live' || r.status === 'approved' || !r.status;
    else if (restaurantStatusFilter === 'pending') statusMatch = r.status === 'pending';
    else if (restaurantStatusFilter === 'deactivated') statusMatch = r.status === 'deactivated';
    else if (restaurantStatusFilter === 'rejected') statusMatch = r.status === 'rejected';

    return matchesQuery && statusMatch;
  });

  // Filtered Users Dataset
  const filteredUsers = registeredUsers.filter(u => {
    const q = userSearch.toLowerCase();
    const matchesQuery = !userSearch || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
    
    let statusMatch = true;
    if (userStatusFilter === 'active') statusMatch = u.status === 'active' || !u.status;
    else if (userStatusFilter === 'suspended') statusMatch = u.status === 'suspended';

    return matchesQuery && statusMatch;
  });

  // Filtered Bookings Dataset
  const filteredBookings = userReservations.filter(b => {
    const q = bookingSearch.toLowerCase();
    const matchesQuery = !bookingSearch || b.id.toLowerCase().includes(q) || (b.guestName && b.guestName.toLowerCase().includes(q)) || (b.restaurantName && b.restaurantName.toLowerCase().includes(q));

    let statusMatch = true;
    if (bookingStatusFilter === 'pending') statusMatch = b.status === 'Pending' || b.orderStatus === 'Pending' || b.orderStatus === 'Received';
    else if (bookingStatusFilter === 'confirmed') statusMatch = b.status === 'Accepted' || b.status === 'Confirmed' || b.orderStatus === 'Accepted';
    else if (bookingStatusFilter === 'rejected') statusMatch = b.status === 'Declined' || b.status === 'Rejected' || b.orderStatus === 'Declined';
    else if (bookingStatusFilter === 'cancelled') statusMatch = b.status === 'Cancelled' || b.orderStatus === 'Cancelled';
    else if (bookingStatusFilter === 'completed') statusMatch = b.orderStatus === 'Completed';

    return matchesQuery && statusMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">Super Admin</h2>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Platform Master</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'dashboard' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('restaurants')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'restaurants' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4" />
                <span>Restaurants</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">{totalRestaurantsCount}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('approvals')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'approvals' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4" />
                <span>Restaurant Approvals</span>
              </div>
              {pendingRestaurantsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                  {pendingRestaurantsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('live_restaurants')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'live_restaurants' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" />
                <span>Live Restaurants</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">{liveRestaurantsCount}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'users' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Users / Customers</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">{totalUsersCount}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('owners')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'owners' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>Restaurant Owners</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">{restaurantOwners.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'bookings' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4" />
                <span>Bookings</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">{totalBookingsCount}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('menu')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'menu' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Menu Management</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAdminTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'reports' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Reports / Analytics</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'settings' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Profile / Mode Switch */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setViewMode('customer')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
        
        {/* ===================================================================
           SECTION 1: ADMIN DASHBOARD OVERVIEW
           =================================================================== */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Header Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Command Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time overview of restaurants, customer bookings, platform health & analytics</p>
            </div>

            {/* 8 Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Restaurants</span>
                  <Store className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalRestaurantsCount}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Registered on platform</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Live Restaurants</span>
                  <Globe className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-teal-300">{liveRestaurantsCount}</div>
                <span className="text-[10px] text-teal-400 font-semibold">Visible to customers</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">{pendingRestaurantsCount}</div>
                <span className="text-[10px] text-amber-400 font-semibold">Awaiting admin review</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Deactivated</span>
                  <Ban className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400">{deactivatedRestaurantsCount}</div>
                <span className="text-[10px] text-rose-400 font-semibold">Bookings paused</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-indigo-300">{totalUsersCount}</div>
                <span className="text-[10px] text-indigo-400 font-semibold">{activeUsersCount} Active diners</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                  <CalendarCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-300">{totalBookingsCount}</div>
                <span className="text-[10px] text-blue-400 font-semibold">Across all restaurants</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">{pendingBookingsCount}</div>
                <span className="text-[10px] text-amber-400 font-semibold">Awaiting owner response</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Confirmed Bookings</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-300">{confirmedBookingsCount}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Accepted & Active</span>
              </div>

            </div>

            {/* Platform Analytics Quick View */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" /> Platform Revenue & Crowd Forecast
                  </h3>
                  <p className="text-xs text-slate-400">Live platform performance and operational breakdown</p>
                </div>
                <button
                  onClick={fetchPlatformAnalytics}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPlatformAnalytics ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Platform Volume</span>
                  <div className="text-xl font-black text-emerald-400">₹{(platformAnalytics?.gmv || 482000).toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-500">Includes table bills & pre-orders</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Commission Earned (15%)</span>
                  <div className="text-xl font-black text-teal-300">₹{Math.round((platformAnalytics?.gmv || 482000) * 0.15).toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-500">Platform revenue share</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Average Table Party Size</span>
                  <div className="text-xl font-black text-indigo-300">3.4 Guests</div>
                  <span className="text-[10px] text-slate-500">Average diner party density</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
           SECTION 2: RESTAURANTS MANAGEMENT
           =================================================================== */}
        {(activeAdminTab === 'restaurants' || activeAdminTab === 'live_restaurants') && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeAdminTab === 'live_restaurants' ? 'Live Visible Restaurants' : 'Restaurant Management'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">Manage registered venues, approve applications, toggle live availability & deactivate restaurants</p>
              </div>

              <button
                onClick={() => setViewMode('customer')}
                className="btn-primary text-xs h-10 px-4"
              >
                <Plus className="w-4 h-4" /> Register New Restaurant
              </button>
            </div>

            {/* Search & Status Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
                  placeholder="Search restaurant name, location, cuisine..."
                  className="input-clean pl-10"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-400 shrink-0">Filter Status:</span>
                <select
                  value={restaurantStatusFilter}
                  onChange={(e) => setRestaurantStatusFilter(e.target.value)}
                  className="input-clean text-xs font-bold w-full md:w-auto"
                >
                  <option value="all">All Statuses ({totalRestaurantsCount})</option>
                  <option value="live">Live Visible ({liveRestaurantsCount})</option>
                  <option value="pending">Pending Approval ({pendingRestaurantsCount})</option>
                  <option value="deactivated">Deactivated ({deactivatedRestaurantsCount})</option>
                </select>
              </div>
            </div>

            {/* Restaurants Table */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Restaurant & Cuisine</th>
                      <th className="p-4">Owner Contact</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Bookings</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRestaurants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                          No restaurants found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRestaurants.map(r => (
                        <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={r.image || '/luxury_rooftop_dining.jpg'} alt={r.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                              <div>
                                <span className="font-bold text-white block text-sm">{r.name}</span>
                                <span className="text-[11px] text-slate-400 font-medium">{r.cuisine} • {r.priceRange}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-200 block">{r.ownerName || 'Verified Partner'}</span>
                              <span className="text-[11px] text-slate-400 font-mono block">{r.phoneNumber || '+91 98400 12345'}</span>
                            </div>
                          </td>

                          <td className="p-4 max-w-xs truncate">
                            <span className="text-slate-300 font-medium">{r.location || r.city}</span>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                              {userReservations.filter(res => res.restaurantId === r.id).length} Bookings
                            </span>
                          </td>

                          <td className="p-4">
                            {(!r.status || r.status === 'live' || r.status === 'approved') && (
                              <span className="badge-clean badge-low">
                                🟢 Live & Bookable
                              </span>
                            )}
                            {r.status === 'pending' && (
                              <span className="badge-clean badge-medium">
                                ⏳ Pending Approval
                              </span>
                            )}
                            {r.status === 'deactivated' && (
                              <span className="badge-clean badge-high">
                                ⛔ Deactivated
                              </span>
                            )}
                            {r.status === 'rejected' && (
                              <span className="badge-clean badge-high">
                                ❌ Rejected
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              
                              {/* Status Toggle Actions */}
                              {r.status === 'deactivated' ? (
                                <button
                                  onClick={() => handleUpdateRestaurantStatus(r.id, 'live')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => openConfirmation(
                                    `Deactivate ${r.name}?`,
                                    `Deactivating this restaurant will hide it from customer search and pause new table bookings.`,
                                    () => handleUpdateRestaurantStatus(r.id, 'deactivated')
                                  )}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-bold border border-rose-500/30 transition-all cursor-pointer"
                                >
                                  Deactivate
                                </button>
                              )}

                              {r.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateRestaurantStatus(r.id, 'live')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                                >
                                  Approve & Make Live
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
           SECTION 3: RESTAURANT APPROVALS WORKFLOW
           =================================================================== */}
        {activeAdminTab === 'approvals' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Restaurant Partner Approvals</h1>
              <p className="text-xs text-slate-400 mt-1">Review onboarding applications, verify FSSAI/GSTIN compliance, and approve/reject venues</p>
            </div>

            <RestaurantApprovalsAdmin />
          </div>
        )}

        {/* ===================================================================
           SECTION 4: USERS / CUSTOMERS MANAGEMENT
           =================================================================== */}
        {activeAdminTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">User / Customer Directory</h1>
                <p className="text-xs text-slate-400 mt-1">Platform user accounts, registration records, activity status & customer booking counts</p>
              </div>

              <button
                onClick={() => setAddUserModalOpen(true)}
                className="btn-primary text-xs h-10 px-4"
              >
                <Plus className="w-4 h-4" /> Add User Account
              </button>
            </div>

            {/* Summary Statistics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Users</span>
                <div className="text-xl font-black text-white">{totalUsersCount}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Active Users</span>
                <div className="text-xl font-black text-emerald-400">{activeUsersCount}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">New (Last 7 Days)</span>
                <div className="text-xl font-black text-teal-300">{newUsersCount}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Bookings</span>
                <div className="text-xl font-black text-indigo-300">{totalBookingsCount}</div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search customer name, email, phone..."
                  className="input-clean pl-10"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-400 shrink-0">Account Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="input-clean text-xs font-bold w-full md:w-auto"
                >
                  <option value="all">All Users ({registeredUsers.length})</option>
                  <option value="active">Active Accounts ({activeUsersCount})</option>
                  <option value="suspended">Suspended ({registeredUsers.length - activeUsersCount})</option>
                </select>
              </div>
            </div>

            {/* User Directory Table */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Customer Name & Email</th>
                      <th className="p-4">Mobile Number</th>
                      <th className="p-4">Registration Date</th>
                      <th className="p-4">Bookings Count</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                          No customer accounts found matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => {
                        const userBookings = userReservations.filter(r => r.guestEmail === u.email);
                        return (
                          <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-white block text-sm">{u.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono block">{u.email}</span>
                              </div>
                            </td>

                            <td className="p-4 font-mono">
                              {u.phone || '+91 98400 55123'}
                            </td>

                            <td className="p-4 text-slate-400">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '2026-08-15'}
                            </td>

                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                                {userBookings.length} Bookings
                              </span>
                            </td>

                            <td className="p-4">
                              {(!u.status || u.status === 'active') ? (
                                <span className="badge-clean badge-low">Active Account</span>
                              ) : (
                                <span className="badge-clean badge-high">Suspended</span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleUserStatus(u.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 cursor-pointer"
                                >
                                  {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                </button>

                                <button
                                  onClick={() => openConfirmation(
                                    `Delete ${u.name}?`,
                                    `Are you sure you want to delete customer account ${u.email}?`,
                                    () => deleteUser(u.id)
                                  )}
                                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
           SECTION 4.5: RESTAURANT OWNERS MANAGEMENT
           =================================================================== */}
        {activeAdminTab === 'owners' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Restaurant Owners Management</h1>
                <p className="text-xs text-slate-400 mt-1">Manage verified restaurant owner accounts, assigned venues & account access</p>
              </div>
            </div>

            {/* Restaurant Owners Table */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Owner Name & Email</th>
                      <th className="p-4">Mobile Number</th>
                      <th className="p-4">Assigned Venue</th>
                      <th className="p-4">Venue Bookings</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {restaurantOwners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                          No restaurant owner accounts registered yet.
                        </td>
                      </tr>
                    ) : (
                      restaurantOwners.map(o => {
                        const ownerRest = restaurants.find(r => r.id === o.restaurantId || r.name === o.restaurantName);
                        const venueBookingsCount = userReservations.filter(r => r.restaurantId === o.restaurantId).length;

                        return (
                          <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-white block text-sm">{o.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono block">{o.email}</span>
                              </div>
                            </td>

                            <td className="p-4 font-mono">
                              {o.phone || '+91 98400 12345'}
                            </td>

                            <td className="p-4">
                              <span className="font-semibold text-emerald-400 block">{o.restaurantName || ownerRest?.name || 'Assigned Venue'}</span>
                              <span className="text-[10px] text-slate-400">{ownerRest?.location || 'Main Location'}</span>
                            </td>

                            <td className="p-4 font-bold text-indigo-300">
                              {venueBookingsCount} Bookings
                            </td>

                            <td className="p-4">
                              {(!o.status || o.status === 'active') ? (
                                <span className="badge-clean badge-low">Active Partner</span>
                              ) : (
                                <span className="badge-clean badge-high">Suspended</span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => toggleOwnerStatus(o.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 cursor-pointer"
                              >
                                {o.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
           SECTION 4.8: MENU MANAGEMENT
           =================================================================== */}
        {activeAdminTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Menu Management</h1>
              <p className="text-xs text-slate-400 mt-1">Inspect and manage food menu items, prices & categories across all partner restaurants</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-400">Select Restaurant:</label>
                <select
                  value={selectedRestaurantId || restaurants[0]?.id}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  className="input-clean text-xs font-bold max-w-xs"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                  ))}
                </select>
              </div>

              {/* Menu Categories */}
              {(() => {
                const targetRest = restaurants.find(r => r.id === (selectedRestaurantId || restaurants[0]?.id)) || restaurants[0];
                const menuList = targetRest?.menu || [];

                if (!menuList || menuList.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 font-medium">
                      No menu categories registered for this restaurant yet.
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {menuList.map((cat, idx) => (
                      <div key={idx} className="space-y-3">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                          {cat.category} ({cat.items.length} Items)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {cat.items.map(item => (
                            <div key={item.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${item.tags?.includes('v') ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                  <span className="font-bold text-white text-xs truncate">{item.name}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">{item.desc || 'No description'}</p>
                                <span className="font-mono text-xs font-bold text-emerald-400">₹{item.price}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Available
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ===================================================================
           SECTION 5: PLATFORM BOOKINGS MANAGEMENT
           =================================================================== */}
        {activeAdminTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Table Bookings</h1>
              <p className="text-xs text-slate-400 mt-1">Live synchronized table reservations & pre-orders across all restaurants</p>
            </div>

            {/* Search & Status Filter */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search booking ID, customer name, restaurant..."
                  className="input-clean pl-10"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-400 shrink-0">Filter Status:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="input-clean text-xs font-bold w-full md:w-auto"
                >
                  <option value="all">All Bookings ({userReservations.length})</option>
                  <option value="pending">Pending Request ({pendingBookingsCount})</option>
                  <option value="confirmed">Confirmed / Accepted ({confirmedBookingsCount})</option>
                  <option value="rejected">Rejected / Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Directory Table */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Restaurant Venue</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Date & Slot</th>
                      <th className="p-4">Party Size</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                          No table bookings found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-emerald-400">
                            {b.id}
                          </td>

                          <td className="p-4 font-bold text-white">
                            {b.restaurantName}
                          </td>

                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-200 block">{b.guestName}</span>
                              <span className="text-[11px] text-slate-400 font-mono block">{b.guestEmail}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono">
                            {b.date} @ {b.time}
                          </td>

                          <td className="p-4 font-bold">
                            {b.partySize} Guests
                          </td>

                          <td className="p-4">
                            {(b.status === 'Pending' || b.orderStatus === 'Pending' || b.orderStatus === 'Received') && (
                              <span className="badge-clean badge-medium">⏳ Pending Approval</span>
                            )}
                            {(b.status === 'Accepted' || b.status === 'Confirmed' || b.orderStatus === 'Accepted') && (
                              <span className="badge-clean badge-low">✅ Confirmed</span>
                            )}
                            {(b.status === 'Declined' || b.status === 'Rejected' || b.orderStatus === 'Declined') && (
                              <span className="badge-clean badge-high">❌ Rejected</span>
                            )}
                            {(b.status === 'Cancelled' || b.orderStatus === 'Cancelled') && (
                              <span className="badge-clean badge-neutral">Cancelled</span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {(b.status === 'Pending' || b.orderStatus === 'Pending' || b.orderStatus === 'Received') && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => acceptReservation(b.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => declineReservation(b.id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600/30 text-rose-300 text-[11px] font-bold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
           SECTION 6: REPORTS & ANALYTICS
           =================================================================== */}
        {activeAdminTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Reports & Platform Analytics</h1>
              <p className="text-xs text-slate-400 mt-1">Deep analytics on booking velocity, revenue share & diner trends</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Booking Volume Trend</h3>
                <div className="h-48 flex items-end justify-between gap-2 pt-4">
                  {[45, 60, 85, 120, 140, 190, 210].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all"
                        style={{ height: `${(val / 210) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400 font-bold">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customer Growth Trend</h3>
                <div className="h-48 flex items-end justify-between gap-2 pt-4">
                  {[30, 42, 58, 75, 90, 110, 135].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-xl transition-all"
                        style={{ height: `${(val / 135) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400 font-bold">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
           SECTION 7: SETTINGS & SYSTEM HEALTH
           =================================================================== */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in max-w-3xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Settings & Health</h1>
              <p className="text-xs text-slate-400 mt-1">Configure platform parameters, Socket.IO real-time channels & API integrations</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> Database & Real-Time Sync Status
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span>MySQL Database (`smarttable`)</span>
                  <span className="text-emerald-400 font-bold">Connected (127.0.0.1:3306)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span>Socket.IO Real-Time Gateway</span>
                  <span className="text-emerald-400 font-bold">Active (`http://localhost:5000`)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span>Google Maps Platform API</span>
                  <span className="text-teal-300 font-bold">Maps Demo Key Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-300">{confirmModal.message}</p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ open: false, title: '', message: '', action: null })}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmation}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
