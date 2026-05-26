const API_BASE_URL = 'http://localhost:8081/api';

export const apiClient = {
  async login(username, password, deviceId = 'terminal-react') {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      
      body: JSON.stringify({ 
        username: username,
        password: password,
        deviceId: deviceId
      })
    });
    
    const data = await response.json();
    
    // Validamos el campo "success" que nos manda el LoginController de Java
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Error en login');
    }
    
    // Devolvemos la data completa (que ahora incluye el id real y el nombre)
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
  
  async searchClient(phone) {
    const response = await fetch(`http://localhost:8081/api/clientes/buscar?telefono=${phone}`);
    
    
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
  },

  
  async getProducts() {
    const response = await fetch(`http://localhost:8081/api/productos`);
    if (!response.ok) {
      throw new Error('Error al cargar el catálogo de productos');
    }
    return await response.json();
  },
  async getVentasPorMes(anio, mesNombre, idEmpleado) {
    const mesesMap = {
      "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4, "Mayo": 5, "Junio": 6,
      "Julio": 7, "Agosto": 8, "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12
    };
    const numeroMes = mesesMap[mesNombre];
    
    // Le pegamos el idEmpleado a la URL
    const response = await fetch(`http://localhost:8081/api/reportes/ventas?anio=${anio}&mes=${numeroMes}&idEmpleado=${idEmpleado}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar las ventas del mes');
    }
    return await response.json();
  },
  async firmarYEnviarReporte(datosFirma) {
    const response = await fetch('http://localhost:8081/api/reportes/firmar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosFirma),
    });

    if (!response.ok) {
      // Si Java nos mandó un error (ej. llave inválida), lo leemos
      const errorText = await response.text();
      throw new Error(errorText || 'Error al firmar y enviar el reporte');
    }
    
    // Retornamos el mensaje de éxito del servidor
    return await response.text();
  },
  
  // 1. Obtiene TODOS los reportes de TODOS los empleados
  async getAllReportes() {
    const response = await fetch(`${API_BASE_URL}/reportes/todos`);
    if (!response.ok) throw new Error('Error al cargar todos los reportes');
    return await response.json();
  },

  // 2. Obtiene TODO el historial de ventas global
  async getAllVentasGlobales() {
    // Si tienes un endpoint global úsalo, sino podemos pedir el mes actual por defecto
    const response = await fetch(`${API_BASE_URL}/reportes/ventas-globales`); 
    if (!response.ok) throw new Error('Error al cargar ventas globales');
    return await response.json();
  },

  // 3. Obtiene todos los clientes registrados
  async getAllClientes() {
    const response = await fetch(`${API_BASE_URL}/clientes/todos`);
    if (!response.ok) throw new Error('Error al cargar clientes');
    return await response.json();
  },
  async crearEmpleado(nombreCompleto, password) {
    const response = await fetch('http://localhost:8080/api/server/empleados/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreCompleto, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear empleado');
    return data;
  },
  // Verifica criptográficamente un reporte
  async verificarFirmaReporte(idReporte) {
    // Apuntamos al 8081 usando POST
    const response = await fetch(`http://localhost:8081/api/reportes/verificar/${idReporte}`, {
        method: 'POST'
    });
    return await response.json();
  },
  async getClientesRegistrados() {
    const response = await fetch('http://localhost:8080/api/server/admin/ventas/clientes');
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar clientes');
    }
    return await response.json();
  },

  // Obtiene el historial detallado usando el token FPE
  async getHistorialVentasCliente(tarjetaFpe) {
    const response = await fetch(`http://localhost:8080/api/server/admin/ventas/historial/${encodeURIComponent(tarjetaFpe)}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar el historial del cliente');
    }
    return await response.json();
  }
};