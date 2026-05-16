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
        idCliente: cliente ? cliente.id : 1,
        idEmpleado: 1, 
        noTarjetaPago: cardNumber,
        montoTotal: total,
        detalles: ticketItems.map((item) => ({
          idProducto: item.id,
          cantidad: item.quantity,
          precioUnitario: item.price
        }))
      };

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
          <h2 className="text-2xl font-bold text-white">Procesar pago</h2>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} className="absolute top-5 right-5 text-gray-300 hover:text-white transition-colors text-2xl leading-none">
              &times;
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
                El ticket ha sido cifrado y almacenado correctamente.
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
            /* VISTA DE FORMULARIO DE PAGO (Estilo HTML clásico) */
            <div className="space-y-6">
              
              {/* Total a Cobrar */}
              <div className="bg-brand-dark p-6 rounded-xl text-center shadow-inner">
                <p className="text-brand-accent font-semibold mb-1 uppercase tracking-wider text-xs">Total a Cobrar</p>
                <p className="text-5xl font-black text-white">${total.toFixed(2)}</p>
              </div>

              {/* Datos del Cliente */}
              <div>
                <h3 className="font-extrabold text-brand-dark text-xl mb-4 border-b-2 border-brand-light pb-2">
                  Datos del cliente
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-brand-dark font-bold mb-2 text-sm">Nombre</label>
                    <input
                      type="text"
                      value={cliente?.nombre || 'Público en general'}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-dark font-bold mb-2 text-sm">Número de teléfono</label>
                    <input
                      type="text"
                      value={cliente?.numeroTelefono || cliente?.telefono || 'N/A'}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Input de Tarjeta */}
              <div className="pt-2">
                <label className="block text-brand-dark font-bold mb-2 text-sm">Número de tarjeta:</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, '');
                    if (soloNumeros.length <= 16) {
                      onCardNumberChange(soloNumeros);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:border-brand-dark focus:outline-none bg-white transition font-mono text-lg tracking-widest text-center"
                  placeholder="1234 5678 9012 3456"
                  disabled={isProcessing}
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 font-bold text-xs bg-red-50 p-3 rounded-lg border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={procesarPago}
                  disabled={isProcessing || cardNumber.length < 15}
                  className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-3 text-lg ${
                    isProcessing 
                      ? 'bg-brand-teal opacity-70 cursor-wait' 
                      : 'bg-brand-primary hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar cobro seguro'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition duration-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
              
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Atendido por: <span className="font-bold">{username}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}