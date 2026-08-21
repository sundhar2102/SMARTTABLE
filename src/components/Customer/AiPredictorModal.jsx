import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Sparkles, 
  Users, 
  Clock, 
  CloudRain, 
  Sun, 
  Calendar, 
  X, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';

export const AiPredictorModal = () => {
  const { 
    aiPredictorOpen, 
    setAiPredictorOpen, 
    restaurants, 
    selectedRestaurantId, 
    setSelectedRestaurantId,
    calculateAiPrediction,
    setBookingModalOpen 
  } = useApp();

  const [partySize, setPartySize] = useState(2);
  const [targetTime, setTargetTime] = useState('19:30');
  const [dayType, setDayType] = useState('today');
  const [weather, setWeather] = useState('sunny');

  if (!aiPredictorOpen) return null;

  const currentRest = restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0];

  const prediction = calculateAiPrediction({
    restaurantId: currentRest.id,
    partySize,
    targetTime,
    dayType,
    weather
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-gray-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/80 bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-gray-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 border border-gray-500/40 text-indigo-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Walk-in Table Predictor</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-indigo-300 border border-gray-500/30">
                  Real-Time AI Engine
                </span>
              </div>
              <p className="text-xs text-gray-400">Calculate exact probability of securing a walk-in table without booking</p>
            </div>
          </div>

          <button
            onClick={() => setAiPredictorOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-950/60 p-4 rounded-2xl border border-gray-800">
            
            {/* Restaurant Picker */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Restaurant
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-gray-500"
              >
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Party Size */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Party Size
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-gray-500"
              >
                <option value={1}>1 Guest (Bar/Counter)</option>
                <option value={2}>2 Guests (Table/Booth)</option>
                <option value={4}>4 Guests (Standard)</option>
                <option value={6}>6 Guests (Large Group)</option>
                <option value={8}>8+ Guests (VIP Room)</option>
              </select>
            </div>

            {/* Target Time */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Target Time
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-gray-500"
              />
            </div>

            {/* Weather Condition */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-gray-500"
              >
                <option value="sunny">☀️ Clear / Warm</option>
                <option value="rainy">🌧️ Rain / Storm</option>
                <option value="cool">🌬️ Cool / Chilly</option>
              </select>
            </div>

          </div>

          {/* AI Prediction Result Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-gray-950 border border-gray-500/30 shadow-xl space-y-5 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Walk-in Probability Score
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {prediction.score}%
                  </span>
                  <span className={`text-sm font-bold ${prediction.color}`}>
                    {prediction.label}
                  </span>
                </div>
              </div>

              {/* Score Meter Visual Pill */}
              <div className="w-full sm:w-48 space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  <span>Chance Meter</span>
                  <span className="text-white font-bold">{prediction.score}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-900 border border-gray-800 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      prediction.score > 70 
                        ? 'bg-gradient-to-r from-black to-white' 
                        : prediction.score > 40 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-400' 
                        : 'bg-gradient-to-r from-black to-gray-400'
                    }`}
                    style={{ width: `${prediction.score}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-400 text-right">
                  Est. Wait: <strong className="text-gray-200">{prediction.waitEstimate}</strong>
                </div>
              </div>
            </div>

            {/* AI Key Insights Breakdown */}
            <div className="space-y-2 pt-2 border-t border-gray-800/80">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-white" /> AI Driver Factors & Rationale:
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {prediction.rationale.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation Box */}
            <div className="p-3 rounded-2xl bg-indigo-950/80 border border-gray-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-200">
                <Zap className="w-4 h-4 text-gray-300 shrink-0" />
                <span>
                  <strong>Optimal Arrival Window:</strong> Arrive between <strong className="text-white">{prediction.bestWindow}</strong> for highest walk-in success.
                </span>
              </div>
            </div>

          </div>

          {/* Hourly Crowd Density Forecast Chart */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Hourly Occupancy Forecast ({currentRest.name})
            </h4>

            <div className="grid grid-cols-7 gap-2 bg-gray-950/60 p-4 rounded-2xl border border-gray-800 text-center">
              {currentRest.hourlyCrowdForecast.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="w-full h-24 bg-gray-900 rounded-lg border border-gray-800 flex flex-col justify-end p-1 overflow-hidden">
                    <div 
                      className={`w-full rounded-md transition-all ${
                        item.level > 80 ? 'bg-black' : item.level > 50 ? 'bg-gray-400' : 'bg-black'
                      }`}
                      style={{ height: `${item.level}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{item.time}</span>
                  <span className="text-[10px] text-gray-300 font-bold">{item.level}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Prefer a guaranteed seat? Book directly on the floor map.
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setAiPredictorOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold"
            >
              Close
            </button>

            <button
              onClick={() => {
                setAiPredictorOpen(false);
                setBookingModalOpen(true);
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg shadow-gray-900/50 hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Reserve Table Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
