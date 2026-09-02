const BASE_URL = '/api';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  _getToken() {
    return localStorage.getItem('ht_token');
  }

  async _request(method, path, body) {
    const token = this._getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : null;

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('ht_token');
        localStorage.removeItem('ht_user');
        window.location.href = '/login';
      }
      const message =
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors.map(e => e.msg).join(', ') : null) ||
        `HTTP ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  get(path)          { return this._request('GET', path); }
  post(path, body)   { return this._request('POST', path, body); }
  patch(path, body)  { return this._request('PATCH', path, body); }
  delete(path)       { return this._request('DELETE', path); }
}

const api = new ApiClient(BASE_URL);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  update:   (data) => api.patch('/auth/me', data),
};

export const habitsApi = {
  list:   ()         => api.get('/habits'),
  get:    (id)       => api.get(`/habits/${id}`),
  create: (data)     => api.post('/habits', data),
  update: (id, data) => api.patch(`/habits/${id}`, data),
  delete: (id)       => api.delete(`/habits/${id}`),
};

export const checkinsApi = {
  create: (habitId, data)      => api.post(`/habits/${habitId}/checkins`, data),
  list:   (habitId, page = 1)  => api.get(`/habits/${habitId}/checkins?page=${page}`),
  delete: (habitId, checkInId) => api.delete(`/habits/${habitId}/checkins/${checkInId}`),
};

export default api;
