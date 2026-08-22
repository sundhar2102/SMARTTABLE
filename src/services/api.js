// API Client Service for SmartTable AI Backend (REST API on port 5000)

const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT_MS = 15000;

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout: The server took longer than ${timeoutMs / 1000}s to respond.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('smarttable_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // 1. Health check
  checkHealth: async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 5000);
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend server offline or unreachable:', err.message);
      return null;
    }
  },

  // 2. Restaurants
  getRestaurants: async (lat = null, lng = null) => {
    try {
      let url = `${API_BASE_URL}/restaurants`;
      if (lat !== null && lng !== null) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      const res = await fetchWithTimeout(url);
      const json = await handleResponse(res);
      return json?.data || [];
    } catch (err) {
      console.warn('apiService.getRestaurants fallback to local data:', err.message);
      return null;
    }
  },

  getRestaurantById: async (id) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/restaurants/${id}`);
      const json = await handleResponse(res);
      return json?.data || null;
    } catch (err) {
      console.warn(`apiService.getRestaurantById(${id}) error:`, err.message);
      return null;
    }
  },

  // Fetch combined SMARTTABLE + OSM nearby restaurants
  getNearbyRestaurants: async (lat, lng, radiusKm = 5) => {
    try {
      if (lat === null || lat === undefined || lng === null || lng === undefined) {
        return { all: [], smarttable: [], osm: [], message: 'Location required.' };
      }
      const url = `${API_BASE_URL}/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
      const res = await fetchWithTimeout(url);
      const json = await handleResponse(res);
      const all = json?.data || [];
      return {
        all,
        smarttable: all.filter(r => r.isSmartTablePartner),
        osm: all.filter(r => !r.isSmartTablePartner),
        smarttableCount: json?.smarttableCount || 0,
        osmCount: json?.osmCount || 0,
        message: json?.message || null
      };
    } catch (err) {
      console.warn('apiService.getNearbyRestaurants error:', err.message);
      return { all: [], smarttable: [], osm: [], message: 'Failed to load nearby restaurants.' };
    }
  },

  // 3. Table live status update (Floor Seating Radar)
  updateTableStatus: async (restaurantId, tableId, status, minsRemaining = null, reservationName = null) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tables/${restaurantId}/${tableId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, minsRemaining, reservationName })
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('apiService.updateTableStatus error:', err.message);
      throw err;
    }
  },

  // 4. Restaurant Live Crowd Level Update
  updateRestaurantCrowdLevel: async (restaurantId, crowdLevel) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/restaurants/${restaurantId}/crowd-level`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ crowdLevel })
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('apiService.updateRestaurantCrowdLevel error:', err.message);
      return null;
    }
  },

  // 5. Reservations & Food Pre-Orders
  getReservations: async (email = null, restaurantId = null) => {
    try {
      let url = `${API_BASE_URL}/reservations`;
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetchWithTimeout(url, {
        headers: getAuthHeaders()
      });
      const json = await handleResponse(res);
      return json?.data || [];
    } catch (err) {
      console.warn('apiService.getReservations fallback to local data:', err.message);
      return null;
    }
  },

  createReservation: async (reservationData) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reservationData)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('apiService.createReservation error:', err.message);
      throw err;
    }
  },

  updateReservationOrderStatus: async (id, orderStatus) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/reservations/${id}/order-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderStatus })
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn(`apiService.updateReservationOrderStatus(${id}) error:`, err.message);
      return null;
    }
  },

  updateReservationStatus: async (id, status, reason = null) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason })
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn(`apiService.updateReservationStatus(${id}) error:`, err.message);
      return null;
    }
  },

  cancelReservation: async (id) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn(`apiService.cancelReservation(${id}) error:`, err.message);
      return null;
    }
  },

  // 6. Orders
  getAllOrders: async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
        headers: getAuthHeaders()
      });
      const json = await handleResponse(res);
      return json?.data || [];
    } catch (err) {
      console.warn('apiService.getAllOrders error:', err.message);
      return [];
    }
  },

  getOrdersByCustomer: async (email) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders/customer?email=${encodeURIComponent(email)}`, {
        headers: getAuthHeaders()
      });
      const json = await handleResponse(res);
      return json?.data || [];
    } catch (err) {
      console.warn('apiService.getOrdersByCustomer error:', err.message);
      return [];
    }
  },

  getOrdersByRestaurant: async (restaurantId) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders/restaurant/${restaurantId}`, {
        headers: getAuthHeaders()
      });
      const json = await handleResponse(res);
      return json?.data || [];
    } catch (err) {
      console.warn('apiService.getOrdersByRestaurant error:', err.message);
      return [];
    }
  },

  createOrder: async (orderData) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      const json = await handleResponse(res);
      return json?.data || null;
    } catch (err) {
      console.warn('apiService.createOrder error:', err.message);
      return null;
    }
  },

  updateOrder: async (id, orderStatus) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderStatus })
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn(`apiService.updateOrder(${id}) error:`, err.message);
      return null;
    }
  },

  // 7. AI Predictor
  predictWalkIn: async (predictionData) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ai/predict`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(predictionData)
      });
      const json = await handleResponse(res);
      return json?.data || null;
    } catch (err) {
      console.warn('apiService.predictWalkIn error:', err.message);
      return null;
    }
  },

  // 7. Authentication & Registration
  login: async (credentials) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('apiService.login error:', err.message);
      return { success: false, message: err.message };
    }
  },

  async verifyOTP(email, otp) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await response.json();
    } catch (e) {
      console.warn('[API] Verify OTP failed:', e.message);
      return null;
    }
  },

  register: async (registrationData) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('apiService.register error:', err.message);
      return null;
    }
  },

  // 8. Payments
  initiatePayment: async (paymentData) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/payments/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('apiService.initiatePayment error:', err.message);
      return null;
    }
  },

  // 9. Super Admin — User & Platform Management (Phase 6 & 11)
  admin: {
    getStats: async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getPlatformAnalytics: async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/platform-analytics`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getRestaurantAnalytics: async (restaurantId) => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/analytics/${restaurantId}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getUsers: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/users${qs ? '?' + qs : ''}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    updateUserStatus: async (userId, status) => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    deleteUser: async (userId) => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getOwners: async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/owners`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    updateOwnerStatus: async (ownerId, status) => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/owners/${ownerId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    getRestaurants: async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/restaurants`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    updateRestaurantStatus: async (restaurantId, isAcceptingOrders) => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/admin/restaurants/${restaurantId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAcceptingOrders })
      });
      return handleResponse(res);
    }
  },

  // 10. Real Analytics & Smart Predictions (Phase 11)
  getRestaurantAnalytics: async (restaurantId) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/restaurants/${restaurantId}/analytics`, {
        headers: getAuthHeaders()
      });
      const json = await handleResponse(res);
      return json?.data || null;
    } catch (err) {
      console.warn(`apiService.getRestaurantAnalytics(${restaurantId}) error:`, err.message);
      return null;
    }
  }
};

