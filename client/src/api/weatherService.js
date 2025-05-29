import axios from 'axios';

const API_URL = '/api';

// Configurare client axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviciu pentru date meteo
const weatherService = {
  // Obținere date curente
  getCurrentData: async () => {
    const response = await apiClient.get('/data/current');
    return response.data;
  },

  // Obținere date istorice cu filtrare
  getHistoryData: async (params) => {
    const response = await apiClient.get('/data/history', { params });
    return response.data;
  },

  // Obținere statistici
  getStatistics: async (params) => {
    const response = await apiClient.get('/data/statistics', { params });
    return response.data;
  },

  // Adăugare date de test
  addTestData: async () => {
    const response = await apiClient.post('/test-data');
    return response.data;
  }
};

export default weatherService;
