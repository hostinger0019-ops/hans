/**
 * Tarik Clothing — API Service Layer
 * Connects the React frontend to the FastAPI backend on GCP.
 * On HTTPS (Hostinger), uses PHP proxy to avoid mixed-content blocking.
 */

const GCP_BACKEND = 'http://35.244.35.135:6000';
const IS_PRODUCTION = window.location.protocol === 'https:';

// Build the correct URL depending on environment
function buildUrl(endpoint) {
  if (IS_PRODUCTION) {
    // Route through PHP proxy on same domain
    return `/api-proxy.php?path=${encodeURIComponent(endpoint)}`;
  }
  return `${GCP_BACKEND}${endpoint}`;
}

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
  const url = buildUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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

// ─── Hostinger Upload API (Fast — files served directly from Hostinger) ───

const HOSTINGER_UPLOAD_KEY = 'tarik-upload-2024-secure';

export const uploadAPI = {
  /**
   * Upload a file to Hostinger via the PHP upload script.
   * Files are saved to /uploads/images/ or /uploads/reels/ on Hostinger.
   * Returns { url, filename, type, size }
   */
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Always upload to Hostinger (same domain in production, or direct URL in dev)
    const uploadUrl = IS_PRODUCTION
      ? '/upload.php'
      : 'https://tarikclothing.com/upload.php';

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-Upload-Key': HOSTINGER_UPLOAD_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
};
// ─── Reels API ───

export const reelsAPI = {
  list: () => apiFetch('/api/reels'),

  create: (reelData) =>
    apiFetch('/api/reels', {
      method: 'POST',
      body: JSON.stringify(reelData),
    }),

  delete: (id) =>
    apiFetch(`/api/reels/${id}`, {
      method: 'DELETE',
    }),
};

export default { authAPI, productsAPI, ordersAPI, uploadAPI, reelsAPI };

