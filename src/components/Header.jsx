import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Bot, 
  User, 
  Flame, 
  CalendarCheck, 
  ShoppingBag, 
  Store, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const { 
    viewMode, 
    setViewMode, 
    setAiPredictorOpen, 
    setMyBookingsOpen, 
    userReservations,
    user,
    logoutUser,
    openCrowdRadar,
    preOrderItems,
    setBookingModalOpen
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeReservationsCount = userReservations.filter(
    r => r.status === 'Confirmed' && r.orderStatus !== 'Completed' && r.orderStatus !== 'Cancelled'
  ).length;

  const handleBrandClick = () => {
    setMobileMenuOpen(false);
    if (user?.role === 'admin') {
      setViewMode('superadmin');
    } else if (user?.role === 'owner') {
      setViewMode('admin');
    } else {
      setViewMode('customer');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo */}
        <div 
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white transition-all group-hover:scale-105 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                SmartTable
              </span>
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full shadow-xs">
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Actions */}
        <div className="hidden sm:flex items-center gap-2">
          
          {/* Live Crowd Radar Button */}
          <button
            onClick={() => openCrowdRadar()}
            className="btn-secondary text-xs h-9 px-3"
            title="Inspect Real-Time Crowd Density & Wait Times"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Crowd Radar</span>
          </button>

          {/* AI Wait Predictor Modal Trigger */}
          <button
            onClick={() => setAiPredictorOpen(true)}
            className="btn-secondary text-xs h-9 px-3"
            title="Calculate AI Walk-in Wait Time Prediction"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">AI Predictor</span>
          </button>

          {/* Pre-Order Food Badge */}
          {preOrderItems.length > 0 && (
            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-accent text-xs h-9 px-3 animate-pulse"
              title="View Pre-ordered Food for Table Reservation"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pre-Orders ({preOrderItems.reduce((acc, i) => acc + i.qty, 0)})</span>
            </button>
          )}

          {/* My Table Bookings Button */}
          <button
            onClick={() => setMyBookingsOpen(true)}
            className="relative btn-secondary text-xs h-9 px-3"
            title="View Active Table Bookings & Digital QR Passes"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">My Bookings</span>

            {activeReservationsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {activeReservationsCount}
              </span>
            )}
          </button>

          {/* Partner With Us Button */}
          <button
            onClick={() => navigate('/register/owner')}
            className="hidden lg:inline-flex btn-secondary text-xs h-9 px-3"
            title="Register a New Restaurant Partner"
          >
            <Store className="w-3.5 h-3.5 text-slate-600" />
            <span>Partner With Us</span>
          </button>

          {/* User Profile & Logout / Login */}
          {user?.isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                  user.role === 'admin' 
                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                    : user.role === 'owner' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {user.role === 'admin' ? 'SUPER ADMIN' : user.role === 'owner' ? 'OWNER' : 'DINER'}
                </span>
              </div>

              <button
                onClick={() => logoutUser()}
                className="btn-primary text-xs h-9 px-3"
                title="Logout and return to Landing Screen"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-xs h-9 px-4"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}

        </div>

        {/* Mobile Actions Bar (< 640px) */}
        <div className="flex sm:hidden items-center gap-1.5">
          {/* Pre-Order Food Badge */}
          {preOrderItems.length > 0 && (
            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-accent text-xs h-8 px-2 animate-pulse"
              title="View Pre-ordered Food"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>({preOrderItems.reduce((acc, i) => acc + i.qty, 0)})</span>
            </button>
          )}

          {/* My Bookings Quick Button */}
          <button
            onClick={() => setMyBookingsOpen(true)}
            className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            title="My Bookings"
          >
            <CalendarCheck className="w-4 h-4" />
            {activeReservationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                {activeReservationsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 text-white hover:bg-black transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openCrowdRadar();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Live Crowd Radar</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setAiPredictorOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>AI Walk-in Table Predictor</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setMyBookingsOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <span>My Table Reservations</span>
            </div>
            {activeReservationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {activeReservationsCount} Active
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/register/owner');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Store className="w-4 h-4 text-slate-600" />
            <span>Partner With Us (Register Restaurant)</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            {user?.isLoggedIn ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{user.role}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutUser();
                  }}
                  className="btn-primary text-xs h-8 px-3"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full btn-primary text-xs h-9 justify-center"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
