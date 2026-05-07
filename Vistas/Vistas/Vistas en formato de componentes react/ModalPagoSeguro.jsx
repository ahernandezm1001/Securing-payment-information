import React, { useState } from 'react';

// Se asume que recibe el total del carrito y funciones de control (isOpen, onClose) como props
export default function ModalPagoSeguro({ isOpen = true, onClose, total = 850.00 }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const procesarPago = () => {
    setIsProcessing(true);
    
    // Simulación de los servicios criptográficos (KeyExchangeService, EncryptionService, FPE)
    // y la petición final a PaymentController
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
        
        {/* Encabezado del Modal */}
        <div className="bg-brand-dark p-5 text-center relative">
          <h2 className="text-2xl font-bold text-white">Procesar Pago</h2>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} className="absolute top-5 right-5 text-gray-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <div className="p-8">
          {/* VISTA 1: ÉXITO */}
          {isSuccess ? (
            <div className="text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark mb-2">¡Transacción Exitosa!</h3>
              <p className="text-gray-500 mb-8 font-medium">El ticket seguro ha sido generado y almacenado.</p>
              <button 
                onClick={onClose}
                className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-teal transition shadow-md"
              >
                Imprimir y Cerrar
              </button>
            </div>
          ) : (
            
            /* VISTA 2: FORMULARIO DE PAGO */
            <div className="space-y-6">
              <div className="bg-brand-light p-6 rounded-xl text-center border border-brand-teal border-opacity-30">
                <p className="text-brand-dark font-semibold mb-1 uppercase tracking-wider text-sm">Total a Cobrar</p>
                <p className="text-5xl font-extrabold text-brand-teal">${total.toFixed(2)}</p>
              </div>

              <div className="space-y-4">
                <p className="text-brand-dark font-bold">Método de Pago:</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Botón activo simulado (Tarjeta) */}
                  <button className="border-2 border-brand-teal bg-brand-light text-brand-dark font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    Tarjeta
                  </button>
                  {/* Botón inactivo */}
                  <button className="border-2 border-gray-200 text-gray-400 font-bold py-3 rounded-xl hover:border-brand-teal hover:text-brand-teal transition flex justify-center items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Efectivo
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={procesarPago}
                  disabled={isProcessing}
                  className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-3 text-lg
                    ${isProcessing ? 'bg-brand-teal opacity-70 cursor-wait' : 'bg-brand-primary hover:bg-brand-accent hover:text-brand-dark'}`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando Payload Cifrado...
                    </>
                  ) : 'Confirmar Cobro'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}