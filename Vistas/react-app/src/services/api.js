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
  },

  // --- NUEVOS ENDPOINTS ---

  // Agrega esto dentro de tu objeto/clase apiClient en api.js
  async registerClient(clientData) {
    const response = await fetch(`http://localhost:8081/api/clientes/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData)
    });

    if (!response.ok) {
      throw new Error('Error al registrar el cliente en el servidor');
    }
    
    return await response.json();
  },
  // Añadir esto a tu objeto apiClient en api.js
  // En src/services/api.js
  async searchClient(phone) {
    const response = await fetch(`http://localhost:8081/api/clientes/buscar?telefono=${phone}`);
    
    // 1. LA CLAVE: Si el backend dice 404, devolvemos 'null' explícitamente.
    // Esto es lo que activa el modal de "Registrar Cliente" en tu App.jsx
    if (response.status === 404) {
      return null; 
    }
    
    // 2. Si hay otro error (como que el servidor esté apagado)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor');
    }
    
    // 3. Si todo sale bien (200 OK), devolvemos los datos del cliente
    return await response.json();
  },

  async generateReport(mes) {
    // Ejemplo de endpoint, ajusta la URL según tu controlador en Java
    const response = await fetch(`${API_BASE_URL}/reportes/generar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al generar reporte');
    return data;
  }
};