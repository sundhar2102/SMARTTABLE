import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Sparkles, 
  Users, 
  UtensilsCrossed, 
  Eye, 
  Plus, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Tag,
  Building2,
  X,
  CreditCard,
  QrCode
} from 'lucide-react';

export const RestaurantApprovalsAdmin = () => {
  const { 
    restaurantApplications, 
    approveRestaurantRegistration, 
    rejectRestaurantRegistration, 
    setRegisterRestaurantModalOpen,
    restaurants,
    triggerToast,
    setViewMode,
    setSelectedRestaurantId
  } = useApp();

  const [activeTab, setActiveTab] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  
  // Inspection Modal State
  const [inspectingApp, setInspectingApp] = useState(null);
  
  // Rejection Dialog State
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete FSSAI / Safety Documentation');
  const [customReasonText, setCustomReasonText] = useState('');

  // Metrics Calculations
  const pendingCount = restaurantApplications.filter(a => a.status === 'pending').length;
  const approvedCount = restaurantApplications.filter(a => a.status === 'approved').length;
  const rejectedCount = restaurantApplications.filter(a => a.status === 'rejected').length;
  const totalCount = restaurantApplications.length;

  // Filtered Applications
  const filteredApplications = restaurantApplications.filter(app => {
    const matchesTab = activeTab === 'all' || app.status === activeTab;
    const matchesSearch = !searchQuery || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fssaiLicense.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesZone = selectedZone === 'all' || (app.zone && app.zone.toLowerCase() === selectedZone.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || app.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());

    return matchesTab && matchesSearch && matchesZone && matchesCuisine;
  });

  const handleApprove = (app) => {
    approveRestaurantRegistration(app.id);
  };

  const handleOpenReject = (appId) => {
    setRejectingAppId(appId);
    setRejectionReason('Missing or invalid FSSAI Certificate');
    setCustomReasonText('');
  };

  const handleConfirmReject = () => {
    if (!rejectingAppId) return;
    const finalReason = rejectionReason === 'Other' ? (customReasonText || 'Unverified documentation') : rejectionReason;
    rejectRestaurantRegistration(rejectingAppId, finalReason);
    setRejectingAppId(null);
  };

  const zones = ['all', 'T. Nagar', 'Anna Nagar', 'Alwarpet', 'Nungambakkam', 'Kilpauk', 'OMR'];
  const cuisines = ['all', 'Chettinad', 'Continental', 'Pure Veg', 'Sizzlers', 'Asian', 'North Indian'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in text-gray-200">
      
      {/* Super Admin Top Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-gray-400/40 bg-gradient-to-r from-gray-900/50 via-gray-900 to-indigo-950/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-400/10 border border-gray-400/30 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Merchant Verification & Super Admin Authority</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Restaurant Partner Registrations & Approvals
            </h2>
            <p className="text-xs md:text-sm text-gray-300">
              Verify dining licenses, audit proposed table capacities & FSSAI compliance, and approve new restaurant onboardings to launch them live on SmartTable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRegisterRestaurantModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-extrabold shadow-xl shadow-gray-900/50 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Restaurant Partner 🍽️</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Pending Review */}
        <div className="glass-card rounded-3xl p-5 border border-gray-400/30 bg-gradient-to-br from-gray-900/40 to-gray-950 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-300 font-bold">
            <span>Pending Review</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{pendingCount}</div>
          <span className="text-[10px] text-amber-300 font-semibold">Action required</span>
        </div>

        {/* Live Approved */}
        <div className="glass-card rounded-3xl p-5 border border-black/30 bg-gradient-to-br from-gray-900/40 to-gray-950 space-y-1">
          <div className="flex items-center justify-between text-xs text-white font-bold">
            <span>Live Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{approvedCount}</div>
          <span className="text-[10px] text-gray-400">Active merchants on app</span>
        </div>

        {/* Rejected / Resubmit */}
        <div className="glass-card rounded-3xl p-5 border border-gray-800 bg-gray-950/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-300 font-bold">
            <span>Rejected / Hold</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{rejectedCount}</div>
          <span className="text-[10px] text-gray-400">Compliance re-submissions</span>
        </div>

        {/* Total Applications */}
        <div className="glass-card rounded-3xl p-5 border border-gray-800 bg-gray-950/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>Total Intake</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{totalCount}</div>
          <span className="text-[10px] text-gray-400">Lifetime onboarding</span>
        </div>

        {/* Verification SLA */}
        <div className="glass-card rounded-3xl p-5 border border-gray-800 bg-gray-950/80 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-white font-bold">
            <span>Avg Verification</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-teal-300">12 mins</div>
          <span className="text-[10px] text-white font-semibold">98.4% SLA Pass</span>
        </div>

      </div>

      {/* Tabs & Search Filter Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-900 border border-gray-800 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-gray-400 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Pending Review</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'pending' ? 'bg-black text-amber-300' : 'bg-gray-800 text-gray-300'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'approved'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Approved</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'approved' ? 'bg-gray-900 text-gray-200' : 'bg-gray-800 text-white'
              }`}>
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Rejected</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'rejected' ? 'bg-rose-950 text-rose-300' : 'bg-gray-800 text-gray-300'
              }`}>
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>All ({totalCount})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, owner, FSSAI, zone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 outline-none focus:border-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Sub-Filters (Zone & Cuisine) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-850 text-xs">
          <span className="text-gray-500 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Zone:
          </span>
          {zones.map(z => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                selectedZone === z 
                  ? 'bg-indigo-950 text-indigo-300 border border-gray-500/40'
                  : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {z === 'all' ? 'All Zones' : z}
            </button>
          ))}
        </div>

      </div>

      {/* Applications Cards Grid / Table */}
      <div className="space-y-4">
        
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 space-y-3 glass-panel rounded-3xl border border-gray-800">
            <Store className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm font-bold text-gray-300">No Restaurant Applications Found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No merchant applications match the selected status or search filter criteria.
            </p>
            <button
              onClick={() => setRegisterRestaurantModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:brightness-110 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Register a Demo Restaurant
            </button>
          </div>
        ) : (
          filteredApplications.map(app => {
            const isPending = app.status === 'pending';
            const isApproved = app.status === 'approved';
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id}
                className={`glass-panel rounded-3xl border transition-all overflow-hidden p-5 sm:p-6 space-y-5 ${
                  isPending
                    ? 'border-gray-400/40 bg-gradient-to-r from-gray-950 via-gray-900/10 to-gray-950 shadow-xl shadow-gray-900/20'
                    : isApproved
                    ? 'border-black/30 bg-gray-950/80'
                    : 'border-gray-800 bg-gray-950/40 opacity-75'
                }`}
              >
                
                {/* Header Row: Thumbnail, Name, Status Badge, Quick Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-4">
                    <img
                      src={app.coverImage}
                      alt={app.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-800 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-900 px-2 py-0.5 rounded-md border border-gray-800">
                          {app.id}
                        </span>

                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-900 text-amber-300 border border-gray-400/40 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-300 animate-spin" /> PENDING VERIFICATION
                          </span>
                        )}

                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-900 text-gray-200 border border-gray-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-white" /> LIVE APPROVED
                          </span>
                        )}

                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-black/40 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-gray-300" /> REJECTED
                          </span>
                        )}

                        {app.isPureVeg && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-gray-900 text-gray-200 border border-gray-700">
                            PURE VEG 🟢
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">{app.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{app.tagline}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-400 pt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-gray-300">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-gray-300" /> {app.cuisine}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-300" /> {app.zone || app.city}
                        </span>
                        <span>•</span>
                        <span className="text-gray-400">Submitted: {app.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Decision Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                    
                    <button
                      onClick={() => setInspectingApp(app)}
                      className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span>Inspect Dossier</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleOpenReject(app.id)}
                          className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-black/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(app)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-gray-900/50 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Launch Live 🚀</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => {
                          setViewMode('admin');
                          window.location.hash = `admin?restaurant=${app.approvedRestaurantId || app.id}`;
                          if (app.approvedRestaurantId) {
                            setSelectedRestaurantId(app.approvedRestaurantId);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Owner Console ➔</span>
                      </button>
                    )}

                  </div>

                </div>

                {/* Grid Details Pill Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                  
                  {/* Applicant Contacts */}
                  <div className="p-3 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Owner / Applicant</span>
                    <div className="font-bold text-white">{app.ownerName}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-gray-500" /> {app.ownerEmail}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-500" /> {app.ownerPhone}
                    </div>
                  </div>

                  {/* Dining Capacity & Tables */}
                  <div className="p-3 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Seating Inventory</span>
                    <div className="font-bold text-white">{app.totalCapacity} Total Seats</div>
                    <div className="text-[11px] text-gray-300">
                      <strong>{app.tablesCount || (app.proposedTables?.length || 8)}</strong> Dining Tables
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Sections: {app.sections ? app.sections.join(', ') : 'Main Hall'}
                    </div>
                  </div>

                  {/* Legal Compliance */}
                  <div className="p-3 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center justify-between">
                      <span>Compliance & FSSAI</span>
                      <span className="text-white font-bold">{app.complianceScore}% Score</span>
                    </span>
                    <div className="font-mono text-gray-200 font-bold text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>FSSAI: {app.fssaiLicense}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">GSTIN: {app.gstin || '33AAAAA1234A1Z5'}</div>
                  </div>

                  {/* Settlement & UPI */}
                  <div className="p-3 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Payout UPI Settlement</span>
                    <div className="font-mono text-xs font-bold text-white flex items-center gap-1 truncate">
                      <QrCode className="w-3.5 h-3.5 text-white" />
                      <span>{app.settlementUpiId || 'sundhar8074@axl'}</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Hours: {app.openingHours || '11:00 AM - 11:00 PM'}
                    </div>
                  </div>

                </div>

                {/* Rejection Note if rejected */}
                {isRejected && app.rejectionReason && (
                  <div className="p-3 rounded-2xl bg-rose-950/60 border border-black/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-200">Rejection / Hold Rationale:</strong>
                      <span>{app.rejectionReason}</span>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}

      </div>

      {/* FULL APPLICATION INSPECTION MODAL */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-gray-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-indigo-950/50 via-gray-900 to-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingApp.coverImage}
                  alt={inspectingApp.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-800"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{inspectingApp.name}</h3>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                      {inspectingApp.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{inspectingApp.cuisine} • {inspectingApp.zone || inspectingApp.city}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingApp(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Overview & Tagline */}
              <div className="space-y-1">
                <span className="font-bold text-gray-300 block">Restaurant Pitch & Tagline:</span>
                <p className="text-gray-400 p-3 rounded-2xl bg-gray-900 border border-gray-800">{inspectingApp.tagline}</p>
              </div>

              {/* Location & Maps */}
              <div className="space-y-1">
                <span className="font-bold text-gray-300 block">Verified Physical Address:</span>
                <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-300" />
                    <span>{inspectingApp.location}</span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    GPS Coordinates: {inspectingApp.lat}, {inspectingApp.lng} (Zone: {inspectingApp.zone})
                  </div>
                </div>
              </div>

              {/* Sample Menu Preview */}
              <div className="space-y-2">
                <span className="font-bold text-gray-300 block flex items-center justify-between">
                  <span>Proposed Signature Menu Dishes:</span>
                  <span className="text-gray-300 font-mono">
                    {inspectingApp.proposedMenuSample ? `${inspectingApp.proposedMenuSample.length} dishes` : 'Sample list'}
                  </span>
                </span>

                <div className="space-y-2">
                  {inspectingApp.proposedMenuSample?.map((dish, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{dish.name}</span>
                        {dish.desc && <span className="text-[11px] text-gray-400 block">{dish.desc}</span>}
                      </div>
                      <span className="font-mono text-white font-bold text-sm">₹{dish.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Tables Preview */}
              <div className="space-y-2">
                <span className="font-bold text-gray-300 block flex items-center justify-between">
                  <span>Proposed Floor Plan & Table Configuration:</span>
                  <span className="text-gray-400 font-mono">
                    {inspectingApp.proposedTables?.length || inspectingApp.tablesCount || 6} Tables
                  </span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(inspectingApp.proposedTables || []).map((tbl, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                      <div className="font-bold text-white text-[11px]">{tbl.name}</div>
                      <div className="text-[10px] text-gray-400">{tbl.capacity} Seats • {tbl.section}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Owner details */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Compliance Verification Audit</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div><strong>FSSAI License:</strong> {inspectingApp.fssaiLicense}</div>
                  <div><strong>GSTIN:</strong> {inspectingApp.gstin || '33AAAAA1234A1Z5'}</div>
                  <div><strong>Owner:</strong> {inspectingApp.ownerName} ({inspectingApp.ownerPhone})</div>
                  <div><strong>Payout UPI ID:</strong> {inspectingApp.settlementUpiId || 'sundhar8074@axl'}</div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 border-t border-gray-800 bg-gray-950 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingApp(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-gray-800 cursor-pointer"
              >
                Close
              </button>

              {inspectingApp.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const id = inspectingApp.id;
                      setInspectingApp(null);
                      handleOpenReject(id);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-950 border border-black/40 text-rose-300 font-bold hover:bg-rose-900 cursor-pointer"
                  >
                    Reject Application
                  </button>

                  <button
                    onClick={() => {
                      const app = inspectingApp;
                      setInspectingApp(null);
                      handleApprove(app);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-lg hover:brightness-110 cursor-pointer"
                  >
                    Approve & Launch Restaurant 🚀
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* REJECTION REASON DIALOG MODAL */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-black/40 shadow-2xl p-6 space-y-4 text-gray-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2 text-gray-300 font-bold text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Reject Partner Registration</span>
              </div>
              <button onClick={() => setRejectingAppId(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Select the rationale for rejecting application <strong className="text-white font-mono">{rejectingAppId}</strong>. The applicant will be notified to correct and re-submit:
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Missing or invalid FSSAI Certificate',
                'Unverified Physical Commercial Address',
                'Duplicate Restaurant Registration',
                'Inadequate Kitchen Safety Documentation',
                'Other'
              ].map(reason => (
                <label key={reason} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-700">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectionReason === reason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="accent-black"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {rejectionReason === 'Other' && (
              <textarea
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder="Enter custom rejection reason..."
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-black"
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => setRejectingAppId(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-black text-white text-xs font-extrabold cursor-pointer shadow-lg shadow-rose-950/50"
              >
                Confirm Rejection ❌
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
