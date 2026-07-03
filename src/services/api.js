/**
 * Tarik Clothing — API Service Layer
 * Connects the React frontend to the FastAPI backend on GCP.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://34.132.216.147:6000';

// ─── Auth Token Management ───

function getToken() {
  return localStorage.getItem('tarik_admin_token');
}

function setToken(token) {
  localStorage.setItem('tarik_admin_token', token);
}

function clearToken() {
  localStorage.removeItem('tarik_admin_token');
}

// ─── Fetch Wrapper ───

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach auth token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 — token expired
  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ─── Auth API ───

export const authAPI = {
  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiFetch('/api/auth/me'),

  getToken,
  setToken,
  clearToken,
};

// ─── Products API ───

export const productsAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.featured !== undefined) query.set('featured', params.featured);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return apiFetch(`/api/products${qs ? `?${qs}` : ''}`);
  },

  get: (id) => apiFetch(`/api/products/${id}`),

  create: (product) =>
    apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  update: (id, updates) =>
    apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id) =>
    apiFetch(`/api/products/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Orders API ───

export const ordersAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    const qs = query.toString();
    return apiFetch(`/api/orders${qs ? `?${qs}` : ''}`);
  },

  create: (orderData) =>
    apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  updateStatus: (orderId, status) =>
    apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  stats: () => apiFetch('/api/orders/stats'),
};

// ─── Upload API ───

export const uploadAPI = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();
    // Return full URL for the uploaded file
    return {
      ...data,
      url: `${API_BASE}${data.url}`,
    };
  },
};

export default { authAPI, productsAPI, ordersAPI, uploadAPI };
