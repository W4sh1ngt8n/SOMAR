const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem('somar_token');
  const config = {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  };
  if (config.body && typeof config.body === 'object') config.body = JSON.stringify(config.body);
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (response.status === 401) {
    sessionStorage.removeItem('somar_token');
    sessionStorage.removeItem('somar_user');
    window.location.hash = '#/login';
    throw new Error('Sessão expirada');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

const api = {
  get: (e) => request(e, { method: 'GET' }),
  post: (e, b) => request(e, { method: 'POST', body: b }),
  put: (e, b) => request(e, { method: 'PUT', body: b }),
  patch: (e, b) => request(e, { method: 'PATCH', body: b }),
  delete: (e) => request(e, { method: 'DELETE' }),
  download: async (e) => {
    const token = sessionStorage.getItem('somar_token');
    const r = await fetch(`${API_BASE}${e}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error('Erro no download');
    return r.blob();
  },
};

async function uploadFile(endpoint, file, extraFields) {
  const token = sessionStorage.getItem('somar_token');
  const formData = new FormData();
  formData.append('arquivo', file);
  if (extraFields) Object.keys(extraFields).forEach(k => formData.append(k, extraFields[k]));
  const r = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.erro || 'Erro no upload');
  return data;
}