import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_RESTAURANT_APPLICATIONS,
  INITIAL_USERS,
  INITIAL_OWNERS,
  INITIAL_DISPUTES,
  DEV_DEMO_ACCOUNTS
} from '../data/mockData';
import { apiService } from '../services/api';
import { playOrderAlert } from '../utils/audioUtils';
import { checkOAuthRedirectResult } from '../services/oauthService';
import confetti from 'canvas-confetti';
import { useSocket } from './SocketContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Try to load initial auth state from localStorage
  const savedUser = (() => {
    try {
      const item = localStorage.getItem('smarttable_user');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  })();

  // Authenticated User & Role State
  const [user, setUser] = useState(savedUser || {
    name: '',
    email: '',
    phone: '',
    role: null,
    isLoggedIn: false
  });

  const [viewMode, setViewMode] = useState(savedUser?.role === 'admin' ? 'superadmin' : savedUser?.role === 'owner' ? 'admin' : 'customer'); // 'customer' | 'admin' | 'superadmin'
  const [authDefaultRole, setAuthDefaultRole] = useState('customer');
  const [restaurants, setRestaurants] = useState([]);
  const [osmRestaurants, setOsmRestaurants] = useState([]);
  const [osmFetchError, setOsmFetchError] = useState(null);
  const [isOsmLoading, setIsOsmLoading] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(savedUser?.restaurantId || null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Platform Users & Owners Management State (Admin console)
  // Phase 6: No longer seeded from localStorage — loaded from MySQL via API on demand
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [restaurantOwners, setRestaurantOwners] = useState([]);
  const [adminRestaurants, setAdminRestaurants] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);

  // Restaurant Partner Applications & Approvals State
  const [restaurantApplications, setRestaurantApplications] = useState(INITIAL_RESTAURANT_APPLICATIONS);
  const [registerRestaurantModalOpen, setRegisterRestaurantModalOpen] = useState(false);

  // Modals & Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aiPredictorOpen, setAiPredictorOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [crowdWaitModalOpen, setCrowdWaitModalOpen] = useState(false);
  const [crowdRadarRestaurant, setCrowdRadarRestaurant] = useState(null);

  // Payment & Bills State
  const [payBillModalOpen, setPayBillModalOpen] = useState(false);
  const [activeBillReservation, setActiveBillReservation] = useState(null);
  const [quickPayModalOpen, setQuickPayModalOpen] = useState(false);
  const [quickPayConfig, setQuickPayConfig] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [partySizeFilter, setPartySizeFilter] = useState('all');
  const [crowdFilter, setCrowdFilter] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  // Reservations & Pre-Orders
  const [userReservations, setUserReservations] = useState([]);
  const [preOrderItems, setPreOrderItems] = useState([]);
  const [preOrderRestaurantId, setPreOrderRestaurantId] = useState(null);

  // Table update concurrency lock
  const [processingTables, setProcessingTables] = useState(new Set());

  // Notification Toast
  const [toast, setToast] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Trigger toast alert
  const triggerToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Fetch live restaurants and reservations from Backend API
  const fetchLiveBackendData = useCallback(async (lat = null, lng = null) => {
    try {
      setIsLoadingData(true);
      const health = await apiService.checkHealth();
      if (health && health.status === 'online') {
        setIsBackendConnected(true);
        
        // Fetch live restaurants (SMARTTABLE MySQL only — nearby path)
        const liveRestaurants = await apiService.getRestaurants(lat, lng);
        if (liveRestaurants && liveRestaurants.length > 0) {
          setRestaurants(liveRestaurants);
        }

        // Get authenticated user email to filter reservations
        let currentUserEmail = null;
        try {
          const savedUserJson = localStorage.getItem('smarttable_user');
          if (savedUserJson) {
            const parsed = JSON.parse(savedUserJson);
            currentUserEmail = parsed?.email;
          }
        } catch (e) {}

        // Fetch live reservations
        const liveReservations = await apiService.getReservations(currentUserEmail);
        
        // Fetch live orders
        const liveOrders = await apiService.getAllOrders();
        
        let combined = [...(liveReservations || [])];

        if (liveOrders && liveOrders.length > 0) {
          const formattedOrders = liveOrders.map(o => ({
            id: o.id,
            restaurantId: o.restaurant_id || o.restaurantId,
            guestName: o.guest_name || o.guestName || 'Customer',
            guestEmail: o.guest_email || 'N/A',
            guestPhone: o.guest_phone || 'N/A',
            date: o.created_at ? (o.created_at.includes('T') ? o.created_at.split('T')[0] : o.created_at.split(' ')[0]) : new Date().toISOString().split('T')[0],
            time: o.created_at ? (o.created_at.includes('T') ? o.created_at.split('T')[1].substring(0, 5) : o.created_at.split(' ')[1]?.substring(0, 5) || '12:00') : '12:00',
            partySize: 1,
            tableId: o.table_id || o.tableId,
            tableName: o.table_name || o.tableName || (o.fulfillment_type === 'takeaway' ? 'Takeaway' : 'Delivery'),
            preOrderedItems: Array.isArray(o.items) ? o.items : (typeof o.pre_ordered_items_json === 'string' ? JSON.parse(o.pre_ordered_items_json || '[]') : o.pre_ordered_items_json || []),
            billTotal: o.grand_total || o.grandTotal,
            status: 'Confirmed',
            orderStatus: o.order_status || o.orderStatus,
            isOrderOnly: true
          }));
          combined = [...combined, ...formattedOrders];
        }

        setUserReservations(combined);
      } else {
        setIsBackendConnected(false);
      }
    } catch (err) {
      console.warn('Backend server offline, using local state:', err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  /**
   * Fetch combined SMARTTABLE + OSM nearby restaurants.
   * Uses a 250m movement threshold to avoid hammering Overpass on tiny GPS drift.
   */
  const _lastOsmCoords = React.useRef(null);
  const haversineM = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // On initial mount, fetch live data from backend
  useEffect(() => {
    fetchLiveBackendData();
  }, [fetchLiveBackendData]);

  // Re-fetch backend data when login status changes
  useEffect(() => {
    if (user && user.isLoggedIn) {
      fetchLiveBackendData();
    } else {
      setUserReservations([]);
    }
  }, [user, fetchLiveBackendData]);

  const fetchNearbyRestaurants = useCallback(async (lat, lng, force = false) => {
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    // Throttle: skip if user hasn't moved more than 250m since last OSM fetch
    if (!force && _lastOsmCoords.current) {
      const moved = haversineM(lat, lng, _lastOsmCoords.current.lat, _lastOsmCoords.current.lng);
      if (moved < 250) return;
    }
    _lastOsmCoords.current = { lat, lng };

    try {
      setIsOsmLoading(true);
      setOsmFetchError(null);
      const result = await apiService.getNearbyRestaurants(lat, lng, 5);
      if (result && result.all) {
        setOsmRestaurants(result.osm || []);
        // Also update SMARTTABLE restaurants from the combined response
        if (result.smarttable && result.smarttable.length > 0) {
          setRestaurants(result.smarttable);
        }
      }
    } catch (err) {
      console.warn('[AppContext] fetchNearbyRestaurants error:', err.message);
      setOsmFetchError('Could not load nearby restaurants from OSM.');
    } finally {
      setIsOsmLoading(false);
    }
  }, []);

  // On initial mount, fetch live data from backend
  useEffect(() => {
    fetchLiveBackendData();
  }, [fetchLiveBackendData]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !selectedRestaurantId) return;

    const joinRoom = () => {
      console.log(`[Socket] Emitting join_restaurant for ${selectedRestaurantId}`);
      socket.emit('join_restaurant', selectedRestaurantId);
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on('connect', joinRoom);

    // Socket Event Listeners
    socket.on('table_status_changed', (data) => {
      console.log('[Socket] Received table_status_changed:', data);
      setRestaurants(prev => prev.map(rest => {
        if (rest.id === data.restaurantId) {
          return {
            ...rest,
            tables: rest.tables.map(table => table.id === data.tableId ? {
              ...table,
              status: data.status,
              minsRemaining: data.minsRemaining,
              occupiedAt: data.occupiedAt,
              expectedAvailableAt: data.expectedAvailableAt,
              cleaningStartedAt: data.cleaningStartedAt
            } : table)
          };
        }
        return rest;
      }));
    });

    socket.on('restaurant_occupancy_updated', (data) => {
      console.log('[Socket] Received restaurant_occupancy_updated:', data);
      setRestaurants(prev => prev.map(rest => {
        if (rest.id === data.restaurantId) {
          return {
            ...rest,
            total_tables: data.metrics.total_tables,
            available_tables: data.metrics.available_tables,
            occupied_tables: data.metrics.occupied_tables,
            reserved_tables: data.metrics.reserved_tables,
            cleaning_tables: data.metrics.cleaning_tables,
            occupancy_percentage: data.metrics.occupancy_percentage,
            estimated_wait_minutes: data.metrics.estimated_wait_minutes,
            queue_count: data.metrics.queue_count
          };
        }
        return rest;
      }));
    });

    socket.on('order_status_changed', (data) => {
      console.log('[Socket] Received order_status_changed:', data);
      setUserReservations(prev => prev.map(res => {
        if (res.id === data.id) {
          return { ...res, orderStatus: data.order_status };
        }
        return res;
      }));
      // Note: We might also want to update separate orders state if we have it
    });

    return () => {
      socket.off('connect', joinRoom);
      socket.emit('leave_restaurant', selectedRestaurantId);
      socket.off('table_status_changed');
      socket.off('restaurant_occupancy_updated');
      socket.off('order_status_changed');
    };
  }, [socket, selectedRestaurantId]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'superadmin' || hash === 'approvals') {
        setViewMode('superadmin');
      } else if (hash.startsWith('admin')) {
        setViewMode('admin');
        const params = new URLSearchParams(hash.split('?')[1]);
        const restId = params.get('restaurant');
        if (restId) {
          setSelectedRestaurantId(restId);
        }
      } else if (hash === 'customer') {
        setViewMode('customer');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Currently active selected restaurant
  const activeRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || (restaurants.length > 0 ? restaurants[0] : null);

  // Open Crowd & Wait Time Radar for specific or active restaurant
  const openCrowdRadar = (restaurant = null) => {
    const target = restaurant || activeRestaurant;
    setCrowdRadarRestaurant(target);
    setSelectedRestaurantId(target.id);
    setCrowdWaitModalOpen(true);
  };

  // Dynamic Algorithmic Wait Time Calculator (Now powered by Backend metrics)
  const getEstimatedWaitTime = (restaurantId, partySize = 2) => {
    const rest = restaurants.find(r => r.id === restaurantId) || activeRestaurant;
    if (!rest) return { waitMins: 0, queueLength: 0, status: 'Loading wait times...', color: 'slate', freeMatchingTables: 0 };

    const waitMins = rest.estimated_wait_minutes !== undefined && rest.estimated_wait_minutes !== null ? Number(rest.estimated_wait_minutes) : 0;
    const queueLength = rest.queue_count || 0;
    const freeMatchingTables = rest.tables ? rest.tables.filter(t => t.status === 'available' && t.capacity >= partySize).length : (rest.available_tables || 0);

    const hasCapacity = rest.tables ? rest.tables.some(t => t.capacity >= partySize) : true;
    if (waitMins === -1 || !hasCapacity) {
      return {
        waitMins: -1,
        queueLength,
        status: 'No Suitable Tables',
        color: 'rose',
        freeMatchingTables: 0
      };
    }

    if (waitMins === 0 && freeMatchingTables > 0) {
      return {
        waitMins: 0,
        queueLength: 0,
        status: '0 min (Instant)',
        color: 'emerald',
        freeMatchingTables
      };
    }

    const actualWait = waitMins > 0 ? waitMins : (freeMatchingTables > 0 ? 0 : 15);
    if (actualWait === 0) {
      return {
        waitMins: 0,
        queueLength: 0,
        status: '0 min (Instant)',
        color: 'emerald',
        freeMatchingTables
      };
    }

    return {
      waitMins: actualWait,
      queueLength,
      status: `~${actualWait} mins`,
      color: actualWait > 20 ? 'rose' : 'amber',
      freeMatchingTables: 0
    };
  };

  // Pre-order items management for table reservations
  const addPreOrderItem = (restaurant, dish, qty = 1) => {
    if (preOrderRestaurantId && preOrderRestaurantId !== restaurant.id) {
      setPreOrderItems([{ ...dish, qty }]);
      setPreOrderRestaurantId(restaurant.id);
      triggerToast('Dish Pre-Order Added 🍽️', `${dish.name} added for ${restaurant.name} table booking.`, 'info');
      return;
    }

    setPreOrderRestaurantId(restaurant.id);
    setPreOrderItems(prev => {
      const existing = prev.find(i => i.id === dish.id);
      if (existing) {
        return prev.map(i => i.id === dish.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...dish, qty }];
    });
    triggerToast('Pre-Order Added 🍽️', `${dish.name} (x${qty}) added to your table reservation menu.`, 'info');
  };

  const updatePreOrderItemQty = (dishId, newQty) => {
    if (newQty <= 0) {
      setPreOrderItems(prev => prev.filter(i => i.id !== dishId));
    } else {
      setPreOrderItems(prev => prev.map(i => i.id === dishId ? { ...i, qty: newQty } : i));
    }
  };

  const clearPreOrderItems = () => {
    setPreOrderItems([]);
    setPreOrderRestaurantId(null);
  };

  // Place a separate delivery/pickup order
  const placeOrder = async (orderData) => {
    const rest = restaurants.find(r => r.id === orderData.restaurantId) || activeRestaurant;
    
    const newOrder = {
      restaurantId: rest.id,
      restaurantName: rest.name,
      guestName: orderData.guestName || user.name || 'Guest',
      guestEmail: orderData.guestEmail || user.email || 'guest@example.com',
      guestPhone: orderData.guestPhone || user.phone || '',
      fulfillmentType: orderData.fulfillmentType || 'delivery',
      deliveryAddress: orderData.deliveryAddress || null,
      items: orderData.items || preOrderItems,
      itemTotal: orderData.itemTotal || preOrderItems.reduce((sum, item) => sum + (item.price * item.qty), 0),
      grandTotal: orderData.grandTotal || preOrderItems.reduce((sum, item) => sum + (item.price * item.qty), 0) + (orderData.deliveryFee || 0),
      status: 'Confirmed',
      orderStatus: 'Pending Acceptance'
    };

    try {
      const created = await apiService.createOrder(newOrder);
      if (created) {
        clearPreOrderItems();
        playOrderAlert('accepted');
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        
        triggerToast(
          'Order Placed! 🛵',
          `Your ${newOrder.fulfillmentType} order from ${rest.name} is now pending acceptance.`,
          'info'
        );
        return created;
      }
    } catch (err) {
      console.error('Failed to place order:', err);
    }
    return null;
  };

  // Make Table Reservation with attached Pre-ordered Food
  const makeReservation = async (bookingData) => {
    const rest = restaurants.find(r => r.id === bookingData.restaurantId) || activeRestaurant;
    
    try {
      const res = await apiService.createReservation({
        restaurantId: rest.id,
        restaurantName: rest.name,
        guestName: bookingData.guestName || user.name || 'Diner Guest',
        guestEmail: bookingData.guestEmail || user.email || 'diner@example.com',
        guestPhone: bookingData.guestPhone || user.phone || '',
        partySize: Number(bookingData.partySize) || 2,
        date: bookingData.date || new Date().toISOString().split('T')[0],
        time: bookingData.time || '19:30',
        specialRequests: bookingData.specialRequests || 'None',
        preOrderedItems: bookingData.preOrderedItems || [],
        tableId: bookingData.tableId || 'Auto-Assigned'
      });

      if (!res || !res.success) {
        return { success: false, error: res?.message || 'No tables are available for the selected time slot.' };
      }

      const backendRes = res.data;

      const newReservation = {
        id: backendRes.id,
        restaurantId: backendRes.restaurantId,
        restaurantName: backendRes.restaurantName,
        guestName: backendRes.guestName,
        guestEmail: backendRes.guestEmail,
        guestPhone: backendRes.guestPhone,
        partySize: backendRes.partySize,
        date: backendRes.date,
        time: backendRes.time,
        tableId: backendRes.tableId,
        tableName: backendRes.tableName,
        specialRequests: backendRes.specialRequests,
        status: backendRes.status,
        orderStatus: backendRes.orderStatus || 'Received',
        qrCode: backendRes.qrCode,
        createdAt: backendRes.createdAt || new Date().toISOString(),
        preOrderedItems: backendRes.preOrderedItems || [],
        billTotal: (backendRes.preOrderedItems || []).reduce((sum, item) => sum + (item.price * item.qty), 0),
        tableShape: backendRes.tableShape || 'rect',
        section: backendRes.section || 'Main Hall'
      };

      setUserReservations(prev => [newReservation, ...prev]);

      if (bookingData.preOrderedItems && bookingData.preOrderedItems.length > 0) {
        try {
          await placeOrder({
            restaurantId: rest.id,
            bookingId: newReservation.id,
            guestName: newReservation.guestName,
            guestEmail: newReservation.guestEmail,
            guestPhone: newReservation.guestPhone,
            fulfillmentType: 'dine-in',
            items: bookingData.preOrderedItems,
            itemTotal: newReservation.billTotal,
            grandTotal: newReservation.billTotal,
          });
        } catch (placeErr) {
          console.error('Failed to create connected dine-in order:', placeErr);
        }
      }

      clearPreOrderItems();
      setBookingModalOpen(false);

      playOrderAlert('accepted');
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      triggerToast(
        'Reservation Confirmed! 🎉',
        `Table booked at ${rest.name} for ${newReservation.date} at ${newReservation.time}. Digital QR Pass ready!`,
        'info'
      );

      return { success: true, data: newReservation };
    } catch (err) {
      console.error('Reservation API Error:', err);
      return { success: false, error: err.message || 'No tables are available for the selected time slot.' };
    }
  };

  // Cancel Reservation
  const cancelReservation = async (reservationId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this table reservation?');
    if (!confirmed) return;

    try {
      const target = userReservations.find(r => r.id === reservationId);
      setUserReservations(prev => prev.map(r => {
        if (r.id === reservationId) {
          return { ...r, status: 'Cancelled', orderStatus: 'Cancelled' };
        }
        return r;
      }));

      if (target?.restaurantId && target?.tableId) {
        updateTableStatus(target.restaurantId, target.tableId, 'available');
      }

      await apiService.cancelReservation(reservationId);
      triggerToast('Reservation Cancelled', `Booking ${reservationId} has been cancelled.`, 'info');
      fetchLiveBackendData();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      triggerToast('Cancellation Error', 'Could not cancel reservation on server.', 'alert');
    }
  };

  // Open Pay Bill Modal
  const openPayBill = (reservation) => {
    setActiveBillReservation(reservation);
    setPayBillModalOpen(true);
  };

  // Settle Bill Payment
  const settleBillPayment = (reservationId, paymentMethod = 'UPI', transactionRef = '') => {
    setUserReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          orderStatus: 'Completed',
          paymentStatus: 'Paid',
          paymentMethod,
          transactionRef: transactionRef || `TXN-${Date.now()}`
        };
      }
      return r;
    }));

    const target = userReservations.find(r => r.id === reservationId);
    if (target?.restaurantId && target?.tableId) {
      updateTableStatus(target.restaurantId, target.tableId, 'available');
    }

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    triggerToast('Payment Successful! 🎉', `Bill for reservation ${reservationId} settled via ${paymentMethod}.`, 'info');
  };

  // Open Quick Pay Modal
  const openQuickPay = (config) => {
    setQuickPayConfig(config);
    setQuickPayModalOpen(true);
  };

  // Update Table Status (available, occupied, reserved, cleaning)
  const updateTableStatus = async (restaurantId, tableId, newStatus, minsRemaining = null, reservationName = null) => {
    const tableKey = `${restaurantId}-${tableId}`;
    if (processingTables.has(tableKey)) {
      return; // Block duplicate clicks
    }

    setProcessingTables(prev => {
      const next = new Set(prev);
      next.add(tableKey);
      return next;
    });

    let originalRestaurants = null;

    setRestaurants(prev => {
      originalRestaurants = prev;
      return prev.map(rest => {
        if (rest.id === restaurantId) {
          const updatedTables = rest.tables.map(table => {
            if (table.id === tableId) {
              return { 
                ...table, 
                status: newStatus,
                minsRemaining: newStatus === 'available' ? null : (minsRemaining !== null ? minsRemaining : table.minsRemaining),
                reservationName: newStatus === 'available' ? null : (reservationName !== null ? reservationName : table.reservationName)
              };
            }
            return table;
          });

          // Optimistic layout-based counts
          const freeTables = updatedTables.filter(t => t.status === 'available').length;
          const occupiedTables = updatedTables.filter(t => t.status === 'occupied').length;
          const totalTables = updatedTables.length;
          const occRatio = totalTables > 0 ? occupiedTables / totalTables : 0;
          const occupancy_percentage = Math.round(occRatio * 100);

          return {
            ...rest,
            tables: updatedTables,
            available_tables: freeTables,
            occupied_tables: occupiedTables,
            occupancy_percentage
          };
        }
        return rest;
      });
    });

    try {
      const res = await apiService.updateTableStatus(restaurantId, tableId, newStatus, minsRemaining, reservationName);
      if (res && res.success) {
        const { updatedTable, metrics } = res.data;
        setRestaurants(prev => prev.map(rest => {
          if (rest.id === restaurantId) {
            return {
              ...rest,
              total_tables: metrics.total_tables,
              available_tables: metrics.available_tables,
              occupied_tables: metrics.occupied_tables,
              reserved_tables: metrics.reserved_tables,
              cleaning_tables: metrics.cleaning_tables,
              occupancy_percentage: metrics.occupancy_percentage,
              estimated_wait_minutes: metrics.estimated_wait_minutes,
              queue_count: metrics.queue_count,
              tables: rest.tables.map(t => t.id === updatedTable.id ? {
                ...t,
                status: updatedTable.status,
                minsRemaining: updatedTable.minsRemaining,
                reservationName: updatedTable.reservationName,
                occupiedAt: updatedTable.occupiedAt,
                expectedAvailableAt: updatedTable.expectedAvailableAt,
                cleaningStartedAt: updatedTable.cleaningStartedAt
              } : t)
            };
          }
          return rest;
        }));
        triggerToast('Table Status Updated', `Table ${tableId} is now ${newStatus.toUpperCase()}.`, 'info');
      } else {
        throw new Error(res?.message || 'Failed to update table status.');
      }
    } catch (err) {
      console.error('[Seating Ops] Update status error:', err.message);
      if (originalRestaurants) {
        setRestaurants(originalRestaurants);
      }
      triggerToast('Status Update Failed', err.message || 'Seating server transaction failed.', 'alert');
    } finally {
      setProcessingTables(prev => {
        const next = new Set(prev);
        next.delete(tableKey);
        return next;
      });
    }
  };

  // Update Restaurant Crowd Level
  const updateRestaurantCrowdLevel = (restaurantId, newCrowdLevel) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id === restaurantId) {
        const waitEstimate = newCrowdLevel === 'high' ? '25-40 min' : newCrowdLevel === 'medium' ? '10-20 min' : '0 min (Instant Seating)';
        return {
          ...rest,
          crowdLevel: newCrowdLevel,
          waitEstimate
        };
      }
      return rest;
    }));
    triggerToast('Crowd Level Updated', `Restaurant status updated to ${newCrowdLevel.toUpperCase()}.`, 'info');
  };

  // Update Reservation Order Status
  const updateReservationOrderStatus = async (reservationId, newStatus) => {
    setUserReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        return {
          ...res,
          orderStatus: newStatus
        };
      }
      return res;
    }));

    if (newStatus === 'Accepted') {
      playOrderAlert('accepted');
    } else if (newStatus === 'Seated & Served' || newStatus === 'Completed') {
      playOrderAlert('served');
    }

    try {
      if (String(reservationId).startsWith('ORD-')) {
        await apiService.updateOrder(reservationId, newStatus);
      } else {
        await apiService.updateReservationOrderStatus(reservationId, newStatus);
      }
    } catch (e) {}

    triggerToast('Order Status Updated', `Reservation/Order ${reservationId} is now ${newStatus}.`, 'info');
  };

  // Authentication Login via Backend API
  const loginUser = async (role, credentials = {}) => {
    const rawIdentifier = (credentials.email || credentials.username || credentials.adminId || '').trim();
    const rawPassword = (credentials.password || '').trim();

    if (!rawIdentifier) {
      return { success: false, error: 'Please enter your username or email address.' };
    }
    if (!rawPassword) {
      return { success: false, error: 'Please enter your account password.' };
    }

    try {
      const res = await apiService.login({
        email: rawIdentifier,
        username: rawIdentifier,
        password: rawPassword,
        role
      });

      if (!res || !res.success) {
        return { success: false, error: res?.message || 'Login failed. Please check backend connection.' };
      }

      const { token, data } = res;
      if (token) {
        localStorage.setItem('smarttable_token', token);
        window.dispatchEvent(new CustomEvent('auth-changed'));
      }

      const authUser = {
        id: data.id || `USR-DEMO-${Date.now().toString().slice(-4)}`,
        name: data.name || 'Verified Diner',
        email: data.email,
        username: data.email.split('@')[0],
        phone: data.phone || '+91 98400 12345',
        role: data.role || 'customer',
        badge: data.role === 'customer' ? 'VIP Foodie Member' : (data.role === 'owner' ? 'Restaurant Partner / Owner' : 'Super Admin'),
        avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        loyaltyPoints: data.role === 'customer' ? 350 : 0,
        isLoggedIn: true
      };

      if (data.role === 'owner') {
        authUser.restaurantId = data.restaurantId || selectedRestaurantId || (restaurants.length > 0 ? restaurants[0].id : 'on-de-roof-chennai');
        const rest = restaurants.find(r => r.id === authUser.restaurantId) || (restaurants.length > 0 ? restaurants[0] : null);
        authUser.restaurantName = rest ? rest.name : 'Partner Restaurant';
      }

      setUser(authUser);
      try {
        localStorage.setItem('smarttable_user', JSON.stringify(authUser));
      } catch (e) {}

      if (authUser.role === 'customer') {
        setViewMode('customer');
      } else if (authUser.role === 'owner') {
        setViewMode('admin');
        if (authUser.restaurantId) {
          setSelectedRestaurantId(authUser.restaurantId);
        }
      } else if (authUser.role === 'admin') {
        setViewMode('superadmin');
      }

      playOrderAlert('accepted');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      triggerToast(
        `Welcome, ${authUser.name}! 👋`,
        `Signed in successfully to the ${authUser.role === 'admin' ? 'Platform Super Admin' : authUser.role === 'owner' ? 'Restaurant Owner' : 'Diner'} Portal.`,
        'info'
      );

      return { success: true, user: authUser };
    } catch (err) {
      console.error('[Login] Backend Login error:', err);
      return { success: false, error: err.message || 'Server error. Please try again later.' };
    }
  };

  // Social Single Sign-On with Google / Apple ID
  const loginWithOAuth = (provider = 'google', customProfile = {}, targetRole = 'customer') => {
    const isGoogle = provider.toLowerCase() === 'google';
    const isApple = provider.toLowerCase() === 'apple';
    const providerName = isGoogle ? 'Google' : isApple ? 'Apple ID' : provider;

    let defaultName = isGoogle ? 'Alex Rivera (Google)' : 'Alex Rivera (Apple)';
    let defaultEmail = isGoogle ? 'alex.rivera@gmail.com' : 'alex.rivera@icloud.com';
    let defaultAvatar = isGoogle 
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';

    const finalRole = targetRole || 'customer';
    const authUser = {
      id: `USR-${provider.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      name: customProfile.name || defaultName,
      email: customProfile.email || defaultEmail,
      username: (customProfile.email || defaultEmail).split('@')[0],
      phone: customProfile.phone || '+91 98400 12345',
      role: finalRole,
      badge: `${providerName} Verified ${finalRole === 'admin' ? 'Super Admin' : finalRole === 'owner' ? 'Partner Owner' : 'Diner'}`,
      avatar: customProfile.avatar || defaultAvatar,
      loyaltyPoints: finalRole === 'customer' ? 350 : 0,
      authProvider: provider.toLowerCase(),
      isLoggedIn: true
    };

    if (finalRole === 'owner') {
      authUser.restaurantId = customProfile.restaurantId || selectedRestaurantId || (restaurants.length > 0 ? restaurants[0].id : 'on-de-roof-chennai');
      const rest = restaurants.find(r => r.id === authUser.restaurantId) || (restaurants.length > 0 ? restaurants[0] : null);
      authUser.restaurantName = rest ? rest.name : 'Partner Restaurant';
    }

    setUser(authUser);
    try {
      localStorage.setItem('smarttable_user', JSON.stringify(authUser));
    } catch (e) {}

    if (finalRole === 'customer') {
      setViewMode('customer');
    } else if (finalRole === 'owner') {
      setViewMode('admin');
      if (authUser.restaurantId) {
        setSelectedRestaurantId(authUser.restaurantId);
      }
    } else if (finalRole === 'admin') {
      setViewMode('superadmin');
    }

    playOrderAlert('accepted');
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    triggerToast(
      `Welcome, ${authUser.name}! 🚀`,
      `Successfully signed in with ${providerName}.`,
      'info'
    );

    return { success: true, user: authUser };
  };

  // -------------------------------------------------------------
  // Global OAuth Redirect-Result Listener (Google & Apple ID)
  // Runs once on mount to pick up the user returning from an
  // OAuth provider redirect. Safe in dev mode (returns null).
  // -------------------------------------------------------------
  useEffect(() => {
    const handleRedirectOAuth = async () => {
      console.log('[OAuth] Checking for redirect result on app mount...');
      try {
        const result = await checkOAuthRedirectResult();

        if (!result) {
          console.log('[OAuth] No redirect result found — normal page load.');
          return;
        }

        console.log('[OAuth] Redirect result received:', {
          success: result.success,
          provider: result.provider,
          role: result.role,
          hasProfile: !!result.userProfile
        });

        if (result.success && result.userProfile) {
          const targetRole = result.role || 'customer';
          console.log(`[OAuth] Logging in as ${result.provider} / role: ${targetRole}`);
          loginWithOAuth(result.provider, result.userProfile, targetRole);
          console.log('[OAuth] loginWithOAuth complete.');
        } else {
          console.warn('[OAuth] Result received but success=false or userProfile missing:', result);
        }
      } catch (err) {
        // Log full error — this is the critical line that was silently crashing
        console.error('[OAuth] Redirect result handler threw an error:', err);
        try {
          triggerToast(
            'Sign-In Error',
            err?.message || 'Could not complete social sign-in. Please try again.',
            'alert'
          );
        } catch (toastErr) {
          console.error('[OAuth] triggerToast also failed:', toastErr);
        }
      }
    };

    handleRedirectOAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logout User
  const logoutUser = () => {
    const prevName = user.name;
    setUser({
      name: '',
      email: '',
      phone: '',
      role: null,
      isLoggedIn: false
    });
    setViewMode('customer');
    try {
      localStorage.removeItem('smarttable_user');
      localStorage.removeItem('smarttable_token');
      window.dispatchEvent(new CustomEvent('auth-changed'));
    } catch (e) {}

    triggerToast('Logged Out', `Session ended for ${prevName || 'user'}. Returned to login screen.`, 'info');
  };

  // ── Phase 6 Admin Data Loaders (MySQL-backed) ─────────────────────────────

  const loadAdminUsers = async () => {
    try {
      setAdminLoading(true);
      const res = await apiService.admin.getUsers();
      if (res?.success) setRegisteredUsers(res.data);
    } catch (e) {
      console.error('[AppContext] loadAdminUsers error:', e.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const loadAdminOwners = async () => {
    try {
      setAdminLoading(true);
      const res = await apiService.admin.getOwners();
      if (res?.success) setRestaurantOwners(res.data);
    } catch (e) {
      console.error('[AppContext] loadAdminOwners error:', e.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const loadAdminRestaurants = async () => {
    try {
      const res = await apiService.admin.getRestaurants();
      if (res?.success) setAdminRestaurants(res.data);
    } catch (e) {
      console.error('[AppContext] loadAdminRestaurants error:', e.message);
    }
  };

  // User Management (Admin Dashboard) — Phase 6: calls MySQL API
  const toggleUserStatus = async (userId) => {
    const target = registeredUsers.find(u => u.id === userId);
    if (!target) return;
    const nextStatus = (target.status === 'active') ? 'suspended' : 'active';
    try {
      const res = await apiService.admin.updateUserStatus(userId, nextStatus);
      if (res?.success) {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
        triggerToast(
          `User ${target.name} ${nextStatus === 'active' ? 'Activated' : 'Suspended'}`,
          `Account status updated to ${nextStatus}.`,
          nextStatus === 'active' ? 'info' : 'alert'
        );
      } else {
        triggerToast('Action Failed', res?.message || 'Could not update user status.', 'alert');
      }
    } catch (e) {
      triggerToast('Error', e.message || 'Server error updating user status.', 'alert');
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await apiService.admin.deleteUser(userId);
      if (res?.success) {
        setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
        triggerToast('User Deleted', `User account ${userId} permanently removed.`, 'info');
      } else {
        triggerToast('Action Failed', res?.message || 'Could not delete user.', 'alert');
      }
    } catch (e) {
      triggerToast('Error', e.message || 'Server error deleting user.', 'alert');
    }
  };

  // addUser: kept for backward-compat UI forms but now calls the real register API
  const addUser = async (userData) => {
    try {
      const res = await apiService.register({
        name:     userData.name,
        email:    userData.email,
        phone:    userData.phone,
        password: userData.password || 'Password@123',
        role:     userData.role || 'customer'
      });
      if (res?.success) {
        await loadAdminUsers();
        triggerToast('Account Created', `Account for ${userData.name} registered.`, 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Registration failed.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };


  // Full User / Owner Registration (Registers and Logs in in one shot)
  const registerUser = async (userData, targetRole = 'customer') => {
    const finalRole = targetRole || userData.role || 'customer';
    try {
      const res = await apiService.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: finalRole,
        restaurantName: userData.restaurantName,
        restaurantId: userData.restaurantId
      });

      if (!res || !res.success) {
        return { success: false, error: res?.message || 'Registration failed.' };
      }

      if (res.requireOtp) {
        return { success: true, requireOtp: true, email: userData.email, role: finalRole };
      }

      const { token, data } = res;
      if (token) {
        localStorage.setItem('smarttable_token', token);
      }

      const authUser = {
        id: data.id || `USR-${Date.now()}`,
        name: data.name,
        email: data.email,
        username: data.email.split('@')[0],
        phone: data.phone || userData.phone || '+91 98400 12345',
        role: finalRole,
        badge: finalRole === 'owner' ? 'Verified Restaurant Partner' : 'VIP Foodie Member',
        avatar: finalRole === 'owner' ? DEV_DEMO_ACCOUNTS.owner.avatar : DEV_DEMO_ACCOUNTS.user.avatar,
        loyaltyPoints: finalRole === 'customer' ? 100 : 0,
        restaurantId: data.restaurantId || null,
        restaurantName: data.restaurantName || null,
        isLoggedIn: true
      };

      setUser(authUser);
      try {
        localStorage.setItem('smarttable_user', JSON.stringify(authUser));
      } catch (e) {}

      if (finalRole === 'owner') {
        setViewMode('admin');
        if (authUser.restaurantId) {
          setSelectedRestaurantId(authUser.restaurantId);
        }
        window.location.hash = 'admin';
      } else {
        setViewMode('customer');
        window.location.hash = 'customer';
      }

      playOrderAlert('accepted');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      triggerToast(
        `Welcome to SmartTable, ${authUser.name}! 🎉`,
        `Your ${finalRole === 'owner' ? 'Restaurant Owner Console' : 'Diner Account'} is ready.`,
        'info'
      );

      return { success: true, user: authUser };
    } catch (err) {
      console.error('[Register] Registration error:', err);
      return { success: false, error: err.message || 'Server error during registration.' };
    }
  };

  // Verify OTP for User Registration
  const verifyOtpUser = async (email, otp, targetRole = 'customer') => {
    try {
      const res = await apiService.verifyOTP(email, otp);
      if (!res || !res.success) {
        return { success: false, error: res?.message || 'Verification failed.' };
      }

      const { token, data } = res;
      if (token) {
        localStorage.setItem('smarttable_token', token);
      }

      const authUser = {
        id: data.id || `USR-${Date.now()}`,
        name: data.name,
        email: data.email,
        username: data.email.split('@')[0],
        phone: data.phone || '+91 98400 12345',
        role: data.role || targetRole,
        badge: data.role === 'owner' ? 'Verified Restaurant Partner' : 'VIP Foodie Member',
        avatar: data.role === 'owner' ? DEV_DEMO_ACCOUNTS.owner.avatar : DEV_DEMO_ACCOUNTS.user.avatar,
        loyaltyPoints: data.role === 'customer' ? 100 : 0,
        restaurantId: data.restaurantId || null,
        restaurantName: data.restaurantName || null,
        isLoggedIn: true
      };

      setUser(authUser);
      try {
        localStorage.setItem('smarttable_user', JSON.stringify(authUser));
      } catch (e) {}

      if (authUser.role === 'owner') {
        setViewMode('admin');
        if (authUser.restaurantId) {
          setSelectedRestaurantId(authUser.restaurantId);
        }
        window.location.hash = 'admin';
      } else {
        setViewMode('customer');
        window.location.hash = 'customer';
      }

      playOrderAlert('accepted');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      triggerToast(
        `Welcome to SmartTable, ${authUser.name}! 🎉`,
        `Your ${authUser.role === 'owner' ? 'Restaurant Owner Console' : 'Diner Account'} is ready.`,
        'info'
      );

      return { success: true, user: authUser };
    } catch (err) {
      console.error('[VerifyOTP] Error:', err);
      return { success: false, error: err.message || 'Server error during verification.' };
    }
  };

  // Owner Management (Admin Dashboard) — Phase 6: calls MySQL API
  const toggleOwnerStatus = async (ownerId) => {
    const target = restaurantOwners.find(o => o.id === ownerId);
    if (!target) return;
    const nextStatus = (target.status === 'active') ? 'suspended' : 'active';
    try {
      const res = await apiService.admin.updateOwnerStatus(ownerId, nextStatus);
      if (res?.success) {
        setRestaurantOwners(prev => prev.map(o => o.id === ownerId ? { ...o, status: nextStatus } : o));
        triggerToast(
          `Owner ${target.name} ${nextStatus === 'active' ? 'Activated' : 'Suspended'}`,
          `Partner status updated to ${nextStatus}.`,
          nextStatus === 'active' ? 'info' : 'alert'
        );
      } else {
        triggerToast('Action Failed', res?.message || 'Could not update owner status.', 'alert');
      }
    } catch (e) {
      triggerToast('Error', e.message || 'Server error updating owner status.', 'alert');
    }
  };

  const deleteOwner = async (ownerId) => {
    try {
      const res = await apiService.admin.deleteUser(ownerId);
      if (res?.success) {
        setRestaurantOwners(prev => prev.filter(o => o.id !== ownerId));
        triggerToast('Owner Removed', `Owner account ${ownerId} removed.`, 'info');
      } else {
        triggerToast('Action Failed', res?.message || 'Could not remove owner.', 'alert');
      }
    } catch (e) {
      triggerToast('Error', e.message || 'Server error removing owner.', 'alert');
    }
  };

  // addOwner: calls register API with role=owner
  const addOwner = async (ownerData) => {
    try {
      const res = await apiService.register({
        name:         ownerData.name,
        email:        ownerData.email,
        phone:        ownerData.phone,
        password:     ownerData.password || 'Password@123',
        role:         'owner',
        restaurantId: ownerData.restaurantId || null,
        restaurantName: ownerData.restaurantName || null
      });
      if (res?.success) {
        await loadAdminOwners();
        triggerToast('Owner Added', `Partner account for ${ownerData.name} registered.`, 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Registration failed.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Disputes Management (Admin Dashboard)
  const resolveDispute = (disputeId, action = 'resolved', notes = '') => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: action,
          resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resolutionNotes: notes || `Dispute ${action} by Platform Administrator.`
        };
      }
      return d;
    }));

    if (action === 'refunded') {
      playOrderAlert('served');
      triggerToast('Refund Processed 💳', `Refund issued via original gateway for dispute ${disputeId}.`, 'info');
    } else {
      triggerToast('Dispute Updated', `Case ${disputeId} marked as ${action.toUpperCase()}.`, 'info');
    }
  };

  // Restaurant Owner: Accept or Decline Reservation / Order Request
  const acceptReservation = (reservationId) => {
    updateReservationOrderStatus(reservationId, 'Accepted');
  };

  const declineReservation = (reservationId, reason = 'Table capacity full at requested slot') => {
    setUserReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          status: 'Declined',
          orderStatus: 'Declined',
          declineReason: reason
        };
      }
      return r;
    }));

    const target = userReservations.find(r => r.id === reservationId);
    if (target?.restaurantId && target?.tableId) {
      updateTableStatus(target.restaurantId, target.tableId, 'available');
    }

    triggerToast('Reservation Declined', `Request ${reservationId} has been declined (${reason}).`, 'alert');
  };

  // Restaurant Owner: Table Bill Manager
  const updateTableBill = (restaurantId, tableId, items = [], discountPercent = 0, serviceCharge = 0) => {
    setUserReservations(prev => prev.map(res => {
      if (res.restaurantId === restaurantId && res.tableId === tableId && res.orderStatus !== 'Completed') {
        const itemTotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty || 1)), 0);
        const discountAmt = Math.round(itemTotal * (discountPercent / 100));
        const taxable = itemTotal - discountAmt;
        const gst = Math.round(taxable * 0.05);
        const grandTotal = taxable + gst + Number(serviceCharge || 0);

        return {
          ...res,
          preOrderedItems: items,
          discountPercent,
          discountAmount: discountAmt,
          serviceCharge,
          gstAmount: gst,
          billTotal: grandTotal
        };
      }
      return res;
    }));

    triggerToast('Table Bill Updated 🧾', `Bill for Table ${tableId} recalculated with updated items and taxes.`, 'info');
  };

  // AI Walk-in Prediction Engine
  const calculateAiPrediction = ({ restaurantId, partySize, targetTime, weather }) => {
    const rest = restaurants.find(r => r.id === restaurantId) || activeRestaurant;
    const baseWait = rest.crowdLevel === 'high' ? 35 : rest.crowdLevel === 'medium' ? 15 : 5;
    const hour = parseInt(targetTime?.split(':')[0] || '19', 10);
    const isPeakHour = (hour >= 13 && hour <= 15) || (hour >= 19 && hour <= 22);

    let waitScore = baseWait;
    if (isPeakHour) waitScore += 15;
    if (partySize > 4) waitScore += 10;
    if (weather === 'Rainy') waitScore += 5;

    const confidence = Math.min(96, Math.max(78, 92 - Math.floor(Math.random() * 10)));
    const recommendedArrival = isPeakHour ? `${hour - 1}:15 PM` : `${hour}:00 PM`;

    return {
      estimatedWaitMinutes: waitScore,
      crowdForecast: waitScore > 25 ? 'High / Peak Rush' : waitScore > 10 ? 'Moderate Activity' : 'Low / Walk-in Friendly',
      confidencePercentage: confidence,
      bestTimeToVisit: recommendedArrival,
      availableTablesEstimate: Math.max(0, rest.tables.filter(t => t.status === 'available').length)
    };
  };

  // Submit New Restaurant Partner Registration Application
  const submitRestaurantRegistration = (formData) => {
    const newId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const proposedTables = [
      { id: `${newId.slice(-3)}1`, name: 'Table 1', capacity: 2, section: formData.sections?.[0] || 'Main Hall', status: 'available', shape: 'round' },
      { id: `${newId.slice(-3)}2`, name: 'Table 2', capacity: 4, section: formData.sections?.[0] || 'Main Hall', status: 'available', shape: 'rect' },
      { id: `${newId.slice(-3)}3`, name: 'Booth 1', capacity: 6, section: formData.sections?.[1] || 'Family Lounge', status: 'available', shape: 'booth' },
      { id: `${newId.slice(-3)}4`, name: 'Table 4', capacity: 4, section: formData.sections?.[0] || 'Main Hall', status: 'available', shape: 'rect' }
    ];

    const newApp = {
      id: newId,
      name: formData.name,
      tagline: formData.tagline,
      cuisine: formData.cuisine,
      cuisineTag: formData.cuisineTag || 'general',
      isPureVeg: formData.isPureVeg,
      cuisineHighlights: formData.cuisineHighlights || [formData.cuisine],
      priceRange: formData.priceRange || '₹₹',
      priceLevel: formData.priceRange === '₹₹₹₹' ? 4 : formData.priceRange === '₹₹₹' ? 3 : 2,
      location: formData.location,
      city: formData.city || 'Chennai',
      zone: formData.zone || 'Central',
      lat: formData.lat || 13.0400,
      lng: formData.lng || 80.2400,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      fssaiLicense: formData.fssaiLicense,
      gstin: formData.gstin,
      settlementUpiId: formData.settlementUpiId || 'sundhar8074@axl',
      sections: formData.sections || ['Main Hall', 'AC Family Section'],
      openingHours: formData.openingHours || '11:00 AM - 11:00 PM',
      coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      submittedAt: 'Just now',
      status: 'pending',
      complianceScore: 92,
      proposedMenuSample: [
        { name: `${formData.name} Chef Specialty`, price: 420, desc: 'Specialty culinary preparation crafted fresh.', tags: ['chef'] },
        { name: 'Specialty Biryani / Sizzler Bowl', price: 380, desc: 'Traditional recipe made fresh to order.', tags: ['chef'] }
      ],
      proposedTables
    };

    setRestaurantApplications(prev => [newApp, ...prev]);

    triggerToast(
      'Application Submitted! 📋✨',
      `Registration for ${formData.name} is now in the Super Admin verification queue.`,
      'info'
    );

    return newApp;
  };

  // Super Admin: Approve Restaurant Registration & Launch Instantly
  const approveRestaurantRegistration = (applicationId) => {
    const app = restaurantApplications.find(a => a.id === applicationId);
    if (!app) return;

    const cleanName = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanZone = (app.zone || 'chennai').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const restSlug = `${cleanName}-${cleanZone}`;

    const initialTables = (app.proposedTables && app.proposedTables.length > 0)
      ? app.proposedTables.map(t => ({ ...t, status: 'available' }))
      : [
          { id: `${restSlug.slice(0, 3).toUpperCase()}1`, name: 'Table 1', capacity: 2, section: app.sections?.[0] || 'Main Hall', status: 'available', shape: 'round' },
          { id: `${restSlug.slice(0, 3).toUpperCase()}2`, name: 'Table 2', capacity: 4, section: app.sections?.[0] || 'Main Hall', status: 'available', shape: 'rect' },
          { id: `${restSlug.slice(0, 3).toUpperCase()}3`, name: 'Booth 1', capacity: 6, section: app.sections?.[1] || 'Family Lounge', status: 'available', shape: 'booth' },
          { id: `${restSlug.slice(0, 3).toUpperCase()}4`, name: 'Table 4', capacity: 4, section: app.sections?.[0] || 'Main Hall', status: 'available', shape: 'rect' }
        ];

    const menuGrouped = [
      {
        category: `${app.cuisine} Specialties`,
        items: (app.proposedMenuSample && app.proposedMenuSample.length > 0)
          ? app.proposedMenuSample.map((m, idx) => ({
              id: `${restSlug.slice(0, 3)}${idx + 1}`,
              name: m.name,
              price: m.price,
              desc: m.desc || `Freshly prepared chef signature dish from ${app.name}.`,
              tags: m.tags || (app.isPureVeg ? ['v', 'chef'] : ['chef'])
            }))
          : [
              { id: `${restSlug.slice(0, 3)}1`, name: `${app.name} Chef's Signature Dish`, price: 450, desc: 'Specialty culinary preparation.', tags: ['chef'] },
              { id: `${restSlug.slice(0, 3)}2`, name: 'House Special Biryani / Thali', price: 380, desc: 'Aromatic traditional preparation.', tags: ['chef'] }
            ]
      }
    ];

    const newRestaurant = {
      id: restSlug,
      name: app.name,
      tagline: app.tagline || 'Exquisite dining with live table availability',
      cuisine: app.cuisine,
      cuisineTag: app.cuisineTag || 'general',
      isPureVeg: Boolean(app.isPureVeg),
      cuisineHighlights: app.cuisineHighlights || [app.cuisine],
      priceRange: app.priceRange || '₹₹',
      priceLevel: app.priceLevel || 2,
      rating: 4.8,
      reviewsCount: 1,
      location: app.location,
      city: app.city || 'Unknown',
      zone: app.zone || 'Central',
      distanceKm: null,
      lat: app.lat || null,
      lng: app.lng || null,
      phoneNumber: app.ownerPhone || '+91 98400 11223',
      ownerName: app.ownerName,
      ownerEmail: app.ownerEmail,
      fssaiLicense: app.fssaiLicense,
      settlementUpiId: app.settlementUpiId || 'sundhar8074@axl',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.name + ' ' + app.location)}&utm_campaign=gmp_git_agentskills_v1`,
      image: app.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      crowdLevel: 'low',
      waitEstimate: '0 min (Instant Seating)',
      partiesInQueue: 0,
      openingHours: app.openingHours || '11:00 AM - 11:00 PM',
      aiWalkInProbability: 88,
      sections: app.sections || ['Main Dining Hall', 'Family Lounge'],
      menu: menuGrouped,
      tables: initialTables,
      hourlyCrowdForecast: [
        { time: '1 PM', level: 35 }, { time: '3 PM', level: 20 }, { time: '7 PM', level: 60 },
        { time: '9 PM', level: 80 }, { time: '11 PM', level: 40 }
      ]
    };

    setRestaurants(prev => [newRestaurant, ...prev]);

    setRestaurantApplications(prev => prev.map(a => a.id === applicationId ? {
      ...a,
      status: 'approved',
      approvedAt: 'Just now',
      approvedRestaurantId: restSlug
    } : a));

    setSelectedRestaurantId(restSlug);

    playOrderAlert('served');
    try {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    } catch (e) {}

    triggerToast(
      'Restaurant Approved & Launched! 🚀🎉',
      `${app.name} is now LIVE on SmartTable! Diners can immediately book tables & view live radar!`,
      'info'
    );
  };

  // Super Admin: Reject Restaurant Application
  const rejectRestaurantRegistration = (applicationId, reason = 'Incomplete or unverified documentation') => {
    setRestaurantApplications(prev => prev.map(a => a.id === applicationId ? {
      ...a,
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: 'Just now'
    } : a));

    triggerToast(
      'Application Status Updated',
      `Application ${applicationId} has been marked as Rejected / Re-submission required.`,
      'info'
    );
  };

  const value = {
    // Auth
    loginUser,
    loginWithOAuth,
    logoutUser,
    authDefaultRole,
    setAuthDefaultRole,
    viewMode,
    setViewMode,
    restaurants,
    setRestaurants,
    selectedRestaurantId,
    setSelectedRestaurantId,
    activeRestaurant,
    user,
    setUser,
    toast,
    triggerToast,
    isLoadingData,
    isBackendConnected,
    fetchLiveBackendData,
    osmRestaurants,
    isOsmLoading,
    osmFetchError,
    fetchNearbyRestaurants,

    // Platform User & Owner Administration
    registeredUsers,
    setRegisteredUsers,
    toggleUserStatus,
    deleteUser,
    addUser,
    registerUser,
    verifyOtpUser,
    restaurantOwners,
    setRestaurantOwners,
    toggleOwnerStatus,
    deleteOwner,
    addOwner,
    disputes,
    setDisputes,
    resolveDispute,

    // Phase 6: MySQL-backed admin data loaders
    adminLoading,
    adminRestaurants,
    loadAdminUsers,
    loadAdminOwners,
    loadAdminRestaurants,
    
    // Partner Restaurant Applications & Approvals
    restaurantApplications,
    setRestaurantApplications,
    registerRestaurantModalOpen,
    setRegisterRestaurantModalOpen,
    submitRestaurantRegistration,
    approveRestaurantRegistration,
    rejectRestaurantRegistration,

    // Modals
    authModalOpen,
    setAuthModalOpen,
    aiPredictorOpen,
    setAiPredictorOpen,
    bookingModalOpen,
    setBookingModalOpen,
    myBookingsOpen,
    setMyBookingsOpen,
    menuModalOpen,
    setMenuModalOpen,
    crowdWaitModalOpen,
    setCrowdWaitModalOpen,
    crowdRadarRestaurant,
    openCrowdRadar,
    payBillModalOpen,
    setPayBillModalOpen,
    activeBillReservation,
    openPayBill,
    settleBillPayment,
    quickPayModalOpen,
    setQuickPayModalOpen,
    quickPayConfig,
    openQuickPay,

    // Search & Filters
    searchQuery,
    setSearchQuery,
    partySizeFilter,
    setPartySizeFilter,
    crowdFilter,
    setCrowdFilter,
    cuisineFilter,
    setCuisineFilter,

    // Reservations & Table Pre-Orders
    userReservations,
    setUserReservations,
    preOrderItems,
    preOrderRestaurantId,
    addPreOrderItem,
    updatePreOrderItemQty,
    clearPreOrderItems,
    placeOrder,
    makeReservation,
    cancelReservation,
    acceptReservation,
    declineReservation,
    updateTableBill,

    // Operations & Wait Times
    getEstimatedWaitTime,
    updateTableStatus,
    updateRestaurantCrowdLevel,
    updateReservationOrderStatus,
    calculateAiPrediction,
    processingTables
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
