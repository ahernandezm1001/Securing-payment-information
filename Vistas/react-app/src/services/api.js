const API_BASE_URL = 'http://localhost:8081/api';

export const apiClient = {
  async login(username, password, deviceId = 'terminal-react') {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, deviceId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en login');
    }
    
    return data;
  },

  async sendPayment(ticketData) {
    const response = await fetch(`${API_BASE_URL}/payment/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error al enviar el ticket');
    }
    
    return data;
  }
};
