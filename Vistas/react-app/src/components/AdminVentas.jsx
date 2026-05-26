import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import CrearEmpleadoModal from './CrearEmpleadoModal';

export default function AdminVentas({ onCambiarVista, onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [clienteActivo, setClienteActivo] = useState(null);
  const [historialVentas, setHistorialVentas] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setCargandoClientes(true);
        const data = await apiClient.getClientesRegistrados();
        setClientes(data);
        if (data.length > 0) {
          seleccionarCliente(data[0]);
        }
      } catch (error) {
        console.error("Error al cargar estadísticas de clientes:", error);
      } finally {
        setCargandoClientes(false);
      }
    };
    fetchClientes();
  }, []);

  const seleccionarCliente = async (cliente) => {
    setClienteActivo(cliente);
    try {
      setCargandoVentas(true);
      const ventas = await apiClient.getHistorialVentasCliente(cliente.tarjeta); 
      setHistorialVentas(ventas);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setHistorialVentas([]);
    } finally {
      setCargandoVentas(false);
    }
  };

  const formatearTarjeta = (tarjetaStr) => {
    if (!tarjetaStr) return "**** **** **** ****";
    return tarjetaStr.match(/.{1,4}/g)?.join(' ') || tarjetaStr;
  };

  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="bg-brand-dark text-white px-8 py-4 flex justify-between items-center shadow-md h-[70px]">
        <div className="text-xl font-bold flex items-center gap-3">
           <span className="text-brand-teal">Admin:</span> XYZ Store
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowCrearModal(true)}
            className="bg-brand-primary text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-brand-accent transition flex items-center gap-2 shadow-sm"
          >
            <span className="text-xl leading-none">+</span> Nuevo Empleado
          </button>
          <button 
            onClick={() => onCambiarVista('reportes')}
            className="bg-white bg-opacity-10 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-20 transition shadow-sm"
          >
            Reportes mensuales
          </button>
          <button className="bg-brand-teal text-white font-bold py-2 px-4 rounded-lg shadow-sm transition">
            Ventas Globales
          </button>
          <button onClick={onLogout} className="text-gray-400 hover:text-white text-sm font-bold ml-2">Salir</button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-70px)]">
        
        {/* CONTENIDO PRINCIPAL: Desglose de Ventas */}
        <div className="w-2/3 p-8 overflow-y-auto bg-gray-50">
          {!clienteActivo ? (
             <div className="flex h-full items-center justify-center text-gray-400 font-medium">
               Selecciona un cliente de la lista para ver sus transacciones
             </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-brand-dark flex justify-between items-center">
                <div>
                  <h1 className="text-brand-dark text-2xl font-bold mb-2">
                    Desglose de ventas de {clienteActivo.nombre}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tarjeta (FPE Token):</span>
                    <p className="text-brand-teal font-mono font-bold text-lg bg-brand-light px-3 py-1 rounded">
                      {formatearTarjeta(clienteActivo.tarjeta)}
                    </p>
                  </div>
                </div>
                <div className="text-right bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Acumulado</p>
                  <p className="text-3xl font-black text-brand-primary">${clienteActivo.totalGastado?.toFixed(2)}</p>
                </div>
              </div>

              {cargandoVentas ? (
                 <p className="text-center text-gray-400 font-bold animate-pulse mt-10">Consultando base de datos...</p>
              ) : historialVentas.length === 0 ? (
                 <p className="text-center text-gray-400 italic mt-10">Este cliente no tiene compras registradas.</p>
              ) : (
                historialVentas.map((venta) => (
                  <div key={venta.id} className="bg-white border border-brand-light rounded-xl p-5 mb-5 shadow-sm">
                    <div className="flex justify-between border-b-2 border-brand-light pb-3 mb-3">
                      <span className="font-bold text-gray-500">📅 Fecha: {venta.fecha}</span>
                      <span className="font-bold text-brand-teal">Venta #{venta.id}</span>
                    </div>
                    
                    <ul className="mb-4 space-y-2">
                      {venta.productos.map((prod, index) => (
                        <li key={index} className="flex justify-between text-brand-dark text-[0.95rem]">
                          <span>{prod.nombre}</span>
                          <span className="font-semibold">${prod.precio.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Método de Pago</p>
                        <p className="text-brand-dark font-mono text-lg font-medium">
                          💳 {formatearTarjeta(clienteActivo.tarjeta)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Total Pagado</p>
                        <p className="text-2xl font-black text-brand-primary">${venta.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* SIDEBAR: Clientes Registrados */}
        <div className="w-1/3 bg-brand-light p-6 overflow-y-auto border-l-2 border-brand-teal shadow-lg">
          <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Análisis de Clientes
          </h2>

          {cargandoClientes ? (
             <p className="text-gray-500 text-center animate-pulse text-sm">Procesando insights de datos...</p>
          ) : (
            clientes.map((cliente) => (
              <div 
                key={cliente.tarjeta} 
                className={`bg-white p-4 rounded-xl mb-4 shadow-sm transition-all cursor-pointer ${
                  clienteActivo?.tarjeta === cliente.tarjeta 
                    ? 'border-l-8 border-brand-primary transform scale-[1.02]' 
                    : 'border-l-4 border-brand-teal hover:border-brand-primary'
                }`}
                onClick={() => seleccionarCliente(cliente)}
              >
                <h3 className="font-bold text-brand-dark text-lg">{cliente.nombre}</h3>
                <p className="text-gray-400 font-semibold text-[10px] mt-1 uppercase">Token FPE Activo:</p>
                <p className="text-gray-600 font-mono font-bold text-xs border-b border-gray-100 pb-2 mb-2">
                  {formatearTarjeta(cliente.tarjeta)}
                </p>
                
                {/* ESTADÍSTICAS REQUERIDAS */}
                <div className="flex justify-between items-center bg-gray-50 rounded p-2 border border-gray-100">
                  <div className="text-center w-1/2 border-r border-gray-200">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Compras</p>
                    <p className="text-brand-dark font-bold">{cliente.frecuencia}</p>
                  </div>
                  <div className="text-center w-1/2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Gasto Total</p>
                    <p className="text-brand-primary font-black">${cliente.totalGastado.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <CrearEmpleadoModal isOpen={showCrearModal} onClose={() => setShowCrearModal(false)} />
    </div>
  );
}