import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Navigation, 
  TrendingUp, 
  ShieldCheck, 
  BatteryCharging, 
  Power, 
  KeyRound, 
  Store, 
  User, 
  Package, 
  Sparkles, 
  Flame, 
  CloudRain, 
  Check, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { playOrderAlert } from '../../utils/audioUtils';

export const RiderDashboard = () => {
  const { 
    riders, 
    activeRiderId, 
    setActiveRiderId, 
    currentRider, 
    riderDutyOnline, 
    toggleRiderDuty, 
    orders, 
    acceptDeliveryJob, 
    progressRiderDeliveryStep, 
    verifyDeliveryOtp, 
    marketplaceSettings,
    triggerToast 
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [activeTab, setActiveTab] = useState('missions'); // 'missions' | 'earnings' | 'fleet_switch'

  // Filter orders
  const activeMission = orders.find(o => o.fulfillmentType === 'delivery' && o.riderId === currentRider.id && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Completed');
  const availableDispatchJobs = orders.filter(o => o.fulfillmentType === 'delivery' && (!o.riderId || o.orderStatus === 'Pending Acceptance' || o.orderStatus === 'Accepted') && o.orderStatus !== 'Delivered');

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!activeMission) return;
    if (!otpInput.trim()) {
      triggerToast('Enter OTP', 'Please request the 4-digit code from customer.', 'alert');
      return;
    }
    const res = verifyDeliveryOtp(activeMission.id, otpInput.trim());
    if (res.success) {
      setOtpInput('');
    }
  };

  const getStepNumber = (status) => {
    switch (status) {
      case 'Accepted':
      case 'Preparing': return 1;
      case 'Ready for Pickup': return 2;
      case 'On the Way': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = activeMission ? getStepNumber(activeMission.orderStatus) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Top Rider Telemetry & Shift Header */}
      <div className="glass-panel rounded-3xl p-6 border border-black/30 bg-gradient-to-r from-gray-950 via-gray-900/20 to-gray-950 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Profile & Vehicle Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={currentRider.photo} 
                alt={currentRider.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-black/50 shadow-lg"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0b0f17] ${
                riderDutyOnline ? 'bg-white animate-pulse' : 'bg-black'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">{currentRider.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-amber-300 border border-gray-400/40 flex items-center gap-1">
                  ★ {currentRider.rating} Rating
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-gray-500/30">
                  {currentRider.clusterZone} Zone
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span>🛵 {currentRider.vehicle}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white font-semibold">
                  <BatteryCharging className="w-3.5 h-3.5" /> {currentRider.batteryLevel}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Shift Stats & Online/Offline Duty Beacon */}
          <div className="flex flex-wrap items-center gap-4">
            
            <div className="flex items-center gap-3 bg-gray-900/90 border border-gray-800 px-4 py-2.5 rounded-2xl">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Today's Payout</span>
                <span className="text-lg font-black text-white">₹{currentRider.todayEarnings}</span>
              </div>
              <div className="h-8 w-px bg-gray-800" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Trips Done</span>
                <span className="text-lg font-black text-white">{currentRider.todayTrips}</span>
              </div>
            </div>

            {/* Duty Switcher */}
            <button
              onClick={toggleRiderDuty}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                riderDutyOnline
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-gray-900/50 hover:brightness-110'
                  : 'bg-rose-950/80 border border-black/50 text-rose-300 hover:bg-rose-900'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{riderDutyOnline ? 'ONLINE (Accepting Jobs)' : 'GO ONLINE'}</span>
            </button>

          </div>

        </div>

        {/* Dynamic Surge Alerts for Rider */}
        {(marketplaceSettings.rainSurgeActive || marketplaceSettings.rushHourSurgeActive) && (
          <div className="mt-4 p-3 rounded-2xl bg-gray-900/40 border border-gray-400/30 flex items-center justify-between text-xs text-amber-300 flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold">
              {marketplaceSettings.rainSurgeActive ? <CloudRain className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              <span>
                {marketplaceSettings.rainSurgeActive ? 'Rain Bonus Active (+₹25 extra per drop)' : 'Dinner Rush Surge Active (1.25x Multiplier)'}
              </span>
            </div>
            <span className="text-[11px] text-gray-300 bg-amber-900/40 px-2.5 py-0.5 rounded-full border border-gray-400/30 font-semibold">
              Max Earning Mode
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'missions'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Active Missions & Dispatch Radar</span>
          {activeMission && (
            <span className="w-2 h-2 rounded-full bg-gray-300 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'earnings'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings & Shift History</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet_switch')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'fleet_switch'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Switch Rider Persona ({riders.length} active)</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE MISSION & DISPATCH RADAR */}
      {activeTab === 'missions' && (
        <div className="space-y-6">
          
          {/* Active Assigned Mission Console */}
          {activeMission ? (
            <div className="glass-card rounded-3xl border-2 border-black/50 p-6 space-y-6 bg-gradient-to-b from-[#0e1626] to-[#090e1a] shadow-2xl">
              
              {/* Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gray-800 border border-gray-700 text-white">
                    <Navigation className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                      ACTIVE MISSION #{activeMission.id}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">{activeMission.restaurantName}</h3>
                    <p className="text-xs text-gray-400">
                      Deliver to: <strong className="text-white">{activeMission.deliveryLocality}</strong> ({activeMission.deliveryDistanceKm || 1.8} km)
                    </p>
                  </div>
                </div>

                {/* Estimated Payout for this trip */}
                <div className="bg-gray-950 border border-gray-700 px-4 py-2.5 rounded-2xl text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-200 block">Guaranteed Payout</span>
                  <div className="text-xl font-black text-white">
                    ₹{(activeMission.deliveryFee || 35) + (activeMission.tipAmount || 0) + (activeMission.surgeFee || 0)}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    (Fare ₹{activeMission.deliveryFee} + Tip ₹{activeMission.tipAmount || 0})
                  </span>
                </div>
              </div>

              {/* Step Navigation Progress Stepper */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Delivery Action Workflow
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { step: 1, label: '1. Navigate to Store', status: 'Accepted', desc: 'Reach merchant to pick up' },
                    { step: 2, label: '2. Pickup Package', status: 'Ready for Pickup', desc: 'Verify dish items' },
                    { step: 3, label: '3. En Route to Customer', status: 'On the Way', desc: 'Ride to destination' },
                    { step: 4, label: '4. Handover & OTP', status: 'Delivered', desc: 'Enter 4-digit code' }
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        currentStep >= s.step
                          ? 'bg-gray-950 border-gray-700 text-emerald-200'
                          : 'bg-gray-900/60 border-gray-800 text-gray-500'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{s.label}</span>
                        {currentStep >= s.step && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Actions Controller */}
              <div className="p-5 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
                
                {/* Step Action 1 & 2 & 3: Progress Next */}
                {activeMission.orderStatus !== 'On the Way' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {activeMission.orderStatus === 'Preparing' || activeMission.orderStatus === 'Accepted'
                          ? 'Arrived at Restaurant'
                          : 'Package Collected from Kitchen'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {activeMission.orderStatus === 'Preparing'
                          ? `Collect ${activeMission.preOrderedItems?.length || 1} items from ${activeMission.restaurantName}.`
                          : `Start GPS navigation to ${activeMission.deliveryAddress}.`}
                      </p>
                    </div>

                    <button
                      onClick={() => progressRiderDeliveryStep(activeMission.id)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-gray-900/50 hover:brightness-110 flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        {activeMission.orderStatus === 'Preparing' || activeMission.orderStatus === 'Accepted'
                          ? 'Mark Arrived & Packaged ➔'
                          : 'Start Ride to Customer 🛵💨'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Step Action 4: Arrived at Doorstep -> Enter Customer OTP */}
                {activeMission.orderStatus === 'On the Way' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4" /> Enter Customer Delivery OTP
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Ask {activeMission.guestName} for the 4-digit code shown on their app screen
                        </p>
                      </div>

                      <a
                        href={`tel:${activeMission.guestPhone || '+919840112345'}`}
                        className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-white" />
                        <span>Call Customer</span>
                      </a>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="flex gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="Enter 4-Digit OTP (Hint: 7392)"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-white outline-none focus:border-black"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-gray-300 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-gray-900/50 hover:brightness-110 cursor-pointer"
                      >
                        Verify & Complete Trip 💰
                      </button>
                    </form>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-gray-800 bg-gray-950/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-white">
                <Bike className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Active Delivery Mission</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                You are currently available on the radar. Check the dispatch feed below to claim new delivery jobs!
              </p>
            </div>
          )}

          {/* Hyperlocal Dispatch Radar: Nearby Available Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Hyperlocal Dispatch Radar (Nearby Jobs)
                </h3>
                <p className="text-xs text-gray-400">Available orders in {currentRider.clusterZone} cluster</p>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-900 px-3 py-1 rounded-xl border border-gray-800">
                {availableDispatchJobs.length} Jobs Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableDispatchJobs.map(job => {
                const totalPayout = (job.deliveryFee || 35) + (job.tipAmount || 0) + (job.surgeFee || 0);

                return (
                  <div 
                    key={job.id} 
                    className="glass-card rounded-3xl p-5 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400 font-bold">{job.id}</span>
                        <span className="text-base font-black text-white bg-gray-900/80 px-2.5 py-0.5 rounded-xl border border-black/30">
                          ₹{totalPayout}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white leading-snug">{job.restaurantName}</h4>
                      
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">Pickup: {job.restaurantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          <span className="truncate">Drop: {job.deliveryLocality || 'Anna Nagar'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-gray-900 border border-gray-800 text-[10px] text-gray-300 font-semibold">
                          🛵 {job.deliveryDistanceKm || 1.8} km route
                        </span>
                        {job.tipAmount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-black/40 text-[10px] text-rose-300 font-bold">
                            +₹{job.tipAmount} Tip
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => acceptDeliveryJob(job.id, currentRider.id)}
                      disabled={!!activeMission}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activeMission ? 'Complete Current Mission First' : 'Accept Delivery Mission ➔'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EARNINGS & SHIFT TELEMETRY */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1 bg-gradient-to-br from-gray-900/30 to-gray-950">
              <span className="text-xs text-gray-400 font-semibold">Today's Total Payout</span>
              <div className="text-3xl font-black text-white">₹{currentRider.todayEarnings}</div>
              <span className="text-[10px] text-gray-200">Direct wallet balance ready for payout</span>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1 bg-gradient-to-br from-indigo-950/30 to-gray-950">
              <span className="text-xs text-gray-400 font-semibold">Completed Missions</span>
              <div className="text-3xl font-black text-white">{currentRider.todayTrips}</div>
              <span className="text-[10px] text-gray-400">{currentRider.tripsCompleted} lifetime deliveries</span>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1 bg-gradient-to-br from-gray-900/30 to-gray-950">
              <span className="text-xs text-gray-400 font-semibold">Customer Rating</span>
              <div className="text-3xl font-black text-gray-300">★ {currentRider.rating}</div>
              <span className="text-[10px] text-amber-300">Top 5% Partner in Chennai</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SWITCH RIDER PERSONA */}
      {activeTab === 'fleet_switch' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {riders.map(r => (
            <div
              key={r.id}
              onClick={() => {
                setActiveRiderId(r.id);
                triggerToast('Rider Switched', `Now operating as ${r.name} (${r.clusterZone}).`, 'info');
              }}
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                activeRiderId === r.id
                  ? 'bg-gray-950 border-black shadow-xl'
                  : 'bg-gray-950 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={r.photo} alt={r.name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-white">{r.name}</h4>
                  <p className="text-xs text-gray-400">{r.clusterZone}</p>
                </div>
              </div>
              <div className="text-xs text-gray-300 flex justify-between pt-2 border-t border-gray-800">
                <span>Vehicle: {r.vehicle.split(' ')[0]}</span>
                <span className="text-white font-bold">₹{r.todayEarnings} earned</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
