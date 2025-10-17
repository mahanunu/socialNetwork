// front/src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://snback.vercel.app/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erreur serveur');
  }
  return data;
}

const api = {
  get: (url) =>
    fetch(`${API_BASE}${url}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),

  post: (url, data) =>
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  put: (url, data) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (url) =>
    fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),
};

export default api;
