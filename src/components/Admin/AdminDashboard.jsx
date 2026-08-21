import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  LayoutGrid, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Bot, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  Plus, 
  RotateCcw,
  Sliders,
  DollarSign,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  MessageSquare,
  AlertCircle,
  Eye,
  ArrowLeft,
  Share2,
  Bell,
  Volume2,
  VolumeX,
  Filter,
  Search,
  Printer,
  Flame,
  ShieldCheck,
  Check,
  X,
  CalendarCheck,
  Table,
  Hourglass,
  Building2,
  CreditCard,
  Trash2,
  Percent,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { playOrderAlert } from '../../utils/audioUtils';
import { PaymentGatewayModal } from './PaymentGatewayModal';

export const AdminDashboard = () => {
  const { 
    restaurants, 
    selectedRestaurantId, 
    setSelectedRestaurantId,
    updateTableStatus,
    updateRestaurantCrowdLevel,
    userReservations,
    updateReservationOrderStatus,
    makeReservation,
    triggerToast,
    setViewMode,
    restaurantApplications,
    acceptReservation,
    declineReservation,
    updateTableBill
  } = useApp();

  const pendingApplicationsCount = restaurantApplications ? restaurantApplications.filter(a => a.status === 'pending').length : 0;

  const [activeAdminTab, setActiveAdminTab] = useState('reservations'); // 'reservations' | 'floor' | 'billing' | 'crowd_settings'
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);

  // Table Bill Management State
  const [selectedBillTableId, setSelectedBillTableId] = useState('ODR1');
  const [billDiscountPercent, setBillDiscountPercent] = useState(0);
  const [billServiceCharge, setBillServiceCharge] = useState(0);
  const [selectedDishToAdd, setSelectedDishToAdd] = useState('');
  
  // Payment Gateway Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentBill, setActivePaymentBill] = useState(null);

  // Decline Dialog State
  const [decliningResId, setDecliningResId] = useState(null);
  const [declineReason, setDeclineReason] = useState('Table capacity full at requested slot');

  const currentRest = restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0];

  if (!currentRest) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in p-12 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading restaurant data...</p>
      </div>
    );
  }

  const handlePropertyChange = (newRestId) => {
    setSelectedRestaurantId(newRestId);
    window.location.hash = `admin?restaurant=${newRestId}`;
    const target = restaurants.find(r => r.id === newRestId);
    triggerToast('Console Switched 👑', `Now managing live table operations for ${target?.name}.`, 'info');
  };

  const totalTables = currentRest?.total_tables ?? (currentRest?.tables ? currentRest.tables.length : 5);
  const freeTables = currentRest?.available_tables ?? (currentRest?.tables ? currentRest.tables.filter(t => t.status === 'available').length : 0);
  const occupiedTables = currentRest?.occupied_tables ?? (currentRest?.tables ? currentRest.tables.filter(t => t.status === 'occupied').length : 0);
  const reservedTables = currentRest?.reserved_tables ?? (currentRest?.tables ? currentRest.tables.filter(t => t.status === 'reserved').length : 0);
  const cleaningTables = currentRest?.cleaning_tables ?? (currentRest?.tables ? currentRest.tables.filter(t => t.status === 'cleaning').length : 0);
  const occupancyRatio = currentRest?.occupancy_percentage ?? (totalTables > 0 ? Math.round(((totalTables - freeTables) / totalTables) * 100) : 0);

  // Auto-calculated Estimated Wait Time for Next Free Table (Powered by Backend Metrics)
  const calculatedWaitMinutes = currentRest?.estimated_wait_minutes !== undefined 
    ? currentRest.estimated_wait_minutes 
    : (freeTables > 0 ? 0 : Math.max(8, Math.round((occupiedTables / totalTables) * 42)));
  
  const waitTimeStatus = calculatedWaitMinutes === -1 
    ? 'No Suitable Tables' 
    : (calculatedWaitMinutes === 0 ? '0 min (Instant)' : `~${calculatedWaitMinutes} mins`);

  const queueCount = currentRest?.queue_count ?? 0;

  // Filter reservations for current restaurant
  const currentRestReservations = userReservations.filter(r => r.restaurantId === currentRest.id);
  
  const filteredReservations = currentRestReservations.filter(res => {
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'Pending') {
        if (res.orderStatus !== 'Received' && res.orderStatus !== 'Table Reserved' && res.orderStatus !== 'Pending Acceptance') return false;
      } else if (orderStatusFilter === 'Cooking') {
        if (res.orderStatus !== 'Cooking') return false;
      } else if (res.orderStatus !== orderStatusFilter) {
        return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchGuest = (res.guestName || '').toLowerCase().includes(q);
      const matchId = (res.id || '').toLowerCase().includes(q);
      const matchTable = (res.tableName || '').toLowerCase().includes(q);
      const matchDish = (res.preOrderedItems || []).some(i => i.name.toLowerCase().includes(q));
      if (!matchGuest && !matchId && !matchTable && !matchDish) return false;
    }

    return true;
  });

  const totalPreOrderRevenue = currentRestReservations.reduce((sum, res) => {
    const resTotal = (res.preOrderedItems || []).reduce((acc, item) => acc + (item.price * item.qty), 0);
    return sum + resTotal;
  }, 0);

  // Helper for quick order progression
  const handleProgressOrder = (resId, nextStatus) => {
    if (soundAlertsEnabled) {
      if (nextStatus === 'Accepted') playOrderAlert('accepted');
      else if (nextStatus === 'Cooking') playOrderAlert('preparing');
      else if (nextStatus === 'Served' || nextStatus === 'Completed') playOrderAlert('served');
    }
    updateReservationOrderStatus(resId, nextStatus);
  };

  // Helper to open payment collection for a reservation or table
  const handleOpenPayment = (res) => {
    const items = res.preOrderedItems || [];
    const itemTotal = items.reduce((acc, i) => acc + (i.price * i.qty), 0) || 850;
    const finalAmount = res.billTotal || (itemTotal + Math.round(itemTotal * 0.05));

    setActivePaymentBill({
      reservationId: res.id,
      tableId: res.tableId,
      tableName: res.tableName,
      guestName: res.guestName,
      restaurantName: currentRest.name,
      amount: finalAmount
    });
    setPaymentModalOpen(true);
  };

  // Callback when online payment settles
  const handlePaymentCompleted = (paymentDetails) => {
    if (activePaymentBill?.reservationId) {
      // Mark reservation as completed and paid
      updateReservationOrderStatus(activePaymentBill.reservationId, 'Completed');
      if (activePaymentBill.tableId) {
        updateTableStatus(currentRest.id, activePaymentBill.tableId, 'cleaning');
      }
    }
  };

  // Add Item to Table Bill
  const handleAddDishToBill = (targetRes) => {
    if (!selectedDishToAdd) return;
    
    // Find dish in restaurant menu
    let foundDish = null;
    (currentRest.menu || []).forEach(cat => {
      (cat.items || []).forEach(item => {
        if (item.id === selectedDishToAdd) foundDish = item;
      });
    });

    if (!foundDish) return;

    const currentItems = targetRes.preOrderedItems || [];
    const existingIndex = currentItems.findIndex(i => i.id === foundDish.id);
    let updatedItems = [];

    if (existingIndex >= 0) {
      updatedItems = currentItems.map((item, idx) => 
        idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      updatedItems = [...currentItems, { id: foundDish.id, name: foundDish.name, price: foundDish.price, qty: 1 }];
    }

    updateTableBill(currentRest.id, targetRes.tableId, updatedItems, billDiscountPercent, billServiceCharge);
    setSelectedDishToAdd('');
  };

  // Change Item Qty on Table Bill
  const handleUpdateItemQty = (targetRes, itemId, delta) => {
    const currentItems = targetRes.preOrderedItems || [];
    const updatedItems = currentItems
      .map(item => item.id === itemId ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0);

    updateTableBill(currentRest.id, targetRes.tableId, updatedItems, billDiscountPercent, billServiceCharge);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Top Restaurant Property Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
                👑 RESTAURANT OWNER DASHBOARD
              </span>
              <span className="text-xs text-gray-500 font-mono">ID: {currentRest.id}</span>
              <span className="flex items-center gap-1 text-xs text-[#0f5128] font-bold bg-[#d2f9d5] px-2.5 py-0.5 rounded-md border border-[#b8f5bf]">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                Live Floor Telemetry & Kitchen Dispatch Active
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-[#0a0d0a] tracking-tight">
                {currentRest.name}
              </h2>
            </div>
            <p className="text-xs text-gray-600">{currentRest.cuisine} • {currentRest.location}</p>
          </div>

          {/* Controls: Switch Property, Sound Alerts, Approvals */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Switch Restaurant Dropdown */}
            <div className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs shadow-xs">
              <label className="text-[10px] text-gray-500 uppercase font-bold block">Managed Property:</label>
              <select
                value={currentRest.id}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="bg-transparent text-[#0a0d0a] font-bold outline-none cursor-pointer"
              >
                {restaurants.map(r => (
                  <option key={r.id} value={r.id} className="bg-white text-gray-900">
                    {r.name} ({r.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                soundAlertsEnabled
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
              title={soundAlertsEnabled ? 'Kitchen sound chimes enabled' : 'Muted'}
            >
              {soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Approvals Queue */}
            <button
              onClick={() => {
                setViewMode('superadmin');
                window.location.hash = 'superadmin';
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-[#0a0d0a] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Platform Admin Portal"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Portal ({pendingApplicationsCount})</span>
            </button>

          </div>

        </div>
      </div>

      {/* KPI Metric Cards + Real-Time Wait Auto-Calculator Widget */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Vacancy */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" /> Free Table Vacancy
          </span>
          <div className="text-2xl font-black text-[#0a0d0a]">{freeTables} / {totalTables}</div>
          <span className="text-[11px] font-mono text-gray-500">{occupancyRatio}% Floor Occupancy</span>
        </div>

        {/* Metric 2: Auto-calculated Estimated Wait Time for Next Free Table */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-1 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400 animate-spin" /> Next Table Wait Time
            </span>
            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
              {currentRest?.estimated_wait_minutes !== undefined ? 'REAL-TIME BACKEND SYNC' : 'LOCAL AUTO-CALCULATED'}
            </span>
          </div>
          <div className="text-2xl font-black text-[#0a0d0a]">
            {waitTimeStatus}
          </div>
          <span className="text-[11px] text-gray-500 block">
            {queueCount > 0 ? `${queueCount} parties currently in queue` : `Based on ${occupancyRatio}% occupancy`}
          </span>
        </div>

        {/* Metric 3: Active Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" /> Active Reservations
          </span>
          <div className="text-2xl font-black text-[#0a0d0a]">{currentRestReservations.length}</div>
          <span className="text-[11px] font-mono text-indigo-700">
            {currentRestReservations.filter(r => r.preOrderedItems?.length > 0).length} with Food Pre-Orders
          </span>
        </div>

        {/* Metric 4: Pre-Order Volume */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-teal-600" /> Pre-Order Volume
          </span>
          <div className="text-2xl font-black text-emerald-700">₹{totalPreOrderRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-700 font-bold">Kitchen Pre-Orders Active</span>
        </div>

      </div>

      {/* Owner Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('reservations')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'reservations'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Orders & Reservation Requests ({currentRestReservations.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('floor')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'floor'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Live Floor Plan & Table Status ({totalTables} Tables)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('billing')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'billing'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Table Bill & Payment Manager</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('crowd_settings')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'crowd_settings'
              ? 'bg-gradient-to-r from-gray-400 to-orange-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200 bg-gray-900/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Crowd & Wait Calibrator</span>
        </button>
      </div>

      {/* TAB 1: RESERVATIONS & KITCHEN ORDERS (Accept / Decline) */}
      {activeAdminTab === 'reservations' && (
        <div className="space-y-6">
          
          {/* Sub Filters: Status + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-900 border border-gray-800 text-xs font-semibold overflow-x-auto">
              {[
                { id: 'all', label: 'All Requests' },
                { id: 'Pending', label: '⏳ Incoming Requests' },
                { id: 'Accepted', label: '👨‍🍳 Accepted' },
                { id: 'Cooking', label: '🍳 Cooking' },
                { id: 'Served', label: '✨ Seated & Served' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setOrderStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    orderStatusFilter === s.id
                      ? 'bg-gray-400 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, ID, table, or dish..."
                className="bg-gray-900 border border-gray-800 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Decline Reason Modal */}
          {decliningResId && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-black/40 text-xs space-y-3">
              <div className="flex items-center justify-between font-bold text-rose-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Decline Reservation Request ({decliningResId})
                </span>
                <button onClick={() => setDecliningResId(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Select reason for declining:</label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="Table capacity full at requested slot">Table capacity full at requested slot</option>
                  <option value="Kitchen at maximum peak backlog">Kitchen at maximum peak backlog</option>
                  <option value="Private event / Banquet booked">Private event / Banquet booked</option>
                  <option value="Outside operating hours">Outside operating hours</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDecliningResId(null)}
                  className="px-3 py-1.5 rounded-xl bg-gray-900 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    declineReservation(decliningResId, declineReason);
                    setDecliningResId(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-black text-white font-bold"
                >
                  Confirm Decline Request
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReservations.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3 glass-card rounded-3xl border border-gray-800">
                <Receipt className="w-12 h-12 text-gray-600 mx-auto" />
                <h4 className="text-base font-bold text-gray-300">No Reservations Matching Filters</h4>
                <p className="text-xs text-gray-500">
                  New incoming reservations will appear here with acoustic notifications.
                </p>
              </div>
            ) : (
              filteredReservations.map(res => {
                const isPending = res.orderStatus === 'Received' || res.orderStatus === 'Table Reserved' || res.orderStatus === 'Pending Acceptance';
                const isAccepted = res.orderStatus === 'Accepted';
                const isCooking = res.orderStatus === 'Cooking';
                const isDone = res.orderStatus === 'Served' || res.orderStatus === 'Completed';
                const isDeclined = res.status === 'Declined' || res.status === 'Cancelled';
                const hasPreOrders = res.preOrderedItems && res.preOrderedItems.length > 0;
                const preOrderSum = hasPreOrders ? res.preOrderedItems.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0;

                return (
                  <div
                    key={res.id}
                    className={`glass-card rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                      isPending ? 'border-gray-400/60 bg-gray-900/20' :
                      isCooking ? 'border-gray-500/40 bg-indigo-950/20' :
                      isDeclined ? 'border-black/40 bg-rose-950/20 opacity-60' :
                      isDone ? 'border-gray-800 bg-gray-950/40 opacity-75' :
                      'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Top Row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-gray-400 font-bold">{res.id}</span>
                          <span className="px-2 py-0.2 rounded-md text-[9px] font-bold uppercase bg-gray-900 text-gray-200 border border-gray-700">
                            👥 {res.partySize} Guests
                          </span>
                          {res.isPaid && (
                            <span className="px-2 py-0.2 rounded-md text-[9px] font-extrabold uppercase bg-teal-950 text-teal-300 border border-gray-300/40 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> PAID ₹{res.paidAmount || preOrderSum}
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isDeclined ? 'bg-rose-950 text-rose-300 border-black/40' :
                          isCooking ? 'bg-gray-900 text-amber-300 border-gray-400/40 animate-pulse' :
                          isDone ? 'bg-teal-950 text-teal-300 border-gray-300/40' :
                          'bg-indigo-950 text-indigo-300 border-gray-500/40'
                        }`}>
                          {res.orderStatus}
                        </span>
                      </div>

                      {/* Guest info & Table allocated */}
                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight">{res.guestName}</h4>
                        <p className="text-xs text-gray-400">
                          📍 {res.tableName || 'Table Auto-Match'} • ⏰ {res.date} at {res.time}
                        </p>
                        {res.guestPhone && (
                          <p className="text-[11px] text-gray-500 font-mono">📞 {res.guestPhone}</p>
                        )}
                      </div>

                      {/* Pre-Ordered Food Ticket */}
                      {hasPreOrders ? (
                        <div className="p-3 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold">
                            <span>Pre-Ordered Dishes ({res.preOrderedItems.length}):</span>
                            <span className="text-white font-extrabold">₹{preOrderSum}</span>
                          </div>
                          {res.preOrderedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-gray-300">
                              <span className="truncate pr-2 font-semibold">
                                {item.qty}x {item.name}
                              </span>
                              <span className="text-white font-mono">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-gray-950/40 border border-gray-900 text-[11px] text-gray-500 italic">
                          No pre-ordered dishes (Tableside dining order)
                        </div>
                      )}

                      {/* Special Requests */}
                      {res.specialRequests && res.specialRequests !== 'None' && (
                        <div className="p-2 rounded-xl bg-indigo-950/30 border border-gray-500/30 text-[11px] text-indigo-300">
                          💬 "{res.specialRequests}"
                        </div>
                      )}
                    </div>

                    {/* Step Action Buttons (Accept / Decline / Cook / Serve / Collect Payment) */}
                    <div className="pt-2 border-t border-gray-800/80 space-y-2">
                      
                      {/* Accept & Decline Buttons for Incoming Requests */}
                      {isPending && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => acceptReservation(res.id)}
                            className="py-2.5 px-3 rounded-xl bg-black hover:bg-black text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() => setDecliningResId(res.id)}
                            className="py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-black/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}

                      {/* Progress Cooking / Served */}
                      {isAccepted && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleProgressOrder(res.id, 'Cooking')}
                            className="py-2.5 px-3 rounded-xl bg-gray-400 hover:bg-gray-400 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>Cooking 🍳</span>
                          </button>

                          <button
                            onClick={() => handleProgressOrder(res.id, 'Served')}
                            className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-gray-300 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Seat & Serve</span>
                          </button>
                        </div>
                      )}

                      {isCooking && (
                        <button
                          onClick={() => handleProgressOrder(res.id, 'Served')}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Diners Seated & Dishes Served ✨</span>
                        </button>
                      )}

                      {/* Payment Collection & Table Release */}
                      {(isDone || isCooking || isAccepted) && !res.isPaid && (
                        <button
                          onClick={() => handleOpenPayment(res)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect Payment Online (Razorpay/Stripe) 💳</span>
                        </button>
                      )}

                      {isDone && res.tableId && (
                        <button
                          onClick={() => {
                            updateTableStatus(currentRest.id, res.tableId, 'available');
                            triggerToast('Table Released 🧹✨', `${res.tableName} is now sanitized & available for live walk-ins.`, 'info');
                          }}
                          className="w-full py-2 rounded-xl bg-gray-900/80 hover:bg-emerald-900 border border-gray-700 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Mark Table Clean & Free for Next Guest ➔</span>
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 2: LIVE FLOOR PLAN & TABLE STATUS (occupied / booked / free / cleaning) */}
      {activeAdminTab === 'floor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Interactive Real-Time Floor Plan</h3>
              <p className="text-xs text-gray-400">Click any status button below to instantly toggle table state across Chennai</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white bg-gray-900 px-3 py-1 rounded-xl border border-gray-700">
                🟢 {freeTables} Free
              </span>
              <span className="text-xs font-bold text-gray-300 bg-rose-950 px-3 py-1 rounded-xl border border-black/40">
                🔴 {occupiedTables} Occupied
              </span>
              <span className="text-xs font-bold text-gray-300 bg-gray-900 px-3 py-1 rounded-xl border border-gray-400/40">
                🟡 {reservedTables} Booked
              </span>
              <span className="text-xs font-bold text-gray-400 bg-indigo-950 px-3 py-1 rounded-xl border border-gray-500/40">
                🧹 {cleaningTables} Cleaning
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(currentRest.tables || []).map(table => {
              const isAvailable = table.status === 'available';
              const isOccupied = table.status === 'occupied';
              const isReserved = table.status === 'reserved';
              const isCleaning = table.status === 'cleaning';

              return (
                <div
                  key={table.id}
                  className={`p-4 rounded-3xl border transition-all space-y-3 ${
                    isAvailable ? 'bg-gray-900/40 border-gray-700 text-emerald-200' :
                    isOccupied ? 'bg-rose-950/40 border-black/40 text-rose-200' :
                    isReserved ? 'bg-gray-900/40 border-gray-400/40 text-amber-200' :
                    'bg-indigo-950/40 border-gray-500/40 text-indigo-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">{table.name}</span>
                    <span className="text-[10px] font-mono uppercase bg-black/60 px-2 py-0.5 rounded-full font-bold">
                      {table.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-300">
                    <div>Capacity: <strong>{table.capacity} Guests</strong></div>
                    <div className="text-[10px] text-gray-400">{table.section}</div>
                    {isOccupied && table.minsRemaining && (
                      <div className="text-[11px] text-amber-300 font-bold mt-1">
                        ⏱️ ~{table.minsRemaining} mins remaining
                      </div>
                    )}
                  </div>

                  {/* 1-Click Status Toggles */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-800/80">
                    <button
                      onClick={() => updateTableStatus(currentRest.id, table.id, 'available')}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all ${
                        isAvailable ? 'bg-black text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      Free 🟢
                    </button>

                    <button
                      onClick={() => updateTableStatus(currentRest.id, table.id, 'occupied')}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all ${
                        isOccupied ? 'bg-rose-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      Occupied 🔴
                    </button>

                    <button
                      onClick={() => updateTableStatus(currentRest.id, table.id, 'reserved')}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all ${
                        isReserved ? 'bg-gray-400 text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      Booked 🟡
                    </button>

                    <button
                      onClick={() => updateTableStatus(currentRest.id, table.id, 'cleaning')}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all ${
                        isCleaning ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      Sanitize 🧹
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TABLE BILL MANAGER & ONLINE PAYMENT COLLECTION */}
      {activeAdminTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Table Bill Manager & Online Payments</h3>
              <p className="text-xs text-gray-400">Manage dish orders per table, apply discounts/taxes, and collect payments via Razorpay or Stripe</p>
            </div>
            
            {/* Table Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold">Select Active Table:</span>
              <select
                value={selectedBillTableId}
                onChange={(e) => setSelectedBillTableId(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
              >
                {(currentRest.tables || []).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Table Billing Sheet */}
          {(() => {
            const tableRes = currentRestReservations.find(r => r.tableId === selectedBillTableId && r.orderStatus !== 'Completed') || {
              id: `TICKET-${selectedBillTableId}`,
              tableName: currentRest.tables?.find(t => t.id === selectedBillTableId)?.name || `Table ${selectedBillTableId}`,
              guestName: 'Tableside Guest Party',
              tableId: selectedBillTableId,
              preOrderedItems: [
                { id: 'dish-1', name: `${currentRest.name} Signature Dish`, price: 480, qty: 1 },
                { id: 'dish-2', name: 'Traditional Beverage / Dessert', price: 220, qty: 2 }
              ]
            };

            const items = tableRes.preOrderedItems || [];
            const subtotal = items.reduce((acc, i) => acc + (Number(i.price) * Number(i.qty || 1)), 0);
            const discountAmt = Math.round(subtotal * (billDiscountPercent / 100));
            const taxable = subtotal - discountAmt;
            const gst = Math.round(taxable * 0.05);
            const grandTotal = taxable + gst + Number(billServiceCharge || 0);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Item Editor */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-gray-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-gray-300" />
                      <h4 className="font-extrabold text-white text-base">
                        {tableRes.tableName} • Active Dining Bill
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">Diner: {tableRes.guestName}</span>
                  </div>

                  {/* Add Dish from Restaurant Menu */}
                  <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        + Add Dish from Restaurant Menu:
                      </label>
                      <select
                        value={selectedDishToAdd}
                        onChange={(e) => setSelectedDishToAdd(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="">-- Choose dish to add to table bill --</option>
                        {(currentRest.menu || []).map(cat => (
                          <optgroup key={cat.category} label={cat.category}>
                            {(cat.items || []).map(item => (
                              <option key={item.id} value={item.id}>{item.name} - ₹{item.price}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleAddDishToBill(tableRes)}
                      disabled={!selectedDishToAdd}
                      className="w-full sm:w-auto px-4 py-2 mt-auto rounded-xl bg-gray-400 hover:bg-gray-400 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                    >
                      Add Dish
                    </button>
                  </div>

                  {/* Dishes Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                          <th className="py-2">Item Name</th>
                          <th className="py-2 text-center">Unit Price</th>
                          <th className="py-2 text-center">Quantity</th>
                          <th className="py-2 text-right">Total</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500 italic">
                              No items currently on table bill. Add dishes above.
                            </td>
                          </tr>
                        ) : (
                          items.map(item => (
                            <tr key={item.id} className="text-gray-200">
                              <td className="py-3 font-semibold text-white">{item.name}</td>
                              <td className="py-3 text-center font-mono">₹{item.price}</td>
                              <td className="py-3 text-center">
                                <div className="inline-flex items-center gap-2 bg-gray-900 px-2 py-1 rounded-xl border border-gray-800">
                                  <button
                                    onClick={() => handleUpdateItemQty(tableRes, item.id, -1)}
                                    className="text-gray-400 hover:text-white font-bold px-1"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold">{item.qty}</span>
                                  <button
                                    onClick={() => handleUpdateItemQty(tableRes, item.id, 1)}
                                    className="text-gray-400 hover:text-white font-bold px-1"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 text-right font-mono font-bold text-white">
                                ₹{item.price * item.qty}
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleUpdateItemQty(tableRes, item.id, -item.qty)}
                                  className="p-1 rounded text-gray-500 hover:text-gray-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Right Col: Bill Breakdown & Payment Collection */}
                <div className="glass-card rounded-3xl p-6 border border-black/30 bg-gradient-to-br from-gray-950 via-gray-900/20 to-gray-950 space-y-5">
                  <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-white" />
                    Bill Summary & Settlement
                  </h4>

                  {/* Adjustments: Discount & Service charge */}
                  <div className="space-y-3 p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Apply Discount (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={billDiscountPercent}
                        onChange={(e) => setBillDiscountPercent(Number(e.target.value))}
                        className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none"
                        placeholder="0%"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Service Charge (₹):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={billServiceCharge}
                        onChange={(e) => setBillServiceCharge(Number(e.target.value))}
                        className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none"
                        placeholder="₹0"
                      />
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-2 text-xs font-mono border-t border-gray-800 pt-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Item Subtotal:</span>
                      <span className="text-white">₹{subtotal}</span>
                    </div>
                    {billDiscountPercent > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Discount ({billDiscountPercent}%):</span>
                        <span>- ₹{discountAmt}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>GST (5%):</span>
                      <span className="text-white">₹{gst}</span>
                    </div>
                    {billServiceCharge > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Service Charge:</span>
                        <span className="text-white">₹{billServiceCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-sans font-black text-white pt-2 border-t border-gray-800">
                      <span>Total Payable:</span>
                      <span className="text-white font-mono">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Collect Online Payment Button */}
                  <button
                    onClick={() => {
                      setActivePaymentBill({
                        tableId: selectedBillTableId,
                        tableName: tableRes.tableName,
                        guestName: tableRes.guestName,
                        restaurantName: currentRest.name,
                        amount: grandTotal
                      });
                      setPaymentModalOpen(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-gray-300 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-gray-900/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Collect ₹{grandTotal} Online (Razorpay/Stripe) ➔</span>
                  </button>

                  <p className="text-[10px] text-center text-gray-400">
                    Supports Razorpay (UPI, Netbanking) & Stripe (Credit/Debit cards).
                  </p>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* TAB 4: CROWD DENSITY & WAIT SETTINGS */}
      {activeAdminTab === 'crowd_settings' && (
        <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">Live Crowd Level & Wait Estimation Calibration</h3>
            <p className="text-xs text-gray-400">Calibrate the live crowd badge and estimated waiting times shown to diners across Chennai</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
              <label className="text-xs font-bold text-white block">Current Live Crowd Density:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'low', label: '🟢 Low Crowd (Walk-ins Welcome)', sub: '0 min wait' },
                  { level: 'medium', label: '🟡 Moderate Crowd', sub: '~15 min wait' },
                  { level: 'high', label: '🔴 High Rush Crowd', sub: '~30-45 min wait' }
                ].map(c => (
                  <button
                    key={c.level}
                    onClick={() => updateRestaurantCrowdLevel(currentRest.id, c.level)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      currentRest.crowdLevel === c.level
                        ? 'bg-gray-900/80 border-gray-400 text-amber-200 shadow-md'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{c.label}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{c.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        billData={activePaymentBill}
        onPaymentSuccess={handlePaymentCompleted}
      />

    </div>
  );
};
