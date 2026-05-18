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
  // ✅ ESTADO DE PRODUCTOS 
  const [products, setProducts] = useState([]);

  // --- ESTADOS DE NAVEGACIÓN Y USUARIO ---
  const [page, setPage] = useState('login'); 
  const [username, setUsername] = useState('');
  const [idEmpleado, setIdEmpleado] = useState(null); 
  
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

  // --- ESTADO DE NOTIFICACIONES ---
  const [notificacion, setNotificacion] = useState({
    isOpen: false, tipo: 'exito', titulo: '', mensaje: ''
  });

  // Cálculo del total del ticket
  const total = useMemo(
    () => ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [ticketItems]
  );

  // --- MANEJO DE LOGIN ---
  // Ahora recibe un objeto con id y nombre
  const handleLogin = (datosUsuario) => {
    setUsername(datosUsuario.nombre);
    setIdEmpleado(datosUsuario.id);
    

    // Regla: Solo 'admin' entra al panel
    if (datosUsuario.nombre === 'Administrador') {
      setPage('admin-reportes');
    } else {
      setPage('pos');
    }
  };
 
  // --- CARGAR PRODUCTOS --- 
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
      const cantidadEnTicket = existing ? existing.quantity : 0;

      if (cantidadEnTicket >= product.stock) {
        setNotificacion({
          isOpen: true, 
          tipo: 'error', 
          titulo: 'Stock insuficiente', 
          mensaje: `Solo hay ${product.stock} unidades de "${product.name}" disponibles.`
        });
        return current; 
      }

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const handleEmptyTicket = () => setTicketItems([]);

  // --- FLUJO DE COMPRA ---
  const handleStartPurchase = () => setShowIdentificar(true);

  const handleClientFound = (cliente) => {
    setClienteActual(cliente);
    setShowIdentificar(false);
    setShowPagoModal(true); 
  };

  const handleGoToRegister = () => {
    setShowIdentificar(false);
    setShowRegistrarModal(true);
  };

  const handleAfterRegister = (nuevoCliente) => {
    setClienteActual(nuevoCliente);
    setShowRegistrarModal(false);
    setShowPagoModal(true); 
  };

  // --- MANEJO DE REPORTES FIRMADOS (ECDSA) ---
  const handleGenerateReport = async (periodo, llavePrivada, ventasDelMes) => {
    try {
      const totalVentas = ventasDelMes.length;
      const montoTotal = ventasDelMes.reduce((sum, venta) => sum + venta.monto, 0);

      const payload = {
        idEmpleado: idEmpleado, 
        periodo: periodo, 
        totalVentas: totalVentas,
        montoTotal: montoTotal,
        llavePrivada: llavePrivada 
      };

      const respuestaServidor = await apiClient.firmarYEnviarReporte(payload);
      
      setNotificacion({
        isOpen: true, 
        tipo: 'exito', 
        titulo: 'Firma Exitosa', 
        mensaje: respuestaServidor
      });

    } catch (error) {
      setNotificacion({
        isOpen: true, 
        tipo: 'error', 
        titulo: 'Error de Verificación', 
        mensaje: error.message
      });
    }
  };

  return (
    <>
      {page === 'login' && <LoginPantalla onLogin={handleLogin} />}
      
      {page === 'pos' && (
        <TerminalVentas
          products={products}
          ticketItems={ticketItems}
          total={total}
          username={username}
          idEmpleado={idEmpleado}
          onAddProduct={handleAddProduct}
          onEmptyTicket={handleEmptyTicket}
          onProcessPayment={handleStartPurchase} 
          onGenerateReport={() => setShowReporteModal(true)}
          onRegisterClient={() => setShowRegistrarModal(true)}
        />
      )}

      {page === 'admin-reportes' && <AdminReportes onNavigate={() => setPage('admin-ventas')} />}
      {page === 'admin-ventas' && <AdminVentas onNavigate={() => setPage('admin-reportes')} />}

      {/* MODALES */}
      <ModalIdentificarCliente 
        isOpen={showIdentificar}
        onClose={() => setShowIdentificar(false)}
        onClientFound={handleClientFound}
        onRegisterNew={handleGoToRegister}
      />

      <ModalRegistrarCliente 
        isOpen={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        onSave={handleAfterRegister} 
      />

      <ModalPagoSeguro 
        isOpen={showPagoModal}
        total={total}
        ticketItems={ticketItems}
        username={username}
        idEmpleado={idEmpleado}
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

      <GenerarReporteModal
        isOpen={showReporteModal}
        onClose={() => setShowReporteModal(false)}
        onGenerate={handleGenerateReport}
        idEmpleado={idEmpleado}
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