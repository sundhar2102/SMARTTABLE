import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UtensilsCrossed, 
  X, 
  Sparkles, 
  CalendarCheck, 
  CheckCircle2, 
  Search, 
  Leaf, 
  Flame, 
  Star,
  Store, 
  MapPin, 
  ChevronDown,
  ShoppingBag,
  Plus,
  Minus
} from 'lucide-react';

export const MenuModal = () => {
  const { 
    menuModalOpen, 
    setMenuModalOpen, 
    restaurants,
    selectedRestaurantId,
    setSelectedRestaurantId,
    activeRestaurant, 
    setBookingModalOpen,
    preOrderItems,
    addPreOrderItem,
    updatePreOrderItemQty,
    preOrderRestaurantId
  } = useApp();

  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'spicy' | 'chef' | 'gf'
  const [itemSearch, setItemSearch] = useState('');

  if (!menuModalOpen || !activeRestaurant) return null;

  const currentRestPreOrders = preOrderRestaurantId === activeRestaurant.id ? preOrderItems : [];
  const preOrderTotal = currentRestPreOrders.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const preOrderTotalQty = currentRestPreOrders.reduce((sum, i) => sum + i.qty, 0);

  // Filter categories and items
  const filteredCategories = (activeRestaurant.menu || []).map(cat => {
    const matchingItems = cat.items.filter(item => {
      if (itemSearch) {
        const q = itemSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = (item.desc || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      if (dietaryFilter === 'veg') {
        const isVeg = item.tags && (item.tags.includes('v') || item.tags.includes('vg'));
        if (!isVeg && !activeRestaurant.isPureVeg) return false;
      } else if (dietaryFilter === 'spicy') {
        if (!item.tags || !item.tags.includes('spicy')) return false;
      } else if (dietaryFilter === 'chef') {
        if (!item.tags || !item.tags.includes('chef')) return false;
      } else if (dietaryFilter === 'gf') {
        if (!item.tags || !item.tags.includes('gf')) return false;
      }

      return true;
    });

    return {
      ...cat,
      items: matchingItems
    };
  }).filter(cat => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-gray-400/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/40 via-indigo-950/30 to-gray-950 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gray-800 border border-gray-400/40 text-gray-300">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white tracking-tight">{activeRestaurant.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-amber-300 border border-gray-400/30">
                    DIGITAL MENU & PRE-ORDER
                  </span>
                  {activeRestaurant.isPureVeg && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-gray-200 border border-gray-700 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-white" /> Pure Vegetarian
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{activeRestaurant.cuisine} • {activeRestaurant.location}</p>
              </div>
            </div>

            <button
              onClick={() => setMenuModalOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Restaurant Selector Dropdown Bar */}
          <div className="p-2.5 rounded-2xl bg-gray-950/80 border border-gray-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={activeRestaurant.image}
                alt={activeRestaurant.name}
                className="w-9 h-9 rounded-xl object-cover border border-gray-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                  <Store className="w-3 h-3 text-gray-300" /> Switch Menu:
                </label>
                <div className="relative">
                  <select
                    value={activeRestaurant.id}
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-2.5 pr-8 py-1.5 text-xs font-bold outline-none focus:border-gray-400 cursor-pointer appearance-none"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id} className="bg-gray-900 text-white">
                        {r.name} — {r.location}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Dietary Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search dishes (e.g. Lobster, Dosa, Prawns, Biryani)..."
                className="w-full bg-gray-900/90 border border-gray-800 text-white rounded-2xl pl-10 pr-4 py-2 text-xs outline-none focus:border-gray-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'veg', label: '🌿 Pure Veg' },
                { id: 'spicy', label: '🌶️ Spicy' },
                { id: 'chef', label: '⭐ Chef Picks' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDietaryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    dietaryFilter === tab.id
                      ? 'bg-gray-400 text-black shadow-md'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Menu Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <UtensilsCrossed className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-400">No dishes match your search or filter</p>
            </div>
          ) : (
            filteredCategories.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-gray-800/80">
                  <span>{cat.category}</span>
                  <span className="text-[10px] text-gray-400 font-normal">({cat.items.length} items)</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {cat.items.map(item => {
                    const existingInPreOrders = currentRestPreOrders.find(i => i.id === item.id);
                    const qtyInPreOrder = existingInPreOrders ? existingInPreOrders.qty : 0;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          qtyInPreOrder > 0
                            ? 'bg-gray-900/30 border-black/50 shadow-md'
                            : 'bg-gray-950/80 border-gray-800/80 hover:border-gray-400/40'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-2 h-2 rounded-full ${item.tags?.includes('v') ? 'bg-white' : 'bg-gray-300'}`} />
                            <h5 className="text-sm font-bold text-white tracking-tight">{item.name}</h5>
                            
                            {item.tags?.includes('chef') && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-900 text-amber-300 border border-gray-400/40">
                                CHEF SIGNATURE
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 leading-relaxed pr-2">
                            {item.desc}
                          </p>

                          <div className="text-sm font-black text-white pt-1">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Action: Pre-Order for Table / Qty Stepper */}
                        <div>
                          {qtyInPreOrder > 0 ? (
                            <div className="flex items-center gap-2 bg-gray-900 border border-black/50 rounded-xl px-2.5 py-1.5 shadow-md">
                              <button
                                onClick={() => updatePreOrderItemQty(item.id, qtyInPreOrder - 1)}
                                className="text-gray-400 hover:text-white p-0.5"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-white min-w-[20px] text-center">{qtyInPreOrder}</span>
                              <button
                                onClick={() => updatePreOrderItemQty(item.id, qtyInPreOrder + 1)}
                                className="text-white hover:text-gray-200 p-0.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addPreOrderItem(activeRestaurant, item, 1)}
                              className="px-4 py-2 rounded-xl bg-gray-900 border border-black/50 hover:bg-gray-900/80 text-gray-200 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Pre-Order for Table</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom Action Bar (Book Table with Pre-orders) */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="text-xs text-gray-300">
            {preOrderTotalQty > 0 ? (
              <div>
                <span className="font-bold text-white">{preOrderTotalQty} dishes pre-ordered</span> • Subtotal: <strong className="text-white font-bold">₹{preOrderTotal.toLocaleString('en-IN')}</strong>
                <p className="text-[11px] text-gray-400">Kitchen will begin cooking freshly when your table is seated!</p>
              </div>
            ) : (
              <span>Pre-order signature dishes now or order tableside when seated!</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMenuModalOpen(false);
                setBookingModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-gray-300 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-gray-900/50 flex items-center gap-2 cursor-pointer hover:brightness-110"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Table {preOrderTotalQty > 0 ? `with ${preOrderTotalQty} Pre-Orders (₹${preOrderTotal})` : 'Now'} ➔</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
