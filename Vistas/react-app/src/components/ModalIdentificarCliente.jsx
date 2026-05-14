import { useState } from 'react';
import { apiClient } from '../services/api';

export default function ModalIdentificarCliente({ isOpen, onClose, onClientFound, onRegisterNew }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cliente = await apiClient.searchClient(phone);
      
      // Verificamos si la respuesta tiene un 'nombre'. 
      // Si solo trae un "message" de error, o viene vacía (null), lo mandamos a registrar.
      if (cliente && cliente.nombre) {
        onClientFound(cliente); // ¡Es un cliente real! Vamos a cobrar.
      } else {
        onRegisterNew(phone); // ¡No existe! Vamos a registrarlo.
      }
      
    } catch (err) {
      setError('Error al conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-[2500] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="bg-brand-dark p-4 text-center">
          <h2 className="text-xl font-bold text-white">Identificar Cliente</h2>
        </div>
        <form onSubmit={handleBuscar} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Ingresa el teléfono del cliente para recuperar sus datos.
          </p>
          <input
            type="tel"
            placeholder="Ej. 5512345678"
            value={phone}
            onChange={(e) => {
              // Filtro mágico: Borra letras/espacios y bloquea en 15 caracteres
              const soloNumeros = e.target.value.replace(/\D/g, '');
              if (soloNumeros.length <= 15) {
                setPhone(soloNumeros);
              }
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:border-brand-dark outline-none text-center text-lg"
            required
            autoFocus
          />
          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading || phone.length === 0}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Continuar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 text-sm font-semibold hover:text-brand-dark"
            >
              Cancelar venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}