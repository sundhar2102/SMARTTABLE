import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Filter, 
  CalendarCheck, 
  Info,
  Layers,
  Bot,
  Flame,
  Activity
} from 'lucide-react';

export const FloorMapViewer = ({ onTableSelect }) => {
  const { 
    activeRestaurant, 
    setSelectedTableForBooking, 
    setBookingModalOpen, 
    setAiPredictorOpen,
    openCrowdRadar,
    getEstimatedWaitTime 
  } = useApp();
  
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [hoveredTable, setHoveredTable] = useState(null);

  if (!activeRestaurant) return null;

  // Filter logic
  const filteredTables = activeRestaurant.tables.filter(table => {
    if (selectedSection !== 'all' && table.section !== selectedSection) return false;
    if (selectedCapacity !== 'all') {
      const cap = Number(selectedCapacity);
      if (cap === 6 && table.capacity < 6) return false;
      if (cap !== 6 && table.capacity !== cap) return false;
    }
    return true;
  });

  const freeCount = activeRestaurant.tables.filter(t => t.status === 'available').length;
  const occupiedCount = activeRestaurant.tables.filter(t => t.status === 'occupied').length;
  const reservedCount = activeRestaurant.tables.filter(t => t.status === 'reserved').length;
  const cleaningCount = activeRestaurant.tables.filter(t => t.status === 'cleaning').length;

  const waitInfo = getEstimatedWaitTime(activeRestaurant.id, 2);

  const handleTableClick = (table) => {
    if (table.status === 'available' || table.status === 'cleaning') {
      setSelectedTableForBooking(table);
      setBookingModalOpen(true);
      if (onTableSelect) onTableSelect(table);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-gray-800 shadow-2xl space-y-6">
      
      {/* Header & Stats Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Real-Time Floor Plan & Live Availability Map
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">{activeRestaurant.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{activeRestaurant.location} • {activeRestaurant.cuisine}</p>
        </div>

        {/* Live Counters Pill & Action Launchers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-gray-900/70 border border-gray-700 text-gray-200 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>Available: <strong>{freeCount}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-black/40 text-rose-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span>Occupied: <strong>{occupiedCount}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-gray-900/70 border border-gray-400/40 text-amber-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span>Reserved: <strong>{reservedCount}</strong></span>
          </div>

          {/* Crowd Radar Trigger Button */}
          <button
            onClick={() => openCrowdRadar(activeRestaurant)}
            className="px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-400/40 text-amber-300 font-bold hover:border-gray-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Flame className="w-3.5 h-3.5 text-gray-300" />
            <span>Crowd & Wait Radar ({waitInfo.text})</span>
          </button>

          <button
            onClick={() => setAiPredictorOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-gray-500/40 text-indigo-200 font-semibold hover:border-gray-400 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-gray-400" />
            <span>AI Predictor</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-950/60 p-3 rounded-2xl border border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-gray-400 font-semibold px-2">
            <Filter className="w-3.5 h-3.5 text-white" />
            <span>Filter Floor:</span>
          </div>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-black"
          >
            <option value="all">All Sections</option>
            {activeRestaurant.sections.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Capacity Filter */}
          <select
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-black"
          >
            <option value="all">Any Party Size</option>
            <option value="1">1 Person (Bar/Counter)</option>
            <option value="2">2 Seater</option>
            <option value="4">4 Seater</option>
            <option value="6">6+ Large Group</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1 sm:pt-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-black/30 border border-white"></span>
            <span>Free (Click to Book)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-black/30 border border-gray-300"></span>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gray-400/30 border border-gray-300"></span>
            <span>Reserved</span>
          </div>
        </div>
      </div>

      {/* 2D Interactive Floor Layout Canvas Grid */}
      <div className="relative min-h-[420px] w-full bg-gray-950/80 rounded-2xl border border-gray-800/80 p-6 overflow-hidden flex flex-col justify-between">
        
        {/* Subtle Background Grid Pattern & Ambient Scanline */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="scanline-effect"></div>

        {/* Section Banners Overlay */}
        <div className="absolute top-3 left-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">
          Indoor Dining Hall
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">
          Outdoor Terrace & Lounge
        </div>

        {/* Tables Layout Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-auto">
          {filteredTables.map(table => {
            const isAvailable = table.status === 'available';
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';
            const isCleaning = table.status === 'cleaning';

            let statusClass = 'table-available cursor-pointer hover:scale-105';
            if (isOccupied) statusClass = 'table-occupied cursor-not-allowed opacity-85';
            else if (isReserved) statusClass = 'table-reserved cursor-not-allowed opacity-85';
            else if (isCleaning) statusClass = 'table-cleaning cursor-pointer hover:scale-105';

            let shapeStyle = 'rounded-2xl p-4';
            if (table.shape === 'round') shapeStyle = 'rounded-full p-4 aspect-square';
            else if (table.shape === 'booth') shapeStyle = 'rounded-xl p-4 border-l-4 border-l-gray-300';
            else if (table.shape === 'stool') shapeStyle = 'rounded-lg p-2.5';

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                onMouseEnter={() => setHoveredTable(table)}
                onMouseLeave={() => setHoveredTable(null)}
                className={`relative flex flex-col items-center justify-center text-center transition-all duration-200 shadow-lg ${shapeStyle} ${statusClass}`}
              >
                {/* Status Indicator Glow */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-sm text-white tracking-tight">{table.name}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium opacity-90">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} Seats</span>
                </div>

                {/* Subtext info */}
                {isOccupied && table.minsRemaining && (
                  <span className="mt-1 text-[10px] bg-rose-950/80 px-1.5 py-0.5 rounded text-rose-300 font-mono">
                    ~{table.minsRemaining}m left
                  </span>
                )}

                {isAvailable && (
                  <span className="mt-1 text-[10px] bg-gray-900/90 px-2 py-0.5 rounded text-gray-200 font-semibold">
                    Free
                  </span>
                )}

                {isReserved && (
                  <span className="mt-1 text-[10px] bg-gray-900/90 px-1.5 py-0.5 rounded text-amber-300 truncate max-w-[80px]">
                    Booked
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Hovered Table Details Floating Footer Bar */}
        <div className="relative z-20 mt-4 p-3 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between text-xs">
          {hoveredTable ? (
            <div className="flex items-center gap-3">
              <span className="font-bold text-white text-sm">{hoveredTable.name}</span>
              <span className="text-gray-400">• Section: <strong className="text-gray-200">{hoveredTable.section}</strong></span>
              <span className="text-gray-400">• Capacity: <strong className="text-white">{hoveredTable.capacity} guests</strong></span>
              {hoveredTable.status === 'occupied' && (
                <span className="text-gray-300 font-semibold">Occupied (~{hoveredTable.minsRemaining} mins remaining)</span>
              )}
              {hoveredTable.status === 'available' && (
                <span className="text-white font-semibold animate-pulse">⚡ Click to reserve instantly!</span>
              )}
            </div>
          ) : (
            <div className="text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-white" />
              <span>Hover over any table to view real-time occupancy status. Click green tables to initiate instant reservation.</span>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={() => openCrowdRadar(activeRestaurant)}
              className="px-3.5 py-2 rounded-xl bg-gray-900/80 hover:bg-amber-900 border border-gray-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Wait Radar</span>
            </button>

            <button
              onClick={() => {
                setSelectedTableForBooking(null);
                setBookingModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:brightness-110 shadow-lg shadow-gray-900/50 cursor-pointer"
            >
              Book Next Free Table
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
