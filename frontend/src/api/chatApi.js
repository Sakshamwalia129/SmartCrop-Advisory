import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 35000,
  headers: { 'Content-Type': 'application/json' },
});

export const sendChatMessage = async (query, cropType, language = 'en') => {
  const { data } = await api.post('/chat', {
    query,
    cropType: cropType || null,
    language,
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

export const renameConversationApi = async (id, title) => {
  const { data } = await api.patch(`/chat/${id}/title`, { title });
  return data;
};

export const deleteConversationApi = async (id) => {
  const { data } = await api.delete(`/chat/${id}`);
  return data;
};
