import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function extractText(text) {
  if (USE_MOCK) {
    const response = await axios.get(`${BASE}/mock`);
    return response.data;
  }

  const url = `${BASE}/extract`;
  const response = await axios.post(url, { text });
  return response.data;
}
