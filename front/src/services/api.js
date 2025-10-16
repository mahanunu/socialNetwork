// front/src/services/api.js
const API_BASE = 'https://snback.vercel.app/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const error = data?.error || 'Erreur inconnue';
    throw new Error(error);
  }
  return data;
}

const api = {
  get: (url) =>
    fetch(`${API_BASE}${url}`, {
      method: 'GET',
      credentials: 'include', // 👈 envoie le cookie vers le backend
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
};

export default api;
