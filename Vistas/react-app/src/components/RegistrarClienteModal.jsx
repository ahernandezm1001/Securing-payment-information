import { useState } from 'react';
import { apiClient } from '../services/api'; 

export default function ModalRegistrarCliente({ isOpen = false, onClose, onSave }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleGuardar = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim() || !telefono.trim() || !tarjeta.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const clientData = {
        nombre,
        numeroTelefono: telefono,
        numeroTarjeta: tarjeta
      };
      
      // Enviamos al backend y esperamos la respuesta con el ID generado
      const clienteGuardadoEnBD = await apiClient.registerClient(clientData);
      
      if (onSave) {
        // Le pasamos el cliente real de la BD al App.jsx para que abra el modal de pago
        await onSave(clienteGuardadoEnBD);
      }

      setIsProcessing(false);
      
      // Limpiar formulario al cerrar
      setNombre('');
      setTelefono('');
      setTarjeta('');
      onClose();
      
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Error al cifrar y guardar la información');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
        
        {/* Header del Modal */}
        <div className="bg-brand-dark p-5 text-center relative">
          <h2 className="text-2xl font-bold text-white">Registrar Cliente</h2>
          {!isProcessing && (
            <button 
              onClick={onClose} 
              className="absolute top-5 right-5 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-8">
          <h3 className="font-extrabold text-brand-dark text-xl mb-6 border-b-2 border-brand-light pb-2">
            Datos del cliente
          </h3>

          <form onSubmit={handleGuardar} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-brand-dark font-bold mb-2">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:outline-none focus:border-brand-dark bg-white transition"
                placeholder="Ej. Juan Pérez"
                disabled={isProcessing}
                required
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-brand-dark font-bold mb-2">Número de teléfono</label>
              <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => {
                  // Filtra para que solo acepte números y máximo 15 caracteres
                  const soloNumeros = e.target.value.replace(/\D/g, '');
                  if (soloNumeros.length <= 15) {
                    setTelefono(soloNumeros);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:outline-none focus:border-brand-dark bg-white transition"
                placeholder="5512345678"
                disabled={isProcessing}
                required
              />
            </div>

            <div>
              <label htmlFor="tarjeta" className="block text-brand-dark font-bold mb-2">Número de tarjeta</label>
              <input
                type="text"
                id="tarjeta"
                value={tarjeta}
                onChange={(e) => {
                  // Filtra para que solo acepte números y máximo 16 caracteres
                  const soloNumeros = e.target.value.replace(/\D/g, '');
                  if (soloNumeros.length <= 16) {
                    setTarjeta(soloNumeros);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:outline-none focus:border-brand-dark bg-white transition"
                placeholder="1234567890123456"
                disabled={isProcessing}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 font-bold text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-2 text-md ${
                  isProcessing 
                    ? 'bg-brand-teal opacity-70 cursor-wait' 
                    : 'bg-brand-primary hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cifrando e intentando guardar...
                  </>
                ) : (
                  'Cifrar y Guardar información'
                )}
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
          </form>
        </div>
      </div>
    </div>
  );
}