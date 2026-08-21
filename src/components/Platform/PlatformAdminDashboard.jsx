import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Store, 
  Bike, 
  Users, 
  Activity, 
  CloudRain, 
  Flame, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  PieChart,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export const PlatformAdminDashboard = () => {
  const { 
    marketplaceSettings, 
    toggleRainSurge, 
    toggleRushSurge, 
    updateCommissionRate, 
    restaurants, 
    riders, 
    orders,
    triggerToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'surge_control' | 'zones'

  // Platform Analytics Calculations
  const totalGmv = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) + (marketplaceSettings.todayGmvTotal || 248900);
  const platformRevenue = Math.round(totalGmv * marketplaceSettings.commissionRate);
  const totalOrdersCount = orders.length + (marketplaceSettings.todayTotalOrders || 382);

  const deliveryOrdersCount = orders.filter(o => o.fulfillmentType === 'delivery').length + 240;
  const takeawayOrdersCount = orders.filter(o => o.fulfillmentType === 'takeaway').length + 82;
  const dineInOrdersCount = orders.filter(o => o.fulfillmentType === 'dine_in').length + 60;

  // Chart data
  const hourlyGmvData = [
    { time: '12 PM', gmv: 28000, orders: 42 },
    { time: '2 PM', gmv: 34000, orders: 55 },
    { time: '4 PM', gmv: 18000, orders: 28 },
    { time: '6 PM', gmv: 42000, orders: 68 },
    { time: '8 PM', gmv: 78000, orders: 120 },
    { time: '10 PM', gmv: 48000, orders: 74 }
  ];

  const zonePerformanceData = [
    { zone: 'Anna Nagar', activeMerchants: 18, activeRiders: 14, orders: 112, avgTime: '19 min' },
    { zone: 'T. Nagar', activeMerchants: 16, activeRiders: 12, orders: 98, avgTime: '21 min' },
    { zone: 'Alwarpet', activeMerchants: 12, activeRiders: 9, orders: 74, avgTime: '18 min' },
    { zone: 'Nungambakkam', activeMerchants: 10, activeRiders: 7, orders: 56, avgTime: '23 min' },
    { zone: 'Guindy', activeMerchants: 8, activeRiders: 6, orders: 42, avgTime: '25 min' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Platform Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-gray-500/40 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-950 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/10 border border-gray-500/30 text-indigo-300 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Hyperlocal Marketplace Governance & Multi-Sided Aggregator Console</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Chennai Hyperlocal Commerce & Dining Hub
            </h2>
            <p className="text-xs md:text-sm text-gray-300">
              Orchestrating real-time on-demand delivery logistics, express curbside takeaways, dine-in table reservations, and dynamic pricing across all Chennai zones.
            </p>
          </div>

          {/* Real-time Surge Quick Toggle Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleRainSurge}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                marketplaceSettings.rainSurgeActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 border-gray-400'
                  : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Rain Surge ({marketplaceSettings.rainSurgeActive ? 'ON (+₹25)' : 'OFF'})</span>
            </button>

            <button
              onClick={toggleRushSurge}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                marketplaceSettings.rushHourSurgeActive
                  ? 'bg-gray-400 text-white shadow-lg shadow-gray-900/50 border-gray-300'
                  : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Rush Surge ({marketplaceSettings.rushHourSurgeActive ? '1.25x' : 'OFF'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1.5 bg-gradient-to-br from-gray-900/40 to-gray-950">
          <div className="flex items-center justify-between text-xs text-white font-semibold">
            <span>Marketplace GMV</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalGmv.toLocaleString()}</div>
          <span className="text-[10px] text-gray-400">Total transaction value today</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1.5 bg-gradient-to-br from-indigo-950/40 to-gray-950">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Commission Take ({(marketplaceSettings.commissionRate * 100).toFixed(0)}%)</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">₹{platformRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-gray-400">Platform revenue earned</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1.5 bg-gradient-to-br from-gray-900/40 to-gray-950">
          <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
            <span>Active Supply (Merchants)</span>
            <Store className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{restaurants.length || 64}</div>
          <span className="text-[10px] text-gray-400">Partner restaurants online</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-gray-800 space-y-1.5 bg-gradient-to-br from-teal-950/40 to-gray-950">
          <div className="flex items-center justify-between text-xs text-white font-semibold">
            <span>Fulfillment Fleet (Riders)</span>
            <Bike className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{riders.length || 48}</div>
          <span className="text-[10px] text-white font-semibold">Avg ETA: 22 mins</span>
        </div>

      </div>

      {/* Multi-Channel Distribution & GMV Hourly Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GMV Trend Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Today's Hyperlocal GMV Velocity</h3>
              <p className="text-xs text-gray-400">Real-time order volume and gross merchandise value (₹)</p>
            </div>
            <span className="text-xs text-white font-mono font-bold bg-gray-900/80 px-2.5 py-1 rounded-xl border border-black/30">
              Peak: 8:00 PM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyGmvData}>
                <defs>
                  <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="gmv" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gmvGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Service Channel Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">Fulfillment Channel Split</h3>
            <p className="text-xs text-gray-400">Distribution across consumer order modes</p>
          </div>

          <div className="space-y-4">
            {/* Delivery */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5" /> Instant Delivery
                </span>
                <span className="text-white font-bold">{deliveryOrdersCount} orders (63%)</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-black h-full rounded-full" style={{ width: '63%' }} />
              </div>
            </div>

            {/* Takeaway */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" /> Express Takeaway
                </span>
                <span className="text-white font-bold">{takeawayOrdersCount} orders (22%)</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-400 h-full rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            {/* Dine-In */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Dine-in Table Reservations
                </span>
                <span className="text-white font-bold">{dineInOrdersCount} tables (15%)</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-500 h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 text-xs text-gray-400">
            Total active transactions: <strong className="text-white">{totalOrdersCount} orders</strong>
          </div>
        </div>

      </div>

      {/* Neighborhood Zones Performance Matrix */}
      <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Chennai Neighborhood Cluster Matrix</h3>
            <p className="text-xs text-gray-400">Live operational telemetry across major zones</p>
          </div>
          <span className="text-xs font-semibold text-gray-400">5 Active Zones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">Zone Cluster</th>
                <th className="py-3 px-4">Active Merchants</th>
                <th className="py-3 px-4">Active Courier Fleet</th>
                <th className="py-3 px-4">Daily Orders</th>
                <th className="py-3 px-4">Avg Fulfillment ETA</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {zonePerformanceData.map((z, idx) => (
                <tr key={idx} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-300" />
                    <span>{z.zone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">{z.activeMerchants} Kitchens</td>
                  <td className="py-3.5 px-4 text-gray-300">{z.activeRiders} Riders Online</td>
                  <td className="py-3.5 px-4 font-bold text-white">{z.orders} Orders</td>
                  <td className="py-3.5 px-4 text-amber-300">{z.avgTime}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-gray-200 border border-black/30">
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
