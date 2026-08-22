import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Clock, 
  Users, 
  Flame, 
  TrendingUp, 
  CalendarCheck, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Timer
} from 'lucide-react';

export const CrowdWaitModal = ({ isOpen, onClose, restaurantOverride = null }) => {
  const { 
    activeRestaurant, 
    restaurants, 
    setSelectedRestaurantId,
    setBookingModalOpen, 
    getEstimatedWaitTime 
  } = useApp();

  const currentRest = restaurants.find(r => r.id === (restaurantOverride?.id || activeRestaurant?.id)) || activeRestaurant;

  const [selectedPartySize, setSelectedPartySize] = useState(2);
  const [selectedSection, setSelectedSection] = useState('all');

  if (!isOpen || !currentRest) return null;

  const totalTables = currentRest.tables.length;
  const freeTables = currentRest.tables.filter(t => t.status === 'available');
  const occupiedTables = currentRest.tables.filter(t => t.status === 'occupied');
  const reservedTables = currentRest.tables.filter(t => t.status === 'reserved');
  const cleaningTables = currentRest.tables.filter(t => t.status === 'cleaning');

  const occupancyRatio = Math.round(((totalTables - freeTables.length) / totalTables) * 100);

  // Filter tables matching party size and section
  const matchingTables = currentRest.tables.filter(t => {
    const sizeMatch = t.capacity >= selectedPartySize;
    const secMatch = selectedSection === 'all' || t.section === selectedSection;
    return sizeMatch && secMatch;
  });

  const getMinsRemaining = (table) => {
    if (table.status === 'occupied') {
      if (table.expectedAvailableAt) {
        const diffMs = new Date(table.expectedAvailableAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diffMs / 60000));
      }
      return table.minsRemaining || 25;
    }
    if (table.status === 'cleaning') {
      if (table.cleaningStartedAt) {
        const diffMs = (new Date(table.cleaningStartedAt).getTime() + 5 * 60000) - Date.now();
        return Math.max(0, Math.ceil(diffMs / 60000));
      }
      return table.minsRemaining || 5;
    }
    return null;
  };

  const matchingFree = matchingTables.filter(t => t.status === 'available');
  const matchingOccupied = matchingTables.filter(t => t.status === 'occupied');

  // Find next table freeing up
  let nextFreeTable = null;
  let nextFreeMins = null;

  if (matchingFree.length > 0) {
    nextFreeTable = matchingFree[0];
    nextFreeMins = 0;
  } else if (matchingOccupied.length > 0) {
    const sortedByMins = [...matchingOccupied].sort((a, b) => {
      const aMins = getMinsRemaining(a) ?? Infinity;
      const bMins = getMinsRemaining(b) ?? Infinity;
      return aMins - bMins;
    });
    nextFreeTable = sortedByMins[0];
    nextFreeMins = getMinsRemaining(nextFreeTable);
  }

  // Section by Section occupancy analysis
  const sectionStats = (currentRest.sections || []).map(secName => {
    const secTables = (currentRest.tables || []).filter(t => t.section === secName);
    const secFree = secTables.filter(t => t.status === 'available').length;
    const secTotal = secTables.length;
    const secOccupancy = secTotal > 0 ? Math.round(((secTotal - secFree) / secTotal) * 100) : 0;
    return {
      name: secName,
      free: secFree,
      total: secTotal,
      occupancy: secOccupancy
    };
  });

  // Calculate dynamic wait calculation
  const waitInfo = getEstimatedWaitTime(currentRest.id, selectedPartySize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-gray-400/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/50 via-gray-950 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gray-800 border border-gray-400/40 text-gray-300">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Live Crowd & Table Wait Radar</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-amber-300 border border-gray-400/30">
                  REAL-TIME SENSORS
                </span>
              </div>
              <p className="text-xs text-gray-400">{currentRest.name} • {currentRest.location}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Party Size & Section Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-white" /> Select Your Party Size:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 4, 6, 8].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedPartySize(size)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPartySize === size
                        ? 'bg-black text-white shadow-md shadow-gray-950'
                        : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    {size === 8 ? '8+ p' : `${size}p`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-gray-400" /> Preferred Section:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-gray-500"
              >
                <option value="all">Any Available Section (Fastest)</option>
                {(currentRest.sections || []).map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hero Wait Estimate & Next Table Countdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Predicted Wait Time */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-950 border border-gray-400/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-300" /> Estimated Walk-in Wait
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-amber-300 border border-gray-400/30">
                  {selectedPartySize} Guests
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {waitInfo.mins === 0 ? '0 mins' : `${waitInfo.mins} mins`}
                </span>
                <span className={`text-xs font-bold ${waitInfo.mins === 0 ? 'text-white' : 'text-gray-300'}`}>
                  {waitInfo.mins === 0 ? '(Immediate Seating)' : `(~${waitInfo.text})`}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                {matchingFree.length > 0 
                  ? `🎉 Good news! ${matchingFree.length} matching table(s) available right now!`
                  : `Currently ${waitInfo.partiesAhead} party ahead in host queue. Turnover calculated via live diner timestamps.`}
              </p>
            </div>

            {/* Next Table Freeing Up Telemetry */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-gray-950 border border-gray-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-gray-400 animate-spin" /> Next Table Freeing Up
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-500/20 text-indigo-300 border border-gray-500/30">
                  Live Sensor
                </span>
              </div>

              {nextFreeTable ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-indigo-200">
                      {nextFreeTable.name} ({nextFreeTable.capacity} Seats)
                    </span>
                  </div>
                  <div className="text-xs text-white font-semibold mt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gray-300" />
                    <span>
                      {nextFreeMins === 0 ? 'Available Right Now' : `Expected free in ~${nextFreeMins} mins`} ({nextFreeTable.section})
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No matching tables configured for {selectedPartySize} guests.</p>
              )}

              <p className="text-[11px] text-gray-400">
                Guaranteed zero wait when you book prior reservation.
              </p>
            </div>

          </div>

          {/* Real-time Crowd Density & Section Heatmap */}
          <div className="p-5 rounded-2xl glass-card border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gray-300" />
                  Live Crowd Density: {occupancyRatio}% Occupied
                </h4>
                <p className="text-xs text-gray-400">
                  {freeTables.length} Free • {occupiedTables.length} Occupied • {reservedTables.length} Reserved • {cleaningTables.length} Cleaning
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                occupancyRatio > 75 
                  ? 'bg-rose-950 text-rose-300 border-black/40 animate-pulse' 
                  : occupancyRatio > 40
                  ? 'bg-gray-900 text-amber-300 border-gray-400/40'
                  : 'bg-gray-900 text-gray-200 border-gray-700'
              }`}>
                {occupancyRatio > 75 ? '🔥 High Surge' : occupancyRatio > 40 ? '⚡ Moderate Crowd' : '✨ Low Crowd'}
              </span>
            </div>

            {/* Section by Section Progress Meters */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Crowd Density by Restaurant Section:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sectionStats.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white">{sec.name}</span>
                      <span className="text-gray-400 text-[11px]">{sec.free} free / {sec.total} tables</span>
                    </div>

                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          sec.occupancy > 75 ? 'bg-black' : sec.occupancy > 40 ? 'bg-gray-400' : 'bg-black'
                        }`} 
                        style={{ width: `${sec.occupancy}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>{sec.occupancy}% Full</span>
                      <span>{sec.occupancy > 75 ? 'Busy' : sec.occupancy > 40 ? 'Steady' : 'Open'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Hourly Crowd Forecast Timeline */}
          {currentRest.hourlyCrowdForecast && (
            <div className="p-5 rounded-2xl glass-card border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-300" /> Hourly Rush Forecast & Peak Windows
                </span>
                <span className="text-[10px] text-gray-400">Peak predicted at 8:00 PM (98%)</span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-2 text-center">
                {currentRest.hourlyCrowdForecast.map((hour, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <div className="w-full bg-gray-900 rounded-lg h-20 flex items-end p-1">
                      <div 
                        className={`w-full rounded-md transition-all ${
                          hour.level > 75 ? 'bg-black' : hour.level > 40 ? 'bg-gray-400' : 'bg-black'
                        }`}
                        style={{ height: `${hour.level}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{hour.time}</span>
                    <span className="text-[9px] font-bold text-gray-300">{hour.level}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Telemetry refreshed in real-time
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                setBookingModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-gray-300 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-gray-900/50 hover:brightness-110 flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reserve Table (Bypass {waitInfo.mins}m Wait)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
