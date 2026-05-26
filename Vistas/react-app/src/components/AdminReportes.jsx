import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export default function AdminReportes({ onCambiarVista }) {
  const [reportes, setReportes] = useState([]);
  const [reporteActivo, setReporteActivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar datos reales al montar el componente
  useEffect(() => {
    const fetchReportes = async () => {
      try {
        setCargando(true);
        const data = await apiClient.getAllReportes();
        setReportes(data);
        if (data.length > 0) setReporteActivo(data[0]); // Seleccionamos el primero por defecto
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchReportes();
  }, []);

  const verificarFirma = () => {
    if(!reporteActivo) return;
    alert(`Verificando firma de ${reporteActivo.nombreEmpleado}...\nFirma ECDSA: ${reporteActivo.firmaDigital ? 'PRESENTE' : 'AUSENTE'}`);
    // Aquí implementaremos la validación real después
  };

  // Función segura para parsear los detalles de ventas
  const obtenerDetallesSeguros = (jsonString) => {
    try {
      if (!jsonString) return [];
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Error al leer los detalles de ventas:", e);
      return [];
    }
  };

  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-brand-dark text-white px-8 py-4 flex justify-between items-center shadow-md h-[70px]">
        <div className="text-xl font-bold">Panel de Administrador</div>
        <div className="flex gap-4">
          <button className="bg-brand-teal text-white font-bold py-2 px-4 rounded-lg shadow-sm transition">
            Reportes mensuales
          </button>
          <button 
            onClick={() => onCambiarVista('ventas')}
            className="bg-brand-primary text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-brand-accent transition shadow-sm"
          >
            Ventas Globales
          </button>
        </div>
      </header>

      {/* ADMIN LAYOUT */}
      <div className="flex h-[calc(100vh-70px)]">
        
        {/* SIDEBAR: Lista de Reportes */}
        <div className="w-1/3 bg-brand-light p-6 overflow-y-auto border-r-2 border-brand-teal z-10 shadow-lg">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Reportes recibidos</h2>

          {cargando ? (
             <p className="text-gray-500 text-center font-bold animate-pulse">Cargando reportes seguros...</p>
          ) : reportes.length === 0 ? (
             <p className="text-gray-500 text-center italic">No hay reportes registrados.</p>
          ) : (
            reportes.map((rep) => (
              <div 
                key={rep.idReporte} 
                className={`bg-white p-4 rounded-xl mb-4 shadow-sm transition-transform duration-200 cursor-pointer ${
                  reporteActivo?.idReporte === rep.idReporte 
                    ? 'border-l-8 border-brand-primary transform scale-[1.02]' 
                    : 'border-l-4 border-brand-teal hover:border-brand-primary'
                }`}
                onClick={() => setReporteActivo(rep)}
              >
                <h3 className="font-bold text-brand-dark text-lg">{rep.periodo}</h3>
                <p className="text-gray-500 font-semibold text-sm mt-1">Empleado: {rep.nombreEmpleado}</p>
                <p className="text-gray-400 font-mono text-[10px] mt-1">Subido: {rep.fechaSubida}</p>
                
                <div className="flex gap-2 mt-4">
                  <button className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition ${
                    reporteActivo?.idReporte === rep.idReporte ? 'bg-brand-primary text-white' : 'bg-brand-teal text-white hover:bg-brand-primary'
                  }`}>
                    Ver detalles
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CONTENIDO: Detalle del Reporte */}
        <div className="w-2/3 p-8 overflow-y-auto bg-gray-50">
          {!reporteActivo ? (
            <div className="flex h-full items-center justify-center text-gray-400 font-medium">
              Selecciona un reporte de la lista para ver sus detalles criptográficos
            </div>
          ) : (
            <>
              {/* Cabecera del reporte activo */}
              <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex justify-between items-center border-t-4 border-brand-dark">
                <div>
                  <h1 className="text-brand-dark text-2xl font-bold mb-2">Reporte - {reporteActivo.periodo}</h1>
                  <p className="text-brand-teal font-bold text-lg">Generado por: {reporteActivo.nombreEmpleado}</p>
                </div>
                <div>
                  <button 
                    onClick={verificarFirma}
                    className="bg-brand-dark text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-teal transition shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verificar firma
                  </button>
                </div>
              </div>

              {/* Sección de Detalle de Ventas */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
                <h2 className="text-xl font-black text-brand-dark flex items-center gap-2 mb-4 border-b-2 border-brand-light pb-2">
                  <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Desglose de Ventas del Periodo
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        <th className="p-3 text-[10px] font-black text-gray-400 uppercase">Fecha</th>
                        <th className="p-3 text-[10px] font-black text-gray-400 uppercase">Productos</th>
                        <th className="p-3 text-[10px] font-black text-gray-400 uppercase text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {obtenerDetallesSeguros(reporteActivo.detallesVentas).length > 0 ? (
                        obtenerDetallesSeguros(reporteActivo.detallesVentas).map((venta, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="p-3 text-xs text-gray-500 font-mono whitespace-nowrap">{venta.fecha}</td>
                            <td className="p-3 text-sm text-brand-dark font-semibold">{venta.productos}</td>
                            <td className="p-3 text-sm font-bold text-brand-teal text-right">${venta.monto.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-gray-400 text-sm">
                            No hay detalles registrados para este reporte.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-brand-light">
                      <tr>
                        <td colSpan="2" className="p-4 text-right font-bold text-brand-dark">TOTAL REPORTADO:</td>
                        <td className="p-4 text-right font-black text-brand-primary text-lg">
                          ${reporteActivo.montoTotal?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Sección de Validación Criptográfica - Estilo Auditoría */}
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-black text-brand-dark flex items-center gap-2 border-b-2 border-brand-light pb-2">
                  <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Auditoría Criptográfica
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  
                  {/* 1. Tarjeta de la Cadena Original (Estilo Ticket Punteado) */}
                  <div className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-300 relative overflow-hidden group hover:border-brand-teal transition-colors shadow-sm">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gray-200 group-hover:bg-brand-teal transition-colors"></div>
                    <div className="pl-4">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Cadena Original (Texto Plano)
                      </h3>
                      <p className="font-mono text-sm text-brand-dark bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-inner overflow-x-auto whitespace-nowrap">
                        {reporteActivo.cadenaOriginal}
                      </p>
                    </div>
                  </div>

                  {/* 2. Tarjeta de la Firma Digital (Estilo Terminal Segura) */}
                  <div className="bg-brand-dark rounded-xl p-6 border border-gray-700 relative shadow-xl overflow-hidden">
                    <div className="absolute opacity-5 -right-4 -top-8">
                      <svg className="w-48 h-48 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 5c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm3 10c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" />
                      </svg>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-[11px] font-black text-brand-teal uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Firma Digital (ECDSA - Base64)
                      </h3>
                      <p className="font-mono text-sm text-gray-300 bg-black bg-opacity-50 p-4 rounded-lg break-all shadow-inner leading-relaxed border border-gray-800">
                        {reporteActivo.firmaDigital}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}