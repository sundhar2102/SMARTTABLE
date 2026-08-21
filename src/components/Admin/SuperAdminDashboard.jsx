import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { RestaurantApprovalsAdmin } from './RestaurantApprovalsAdmin';

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
    triggerToast,
    setSelectedRestaurantId,
    setViewMode
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('analytics'); // 'analytics' | 'users' | 'owners' | 'approvals' | 'disputes'
  const [userSearch, setUserSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [disputeSearch, setDisputeSearch] = useState('');

  // Modals for adding user/owner
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCuisine, setNewUserCuisine] = useState('South Indian Tasting');

  const [addOwnerModalOpen, setAddOwnerModalOpen] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerRestId, setNewOwnerRestId] = useState(restaurants[0]?.id || '');
  const [newOwnerFssai, setNewOwnerFssai] = useState('');

  // Metrics
  const totalUsersCount = registeredUsers.length;
  const activeUsersCount = registeredUsers.filter(u => u.status === 'active').length;
  const totalOwnersCount = restaurantOwners.length;
  const activeOwnersCount = restaurantOwners.filter(o => o.status === 'active').length;
  const pendingApprovalsCount = restaurantApplications.filter(a => a.status === 'pending').length;
  const pendingDisputesCount = disputes.filter(d => d.status === 'pending').length;

  const totalPlatformGmv = registeredUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0) + 482000;
  const platformCommissionRevenue = Math.round(totalPlatformGmv * 0.15);

  // Filtered Users
  const filteredUsers = registeredUsers.filter(u => {
    const q = userSearch.toLowerCase();
    return !userSearch || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
  });

  // Filtered Owners
  const filteredOwners = restaurantOwners.filter(o => {
    const q = ownerSearch.toLowerCase();
    return !ownerSearch || o.name.toLowerCase().includes(q) || o.restaurantName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
  });

  // Filtered Disputes
  const filteredDisputes = disputes.filter(d => {
    const q = disputeSearch.toLowerCase();
    return !disputeSearch || d.userName.toLowerCase().includes(q) || d.restaurantName.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
  });

  // Add User Form Submit
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      favoriteCuisine: newUserCuisine
    });
    setAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  // Add Owner Form Submit
  const handleAddOwnerSubmit = (e) => {
    e.preventDefault();
    if (!newOwnerName.trim() || !newOwnerEmail.trim()) return;
    const targetRest = restaurants.find(r => r.id === newOwnerRestId) || restaurants[0];
    addOwner({
      name: newOwnerName,
      email: newOwnerEmail,
      phone: newOwnerPhone,
      restaurantId: targetRest?.id,
      restaurantName: targetRest?.name,
      fssaiLicense: newOwnerFssai
    });
    setAddOwnerModalOpen(false);
    setNewOwnerName('');
    setNewOwnerEmail('');
    setNewOwnerPhone('');
    setNewOwnerFssai('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Super Admin Hero Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-100 border border-purple-200 text-purple-900 text-xs font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Super Administrator Governance Console</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-[#0a0d0a] tracking-tight">
              SmartTable Platform Control Center
            </h2>
            <p className="text-xs md:text-sm text-gray-600">
              Manage registered users, restaurant owner permissions, approve partner listings, inspect platform revenue analytics, and handle dispute resolutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Full System Root Access Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" /> Registered Diners
          </span>
          <div className="text-2xl font-black text-[#0a0d0a]">{totalUsersCount}</div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">{activeUsersCount} Active Accounts</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-gray-400" /> Restaurant Owners
          </span>
          <div className="text-2xl font-black text-[#0a0d0a]">{totalOwnersCount}</div>
          <span className="text-[11px] font-mono text-amber-700 font-bold">{activeOwnersCount} Active Partners</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Platform Revenue
          </span>
          <div className="text-2xl font-black text-purple-800">₹{platformCommissionRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-gray-500">15% Commission on ₹{totalPlatformGmv.toLocaleString('en-IN')} GMV</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-1 shadow-xs">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Pending Action Items
          </span>
          <div className="text-2xl font-black text-rose-600">{pendingApprovalsCount + pendingDisputesCount}</div>
          <span className="text-[10px] text-gray-500">
            {pendingApprovalsCount} Listings • {pendingDisputesCount} Disputes
          </span>
        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'analytics'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Platform Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'users'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('owners')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'owners'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Owner Directory ({restaurantOwners.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('approvals')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'approvals'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Restaurant Approvals ({pendingApprovalsCount})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('disputes')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeAdminTab === 'disputes'
              ? 'bg-[#0a0d0a] text-white'
              : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Disputes & Refunds ({pendingDisputesCount})</span>
        </button>
      </div>

      {/* TAB 1: PLATFORM-WIDE ANALYTICS */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Platform Telemetry */}
            <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Live Network Telemetry
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">Total Registered Restaurants:</span>
                  <span className="font-bold text-white">{restaurants.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">Total Live Tables Managed:</span>
                  <span className="font-bold text-white">
                    {restaurants.reduce((acc, r) => acc + (r.tables?.length || 0), 0)} Tables
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">Average Platform Occupancy:</span>
                  <span className="font-bold text-amber-300">68% across Chennai</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Platform Take Rate:</span>
                  <span className="font-bold text-purple-300">15.0% Standard Commission</span>
                </div>
              </div>
            </div>

            {/* Box 2: Payment Gateways Breakdown */}
            <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white" />
                Payment Gateway Volume
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">Razorpay (UPI / Netbanking):</span>
                  <span className="font-bold text-gray-400">62% (₹298,840)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">Stripe (Cards & Global):</span>
                  <span className="font-bold text-gray-400">28% (₹134,960)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Instant UPI Direct:</span>
                  <span className="font-bold text-white">10% (₹48,200)</span>
                </div>
              </div>
            </div>

            {/* Box 3: City Cluster Activity */}
            <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-300" />
                Top Dining Hubs
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">Anna Nagar:</span>
                  <span className="font-bold text-white">18 Active Restaurants</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-850">
                  <span className="text-gray-400">T. Nagar:</span>
                  <span className="font-bold text-amber-300">16 Active Restaurants</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Alwarpet / Mylapore:</span>
                  <span className="font-bold text-gray-400">12 Active Restaurants</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED USERS (DINERS) */}
      {activeAdminTab === 'users' && (
        <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Registered Diners Directory</h3>
              <p className="text-xs text-gray-400">Manage customer accounts, deactivate non-compliant users, or remove profiles</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search diner name, email, phone..."
                  className="bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-gray-500"
                />
              </div>

              <button
                onClick={() => setAddUserModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-gray-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Diner Profile</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Total Bookings</th>
                  <th className="py-3 px-3 text-center">Total Spent</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredUsers.map(user => {
                  const isActive = user.status === 'active';

                  return (
                    <tr key={user.id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-black/30 border border-gray-700 text-gray-200 flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{user.name}</div>
                            <span className="text-[10px] text-gray-400 font-mono">{user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-gray-300">{user.email}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{user.phone}</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isActive 
                            ? 'bg-gray-900 text-gray-200 border border-gray-700' 
                            : 'bg-rose-950 text-rose-300 border border-black/40'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-white">
                        {user.totalBookings}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-white">
                        ₹{user.totalSpent?.toLocaleString('en-IN') || 0}
                      </td>

                      <td className="py-3.5 px-3 text-gray-400 font-mono">
                        {user.joinedDate}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-gray-900/60 border-gray-400/40 text-amber-300 hover:bg-amber-900' 
                                : 'bg-gray-950 border-gray-700 text-gray-200 hover:bg-emerald-900'
                            }`}
                            title={isActive ? 'Deactivate account' : 'Reactivate account'}
                          >
                            {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-1.5 rounded-xl bg-gray-900 hover:bg-rose-950/80 border border-gray-800 hover:border-black/40 text-gray-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Remove account permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESTAURANT OWNERS & PARTNERS */}
      {activeAdminTab === 'owners' && (
        <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Restaurant Owners & Partners Registry</h3>
              <p className="text-xs text-gray-400">View compliance scores, FSSAI certificates, and manage owner console access</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  placeholder="Search owner or property..."
                  className="bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-gray-500"
                />
              </div>

              <button
                onClick={() => setAddOwnerModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-gray-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Owner</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Owner Profile</th>
                  <th className="py-3 px-3">Assigned Restaurant</th>
                  <th className="py-3 px-3">FSSAI & GSTIN</th>
                  <th className="py-3 px-3 text-center">Compliance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredOwners.map(owner => {
                  const isActive = owner.status === 'active';

                  return (
                    <tr key={owner.id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-400/30 border border-gray-400/40 text-amber-300 flex items-center justify-center font-bold">
                            {owner.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{owner.name}</div>
                            <div className="text-[11px] text-gray-400">{owner.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{owner.restaurantName}</div>
                        <div className="text-[10px] text-gray-400">{owner.location}</div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-gray-300">
                        <div>FSSAI: {owner.fssaiLicense}</div>
                        <div className="text-gray-500 text-[10px]">GSTIN: {owner.gstin}</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-gray-200 border border-gray-700 font-mono">
                          {owner.complianceScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isActive 
                            ? 'bg-gray-900 text-gray-200 border border-gray-700' 
                            : 'bg-rose-950 text-rose-300 border border-black/40'
                        }`}>
                          {owner.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRestaurantId(owner.restaurantId);
                              setViewMode('admin');
                              window.location.hash = `admin?restaurant=${owner.restaurantId}`;
                            }}
                            className="p-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1"
                            title="Inspect Owner Floor Console"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleOwnerStatus(owner.id)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-gray-900/60 border-gray-400/40 text-amber-300 hover:bg-amber-900' 
                                : 'bg-gray-950 border-gray-700 text-gray-200 hover:bg-emerald-900'
                            }`}
                            title={isActive ? 'Deactivate owner portal' : 'Reactivate owner portal'}
                          >
                            {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => deleteOwner(owner.id)}
                            className="p-1.5 rounded-xl bg-gray-900 hover:bg-rose-950/80 border border-gray-800 hover:border-black/40 text-gray-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Remove owner permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURANT APPROVALS QUEUE */}
      {activeAdminTab === 'approvals' && (
        <RestaurantApprovalsAdmin />
      )}

      {/* TAB 5: DISPUTES & REFUND RESOLUTION */}
      {activeAdminTab === 'disputes' && (
        <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Dispute Resolution & Flagged Accounts</h3>
              <p className="text-xs text-gray-400">Review flagged orders, issue Razorpay/Stripe refund authorizations, and settle customer claims</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={disputeSearch}
                onChange={(e) => setDisputeSearch(e.target.value)}
                placeholder="Search dispute ticket or diner..."
                className="bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDisputes.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3 glass-card rounded-3xl border border-gray-800">
                <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
                <h4 className="text-base font-bold text-gray-300">All Disputes Resolved</h4>
                <p className="text-xs text-gray-500">Zero active customer complaints or flagged transactions.</p>
              </div>
            ) : (
              filteredDisputes.map(disp => {
                const isPending = disp.status === 'pending';
                const isRefunded = disp.status === 'refunded';
                const isResolved = disp.status === 'resolved';

                return (
                  <div
                    key={disp.id}
                    className={`glass-card rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                      isPending ? 'border-black/50 bg-rose-950/20' : 'border-gray-800 opacity-80'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-gray-400 font-bold">{disp.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isPending ? 'bg-rose-950 text-rose-300 border border-black/40 animate-pulse' :
                          isRefunded ? 'bg-teal-950 text-teal-300 border border-gray-300/40' :
                          'bg-gray-900 text-gray-200 border border-gray-700'
                        }`}>
                          {disp.status}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-extrabold text-white">{disp.restaurantName}</div>
                        <div className="text-[11px] text-gray-400">Claimant: {disp.userName} ({disp.userEmail})</div>
                        <div className="text-[10px] text-indigo-300 font-mono mt-0.5">Order/Reservation: {disp.orderOrReservationId}</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-gray-950/80 border border-gray-800 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                          <span>Claimed Amount:</span>
                          <span className="text-gray-300 text-sm font-black">₹{disp.amount}</span>
                        </div>
                        <p className="text-gray-300 text-[11px] leading-relaxed">
                          "{disp.reason}"
                        </p>
                        <div className="text-[10px] text-gray-500 font-mono">Gateway: {disp.gateway}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending ? (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                        <button
                          onClick={() => resolveDispute(disp.id, 'refunded', `Refund of ₹${disp.amount} authorized via ${disp.gateway}.`)}
                          className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Approve Refund</span>
                        </button>

                        <button
                          onClick={() => resolveDispute(disp.id, 'dismissed', 'Claim dismissed after merchant explanation.')}
                          className="py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Dismiss</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-[11px] text-white font-bold border-t border-gray-800">
                        ✓ Case Completed ({disp.resolvedAt || 'Resolved'})
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-gray-500/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="font-extrabold text-white text-base">Register New Diner</h4>
              <button onClick={() => setAddUserModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  placeholder="+91 98400 12345"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-gray-500 text-white font-bold"
                >
                  Create Diner Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Owner */}
      {addOwnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-gray-500/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="font-extrabold text-white text-base">Register Restaurant Owner</h4>
              <button onClick={() => setAddOwnerModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOwnerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Owner Name *</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Owner Email *</label>
                <input
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Assigned Restaurant *</label>
                <select
                  value={newOwnerRestId}
                  onChange={(e) => setNewOwnerRestId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">FSSAI License Number</label>
                <input
                  type="text"
                  value={newOwnerFssai}
                  onChange={(e) => setNewOwnerFssai(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs outline-none font-mono"
                  placeholder="12423000000000"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOwnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-gray-500 text-white font-bold"
                >
                  Register Owner Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
