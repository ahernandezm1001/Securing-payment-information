import { useMemo, useState, useEffect } from 'react';
import { apiClient } from './services/api';

// --- IMPORTACIÓN DE COMPONENTES ---
import LoginPantalla from './components/LoginPantalla';
import TerminalVentas from './components/PuntoVenta'; 
import ModalPagoSeguro from './components/ModalPagoSeguro';
import ModalRegistrarCliente from './components/RegistrarClienteModal';
import GenerarReporteModal from './components/GenerarReporteModal';
import NotificacionModal from './components/NotificacionModal';
import AdminReportes from './components/AdminReportes';
import AdminVentas from './components/AdminVentas';
import ModalIdentificarCliente from './components/ModalIdentificarCliente';

export default function App() {
  // ✅ ESTADO DE PRODUCTOS (Ahora sí, adentro de la función principal)
  const [products, setProducts] = useState([]);

  // --- ESTADOS DE NAVEGACIÓN ---
  const [page, setPage] = useState('login'); // 'login', 'pos', 'admin-reportes', 'admin-ventas'
  const [username, setUsername] = useState('');
  
  // --- ESTADOS DEL CARRITO / TICKET ---
  const [ticketItems, setTicketItems] = useState([]);
  
  // --- ESTADOS DE MODALES ---
  const [showIdentificar, setShowIdentificar] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showReporteModal, setShowReporteModal] = useState(false);

  // --- DATOS DEL PROCESO ACTUAL ---
  const [clienteActual, setClienteActual] = useState(null);
  const [cardNumber, setCardNumber] = useState('');

  // --- ESTADO DE NOTIFICACIONES (ÉXITO/ERROR) ---
  const [notificacion, setNotificacion] = useState({
    isOpen: false, tipo: 'exito', titulo: '', mensaje: ''
  });

  // Cálculo del total del ticket
  const total = useMemo(
    () => ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [ticketItems]
  );

  // --- MANEJO DE LOGIN ---
  const handleLogin = (user) => {
    setUsername(user);
    // Regla: Solo 'admin' entra al panel, los demás a la terminal
    if (user.toLowerCase() === 'admin') {
      setPage('admin-reportes');
    } else {
      setPage('pos');
    }
  };
 
  // --- MANEJO DE PRODUCTOS --- 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiClient.getProducts();
        setProducts(data); 
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };

    fetchProducts();
  }, []);

  
  // --- MANEJO DEL CARRITO ---
  const handleAddProduct = (product) => {
    setTicketItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      
      // Calculamos cuántos tiene el empleado actualmente en el ticket
      const cantidadEnTicket = existing ? existing.quantity : 0;

      // Verificamos si al agregar uno más se supera el stock disponible
      if (cantidadEnTicket >= product.stock) {
        setNotificacion({
          isOpen: true, 
          tipo: 'error', 
          titulo: 'Stock insuficiente', 
          mensaje: `Solo hay ${product.stock} unidades de "${product.name}" disponibles.`
        });
        return current; // Retorna el carrito sin cambios
      }

      // Si sí hay stock, lo agregamos normalmente
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const handleEmptyTicket = () => setTicketItems([]);

  // --- FLUJO SECUENCIAL DE COMPRA ---

  // 1. Iniciar identificación (se dispara al dar clic en Procesar Pago)
  const handleStartPurchase = () => {
    setShowIdentificar(true);
  };

  // 2. Si el cliente se encuentra en la base de datos
  const handleClientFound = (cliente) => {
    setClienteActual(cliente);
    setShowIdentificar(false);
    setShowPagoModal(true); // Saltamos directo al cobro
  };

  // 3. Si el cliente NO se encuentra, pasamos a registrarlo
  const handleGoToRegister = () => {
    setShowIdentificar(false);
    setShowRegistrarModal(true);
  };

  // 4. Tras registrar un nuevo cliente con éxito
  const handleAfterRegister = (nuevoCliente) => {
    setClienteActual(nuevoCliente);
    setShowRegistrarModal(false);
    setShowPagoModal(true); // Una vez creado, procedemos al cobro de inmediato
  };

  // --- MANEJO DE REPORTES ---
  const handleGenerateReport = async (mes) => {
    try {
      await apiClient.generateReport(mes);
      setNotificacion({
        isOpen: true, tipo: 'exito', titulo: 'Reporte Generado', mensaje: `El reporte de ${mes} ha sido firmado y guardado.`
      });
    } catch (error) {
      setNotificacion({
        isOpen: true, tipo: 'error', titulo: 'Error de Firma', mensaje: error.message
      });
    }
  };

  return (
    <>
      {/* VISTAS PRINCIPALES */}
      {page === 'login' && <LoginPantalla onLogin={handleLogin} />}
      
      {page === 'pos' && (
        <TerminalVentas
          products={products}
          ticketItems={ticketItems}
          total={total}
          username={username}
          onAddProduct={handleAddProduct}
          onEmptyTicket={handleEmptyTicket}
          onProcessPayment={handleStartPurchase} // Inicia el flujo de identificación
          onGenerateReport={() => setShowReporteModal(true)}
          onRegisterClient={() => setShowRegistrarModal(true)}
        />
      )}

      {page === 'admin-reportes' && <AdminReportes onNavigate={() => setPage('admin-ventas')} />}
      {page === 'admin-ventas' && <AdminVentas onNavigate={() => setPage('admin-reportes')} />}

      {/* --- MODALES DEL FLUJO DE VENTA --- */}
      
      {/* Paso 1: Buscar cliente */}
      <ModalIdentificarCliente 
        isOpen={showIdentificar}
        onClose={() => setShowIdentificar(false)}
        onClientFound={handleClientFound}
        onRegisterNew={handleGoToRegister}
      />

      {/* Paso 2 (Opcional): Registrar si no existe */}
      <ModalRegistrarCliente 
        isOpen={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        onSave={handleAfterRegister} 
      />

      {/* Paso Final: Realizar el cobro seguro */}
      <ModalPagoSeguro 
        isOpen={showPagoModal}
        total={total}
        ticketItems={ticketItems}
        username={username}
        cliente={clienteActual}
        cardNumber={cardNumber}
        onCardNumberChange={setCardNumber}
        onClose={() => {
          setShowPagoModal(false);
          setClienteActual(null);
          setTicketItems([]);
          setCardNumber('');
        }}
      />

      {/* --- OTROS MODALES --- */}

      <GenerarReporteModal
        isOpen={showReporteModal}
        onClose={() => setShowReporteModal(false)}
        onGenerate={handleGenerateReport}
      />

      <NotificacionModal
        isOpen={notificacion.isOpen}
        onClose={() => setNotificacion({ ...notificacion, isOpen: false })}
        tipo={notificacion.tipo}
        titulo={notificacion.titulo}
        mensaje={notificacion.mensaje}
      />
    </>
  );
}