import React, { useState } from 'react';
import { apiClient } from '../services/api';

export default function CrearEmpleadoModal({ isOpen, onClose }) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nombre || !password) return alert("Llena todos los campos");

    setIsProcessing(true);
    try {
      const response = await apiClient.crearEmpleado(nombre, password);
      
      if (response.success && response.llavePrivada) {
        // ¡LA MAGIA DE LA DESCARGA USB!
        // 1. Creamos un Blob (archivo virtual) con el contenido de la llave
        const blob = new Blob([response.llavePrivada], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // 2. Creamos un enlace invisible y forzamos el clic
        const link = document.createElement('a');
        link.href = url;
        const nombreArchivo = nombre.trim().replace(/\s+/g, '_').toLowerCase();
        link.setAttribute('download', `llave_privada_${nombreArchivo}.key`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert("Empleado creado. La llave privada (.key) se ha descargado automáticamente. ¡Guárdala en la USB del empleado!");
        setNombre('');
        setPassword('');
        onClose();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-[3000] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in">
        
        <div className="bg-brand-dark p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Registrar Nuevo Empleado
          </h2>
          {!isProcessing && (
            <button onClick={onClose} className="text-gray-300 hover:text-white text-2xl leading-none">&times;</button>
          )}
        </div>

        <form onSubmit={handleCrear} className="p-6">
          <div className="mb-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nombre Completo</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-teal focus:outline-none bg-gray-50 text-brand-dark font-bold"
              placeholder="Ej. María García"
              disabled={isProcessing}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-teal focus:outline-none bg-gray-50 text-brand-dark font-bold"
              placeholder="••••••••"
              disabled={isProcessing}
            />
          </div>

          <div className="bg-brand-light p-4 rounded-lg mb-6 border border-brand-teal text-xs text-brand-dark">
            <span className="font-bold">Aviso de Seguridad:</span> Al registrar al empleado, se generará un par de llaves ECDSA. La llave privada se descargará <b>inmediatamente</b> en un archivo <code>.key</code>. Inserta la USB del empleado antes de continuar.
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} disabled={isProcessing} className="flex-1 bg-white border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={isProcessing} className="flex-[2] bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition shadow-md">
              {isProcessing ? 'Generando llaves...' : 'Registrar y Descargar Llave'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}