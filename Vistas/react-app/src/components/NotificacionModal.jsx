import React from 'react';

export default function NotificacionModal({ isOpen, onClose, tipo = 'exito', titulo, mensaje }) {
  if (!isOpen) return null;

  // Configuraciones dinámicas según el tipo (basado en tus archivos HTML)
  const configs = {
    exito: {
      bgColor: 'bg-brand-light',
      borderColor: 'border-brand-teal',
      textColor: 'text-brand-teal',
      btnColor: 'bg-brand-primary'
    },
    error: {
      bgColor: 'bg-[#fee2e2]', // Rojo tenue de tus archivos
      borderColor: 'border-[#fecaca]',
      textColor: 'text-[#991b1b]',
      btnColor: 'bg-brand-primary'
    }
  };

  const style = configs[tipo] || configs.exito;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-fade-in">
        
        {/* Header */}
        <div className="bg-brand-dark p-4 text-center relative">
          <h2 className="text-xl font-bold text-white">{titulo}</h2>
          <button onClick={onClose} className="absolute top-4 right-4 text-brand-light hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Recuadro Informativo */}
          <div className={`${style.bgColor} ${style.borderColor} border p-4 rounded-xl text-center mb-6`}>
            <p className={`${style.textColor} font-bold uppercase text-xs tracking-wider`}>
              {mensaje}
            </p>
          </div>

          {/* Texto de advertencia opcional (usado en reportes) */}
          {tipo === 'error' && (
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed px-2">
              Es posible que la información haya sido <strong>vulnerada</strong>. Por seguridad, verifique el origen antes de continuar.
            </p>
          )}

          <button
            onClick={onClose}
            className={`w-full ${style.btnColor} text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-md text-lg`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}