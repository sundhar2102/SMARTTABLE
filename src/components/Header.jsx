import React from 'react';
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
  LogOut
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

  const activeReservationsCount = userReservations.filter(
    r => r.status === 'Confirmed' && r.orderStatus !== 'Completed' && r.orderStatus !== 'Cancelled'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div 
          onClick={() => {
            if (user?.role === 'admin') {
              setViewMode('superadmin');
            } else if (user?.role === 'owner') {
              setViewMode('admin');
            } else {
              setViewMode('customer');
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs">
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                SmartTable
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2.5">
          
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
            className="hidden sm:inline-flex btn-secondary text-xs h-9 px-3"
            title="Calculate AI Walk-in Wait Time Prediction"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Predictor</span>
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
            <span className="hidden sm:inline">My Bookings</span>

            {activeReservationsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {activeReservationsCount}
              </span>
            )}
          </button>

          {/* Partner With Us Button */}
          <button
            onClick={() => navigate('/register/owner')}
            className="hidden sm:inline-flex btn-secondary text-xs h-9 px-3"
            title="Register a New Restaurant Partner"
          >
            <Store className="w-3.5 h-3.5 text-slate-600" />
            <span>Partner With Us</span>
          </button>

          {/* User Profile & Logout / Login */}
          {user?.isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
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
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/login');
              }}
              className="btn-primary text-xs h-9 px-4"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

