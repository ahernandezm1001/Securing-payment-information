import React, { useState } from 'react';

export default function GenerarReporteModal({ isOpen, onClose, onGenerate }) {
  const [mes, setMes] = useState('2026-03');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Aquí llamarías a tu lógica de firma digital en el backend
    if (onGenerate) {
      await onGenerate(mes);
    }
    
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex items-center justify-center z-[1500] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-brand-dark p-5 text-center relative">
          <h2 className="text-2xl font-bold text-white">Generar reporte mensual</h2>
          {!isProcessing && (
            <button onClick={onClose} className="absolute top-5 right-5 text-brand-light hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="form-group">
              <label htmlFor="mesReporte" className="block text-brand-dark font-bold mb-3 text-center">
                Seleccione el mes (año actual):
              </label>
              <input 
                type="month" 
                id="mesReporte" 
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                min="2026-01" 
                max="2026-12" 
                required
                disabled={isProcessing}
                className="w-full text-xl font-semibold p-4 rounded-xl border-2 border-brand-teal focus:border-brand-dark focus:outline-none text-center cursor-pointer bg-brand-light bg-opacity-20 transition"
              />
            </div>

            <p className="text-sm text-gray-500 text-center italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
              El reporte se firmará digitalmente al ser generado.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-2 text-lg ${
                  isProcessing 
                    ? 'bg-brand-teal opacity-70' 
                    : 'bg-brand-primary hover:bg-brand-dark'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Firmando reporte...
                  </>
                ) : (
                  'Generar y Firmar reporte'
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition duration-300"
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