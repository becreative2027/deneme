import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export const adminClient = axios.create({ baseURL: BASE_URL });

// Attach JWT from localStorage on each request
adminClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sf_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
