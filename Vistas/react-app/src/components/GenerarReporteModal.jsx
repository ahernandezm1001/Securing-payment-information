import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export default function GenerarReporteModal({ isOpen, onClose, onGenerate, idEmpleado }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [llavePrivada, setLlavePrivada] = useState(null);
  
  // --- ESTADOS DE LA TABLA ---
  const [ventasDelMes, setVentasDelMes] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  
  // --- LÓGICA DE FECHAS DINÁMICAS ---
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth(); 

  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual.toString());
  const [mesSeleccionado, setMesSeleccionado] = useState('');

  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);
  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const mesesDisponibles = anioSeleccionado === anioActual.toString()
    ? nombresMeses.slice(0, mesActual + 1)
    : nombresMeses;

  useEffect(() => {
    if (anioSeleccionado === anioActual.toString()) {
      const indiceMes = nombresMeses.indexOf(mesSeleccionado);
      if (indiceMes > mesActual) {
        setMesSeleccionado('');
      }
    }
  }, [anioSeleccionado]);

  const periodoFinal = mesSeleccionado ? `${mesSeleccionado} ${anioSeleccionado}` : '';
  const granTotal = ventasDelMes.reduce((sum, venta) => sum + venta.monto, 0);

  // --- CARGAR DATOS DESDE LA BASE DE DATOS ---
  useEffect(() => {
    if (mesSeleccionado && anioSeleccionado) {
      const cargarVentasDeLaBase = async () => {
        setCargandoVentas(true);
        setVentasDelMes([]); // Limpiamos la tabla mientras carga
        try {
          const datosReales = await apiClient.getVentasPorMes(anioSeleccionado, mesSeleccionado, idEmpleado);
          setVentasDelMes(datosReales);
        } catch (error) {
          console.error("No se pudieron cargar las ventas:", error);
          setVentasDelMes([]); 
        } finally {
          setCargandoVentas(false);
        }
      };
      cargarVentasDeLaBase();
    } else {
      setVentasDelMes([]); 
    }
  }, [mesSeleccionado, anioSeleccionado]);

  // Reiniciar estados al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setLlavePrivada(null);
      setMesSeleccionado('');
      setAnioSeleccionado(anioActual.toString());
      setIsProcessing(false);
      setVentasDelMes([]);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.key') || file.name.endsWith('.txt'))) {
      setLlavePrivada(file);
    } else if (file) {
      alert("Por favor, selecciona un archivo de llave válido (.key)");
      e.target.value = null;
    }
  };

  const handleFirmarYGuardar = async () => {
    if (!llavePrivada || !mesSeleccionado) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const contenidoLlave = e.target.result;
      try {
        await onGenerate(periodoFinal, contenidoLlave, ventasDelMes);
        setIsProcessing(false);
        onClose();
      } catch (error) {
        setIsProcessing(false);
      }
    };
    reader.readAsText(llavePrivada);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-[3000] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col transform transition-all animate-fade-in">
        
        {/* Cabecera */}
        <div className="bg-brand-dark p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generar Reporte de Ventas
          </h2>
          {!isProcessing && (
            <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors text-2xl leading-none">&times;</button>
          )}
        </div>

        <div className="p-6 flex flex-col h-[75vh] max-h-[650px]">
          
          {/* Selector Dinámico de Año y Mes */}
          <div className="mb-6 grid grid-cols-3 gap-6 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Año</label>
              <select 
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-brand-teal focus:outline-none bg-white font-bold text-brand-dark cursor-pointer"
              >
                {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Mes a reportar</label>
              <select 
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-lg border-2 border-brand-teal focus:outline-none bg-white font-bold text-brand-dark cursor-pointer"
              >
                <option value="" disabled>-- Elegir Mes --</option>
                {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total acumulado</p>
              <p className="text-2xl font-black text-brand-teal">
                {mesSeleccionado ? `$${granTotal.toFixed(2)}` : '---'}
              </p>
            </div>
          </div>

          {/* Tabla de Previsualización */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl mb-6 shadow-inner bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-[10px] font-black text-gray-400 uppercase">Fecha de Venta</th>
                  <th className="p-3 text-[10px] font-black text-gray-400 uppercase">Detalle de Productos</th>
                  <th className="p-3 text-[10px] font-black text-gray-400 uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {/* 1. Estado: No ha seleccionado mes */}
                {!mesSeleccionado ? (
                  <tr>
                    <td colSpan="3" className="p-12 text-center text-gray-400 italic">
                      Selecciona un mes y año para cargar la previsualización de ventas.
                    </td>
                  </tr>
                ) : 
                
                /* 2. Estado: Cargando datos */
                cargandoVentas ? (
                  <tr>
                    <td colSpan="3" className="p-16 text-center text-brand-teal font-bold animate-pulse">
                      <div className="flex justify-center items-center gap-3">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"></path>
                        </svg>
                        Sincronizando ventas del servidor...
                      </div>
                    </td>
                  </tr>
                ) : 
                
                /* 3. Estado: Base de datos vacía (0 ventas) */
                ventasDelMes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-16 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        No hay ventas registradas en este periodo.
                      </div>
                    </td>
                  </tr>
                ) : 
                
                /* 4. Estado: Con datos exitosos */
                (
                  ventasDelMes.map((venta) => (
                    <tr key={venta.id} className="hover:bg-brand-light hover:bg-opacity-20 transition-colors">
                      <td className="p-3 text-xs text-gray-500 font-mono">{venta.fecha}</td>
                      <td className="p-3 text-sm text-brand-dark font-semibold">{venta.productos}</td>
                      <td className="p-3 text-sm font-bold text-brand-teal text-right">${venta.monto.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sección de Firma */}
          <div className={`rounded-xl p-5 mb-6 border-2 border-dashed transition-all ${
            mesSeleccionado && ventasDelMes.length > 0
              ? 'bg-brand-light bg-opacity-30 border-brand-teal' 
              : 'bg-gray-50 border-gray-200 opacity-50'
          }`}>
            <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Firma Digital (Llave Privada)
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Adjunte su archivo <b>.key</b> para firmar digitalmente el reporte de <b>{periodoFinal || 'el periodo elegido'}</b>.
            </p>
            
            <input 
              type="file" 
              accept=".key,.txt" 
              onChange={handleFileChange}
              disabled={isProcessing || !mesSeleccionado || ventasDelMes.length === 0}
              className="block w-full text-xs text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs file:font-black
                file:bg-brand-teal file:text-white
                hover:file:bg-brand-dark transition cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleFirmarYGuardar}
              disabled={isProcessing || !llavePrivada || !mesSeleccionado || ventasDelMes.length === 0}
              className={`flex-[2] text-white font-bold py-3 rounded-xl shadow-lg transition flex justify-center items-center gap-2 ${
                isProcessing || !llavePrivada || !mesSeleccionado || ventasDelMes.length === 0
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-brand-primary hover:bg-brand-dark'
              }`}
            >
              {isProcessing ? 'Firmando y Enviando...' : 'Firmar y Guardar Reporte'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}