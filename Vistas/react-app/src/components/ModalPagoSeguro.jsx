import { useState } from 'react';
import { apiClient } from '../services/api';

export default function ModalPagoSeguro({ 
  isOpen = false, 
  onClose, 
  total = 0, 
  ticketItems = [], 
  username = '',     // Nombre del empleado
  cliente = null,    // Datos del cliente identificado (nombre, telefono, etc.)
  cardNumber = '', 
  onCardNumberChange = () => {} 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const procesarPago = async () => {
    if (!cardNumber.trim() || cardNumber.length < 15) {
      setError('Por favor ingresa un número de tarjeta válido');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const ticketData = {
        idCliente: cliente ? cliente.id : 1, // Usamos el ID del cliente identificado o uno por defecto
        idEmpleado: 1, // Esto vendría del estado de login real
        noTarjetaPago: cardNumber,
        montoTotal: total,
        detalles: ticketItems.map((item) => ({
          idProducto: item.id,
          cantidad: item.quantity,
          precioUnitario: item.price
        }))
      };

      // Llamada al backend (PaymentController)
      await apiClient.sendPayment(ticketData);
      
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Error al procesar el pago seguro');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-fade-in">
        
        {/* Cabecera del Modal */}
        <div className="bg-brand-dark p-5 text-center relative">
          <h2 className="text-2xl font-bold text-white">Procesar Pago Seguro</h2>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} className="absolute top-5 right-5 text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-8">
          {isSuccess ? (
            /* VISTA DE ÉXITO */
            <div className="text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark mb-2">¡Venta Exitosa!</h3>
              <p className="text-gray-500 mb-8 font-medium">
                El ticket ha sido cifrado y almacenado. La firma digital garantiza la integridad del reporte mensual.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-teal transition shadow-md text-lg"
              >
                Cerrar y Nuevo Ticket
              </button>
            </div>
          ) : (
            /* VISTA DE FORMULARIO DE PAGO */
            <div className="space-y-6">
              
              {/* Información del Cliente (Si existe) */}
              {cliente ? (
                <div className="bg-brand-light bg-opacity-40 p-4 rounded-xl border border-brand-teal border-opacity-30">
                  <p className="text-[10px] text-brand-teal font-black uppercase tracking-widest mb-1">Cliente Identificado</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-white font-bold">
                      {/* Si hay nombre, toma la letra, si no, pon un ícono por defecto */}
                      {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div>
                      <p className="text-brand-dark font-bold leading-tight">
                        {cliente.nombre || 'Cliente sin nombre'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Tel: {cliente.numeroTelefono || cliente.telefono || 'Sin teléfono'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center">
                  <p className="text-xs text-gray-500 italic">Venta al público en general</p>
                </div>
              )}

              {/* Total a Cobrar */}
              <div className="bg-brand-dark p-6 rounded-xl text-center shadow-inner">
                <p className="text-brand-accent font-semibold mb-1 uppercase tracking-wider text-xs">Total a Cobrar</p>
                <p className="text-5xl font-black text-white">${total.toFixed(2)}</p>
              </div>

              {/* Métodos de Pago */}
              <div className="space-y-3">
                <p className="text-brand-dark font-bold text-sm">Seleccione Método:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="border-2 border-brand-teal bg-brand-light text-brand-dark font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm">
                    💳 Tarjeta
                  </button>
                  <button className="border-2 border-gray-100 text-gray-400 font-bold py-3 rounded-xl hover:border-brand-teal hover:text-brand-teal transition flex justify-center items-center gap-2">
                    💵 Efectivo
                  </button>
                </div>
              </div>

              {/* Input de Tarjeta */}
              <div>
                <label className="block text-brand-dark font-bold mb-2 text-sm">Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    // Filtro para aceptar solo números y máximo 16 caracteres
                    const soloNumeros = e.target.value.replace(/\D/g, '');
                    if (soloNumeros.length <= 16) {
                      onCardNumberChange(soloNumeros);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:border-brand-dark focus:outline-none bg-white transition font-mono text-lg tracking-widest text-center"
                  placeholder="1234567890123456"
                  disabled={isProcessing}
                />
              </div>

              {error && (
                <div className="text-red-600 font-bold text-xs bg-red-50 p-3 rounded-lg border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              {/* Botón de Acción */}
              <div className="pt-2">
                <button
                  onClick={procesarPago}
                  disabled={isProcessing || cardNumber.length < 15}
                  className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-3 text-lg ${
                    isProcessing 
                      ? 'bg-brand-teal opacity-70 cursor-wait' 
                      : 'bg-brand-primary hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cifrando Payload...
                    </>
                  ) : (
                    'Confirmar y Cobrar'
                  )}
                </button>
              </div>
              
              <p className="text-[10px] text-gray-400 text-center">
                Atendido por: <span className="font-bold">{username}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}