import axios from 'axios';

const authApi = axios.create({
  baseURL: '/api/auth',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Register a new user.
 * @returns {{ token: string, user: object }}
 */
export const registerUser = async (name, email, password, confirmPassword) => {
  const { data } = await authApi.post('/register', { name, email, password, confirmPassword });
  return data;
};

/**
 * Log in an existing user.
 * @returns {{ token: string, user: object }}
 */
export const loginUser = async (email, password) => {
  const { data } = await authApi.post('/login', { email, password });
  return data;
};

/**
 * Validate the stored token and retrieve the current user.
 * Used on app load to restore session without logging in again.
 */
export const fetchMe = async (token) => {
  const { data } = await authApi.get('/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Notify the server of logout (stateless — mainly for future blocklist support).
 */
export const logoutUser = async () => {
  await authApi.post('/logout').catch(() => {}); // swallow errors — logout must always succeed client-side
};
