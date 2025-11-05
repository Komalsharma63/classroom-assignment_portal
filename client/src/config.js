// Central API configuration for frontend
// Use Vite environment variable VITE_API_BASE for production (no trailing slash)
// Example in Vercel (for build env): VITE_API_BASE=https://my-backend.onrender.com

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
export const API_URL = `${API_BASE}/api`;
