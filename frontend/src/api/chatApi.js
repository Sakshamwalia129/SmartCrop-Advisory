import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 35000,
  headers: { 'Content-Type': 'application/json' },
});

export const sendChatMessage = async (query, cropType) => {
  const { data } = await api.post('/chat', {
    query,
    cropType: cropType || null,
  });
  return data;
};

export const fetchHistory = async (page = 1, limit = 30) => {
  const { data } = await api.get('/chat/history', { params: { page, limit } });
  return data;
};

export const checkHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};
