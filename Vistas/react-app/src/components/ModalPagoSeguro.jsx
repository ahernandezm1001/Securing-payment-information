import { useState } from 'react';
import { apiClient } from '../services/api';

export default function ModalPagoSeguro({ 
  isOpen = false, 
  onClose, 
  total = 0, 
  ticketItems = [], 
  username = '',
  cardNumber = '',
  onCardNumberChange = () => {} 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const procesarPago = async () => {
    if (!cardNumber.trim()) {
      setError('Por favor ingresa un número de tarjeta');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const ticketData = {
        idCliente: 1,
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
      setError(err.message || 'Error al procesar el pago');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
        <div className="bg-brand-dark p-5 text-center relative">
          <h2 className="text-2xl font-bold text-white">Procesar Pago</h2>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} className="absolute top-5 right-5 text-gray-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark mb-2">¡Transacción Exitosa!</h3>
              <p className="text-gray-500 mb-8 font-medium">El ticket seguro ha sido cifrado y almacenado en el servidor central.</p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-teal transition shadow-md"
              >
                Cerrar y Nuevo Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-brand-light p-6 rounded-xl text-center border border-brand-teal border-opacity-30">
                <p className="text-brand-dark font-semibold mb-1 uppercase tracking-wider text-sm">Total a Cobrar</p>
                <p className="text-5xl font-extrabold text-brand-teal">${total.toFixed(2)}</p>
              </div>

              <div className="space-y-4">
                <p className="text-brand-dark font-bold">Método de Pago:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="border-2 border-brand-teal bg-brand-light text-brand-dark font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm">
                    Tarjeta
                  </button>
                  <button className="border-2 border-gray-200 text-gray-400 font-bold py-3 rounded-xl hover:border-brand-teal hover:text-brand-teal transition flex justify-center items-center gap-2">
                    Efectivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-brand-dark font-bold mb-2">Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => onCardNumberChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:outline-none focus:border-brand-dark bg-white transition"
                  placeholder="1234 5678 9012 3456"
                  disabled={isProcessing}
                />
              </div>

              {error && <div className="text-red-600 font-bold text-sm">{error}</div>}

              <div className="pt-6">
                <button
                  onClick={procesarPago}
                  disabled={isProcessing || !cardNumber.trim()}
                  className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-3 text-lg ${
                    isProcessing ? 'bg-brand-teal opacity-70 cursor-wait' : 'bg-brand-primary hover:bg-brand-accent hover:text-brand-dark disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando Payload Cifrado...
                    </>
                  ) : (
                    'Confirmar Cobro'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
