import React, { useState } from 'react';

export default function AdminReportes() {
  const [reporteActivo, setReporteActivo] = useState('Marzo - 2026');

  // Datos simulados basados en tu HTML (luego los puedes traer de tu API)
  const reportes = [
    { id: 1, mes: 'Marzo - 2026', empleado: 'Juan Pérez', estado: 'activo' },
    { id: 2, mes: 'Febrero - 2026', empleado: 'María López', estado: 'inactivo' }
  ];

  const ventasMarzo = [
    {
      id: '001',
      fecha: '15/03/2026 - 14:30 hrs',
      productos: [
        { nombre: '1x Chamarra de Mezclilla', precio: 850.00 },
        { nombre: '2x Playeras Básicas Blancas', precio: 400.00 }
      ],
      metodoPago: '1234 5678 9012 3456',
      total: 1250.00
    },
    {
      id: '002',
      fecha: '16/03/2026 - 10:15 hrs',
      productos: [
        { nombre: '1x Pantalón de Vestir (Talla 32)', precio: 650.00 }
      ],
      metodoPago: '9876 5432 1098 7654',
      total: 650.00
    }
  ];

  const verificarFirma = () => {
    // Aquí irá tu lógica para validar el payload con el backend
    alert('Verificando firma criptográfica...');
  };

  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-brand-dark text-white px-8 py-4 flex justify-between items-center shadow-md h-[70px]">
        <div className="text-xl font-bold">
          Bienvenido Don Diego
        </div>
        <div className="flex gap-4">
          <button className="bg-brand-teal text-white font-bold py-2 px-4 rounded-lg shadow-sm transition">
            Reportes mensuales
          </button>
          <button className="bg-brand-primary text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-brand-accent transition shadow-sm">
            Ventas
          </button>
        </div>
      </header>

      {/* ADMIN LAYOUT */}
      <div className="flex h-[calc(100vh-70px)]">
        
        {/* SIDEBAR: Lista de Reportes */}
        <div className="w-1/3 bg-brand-light p-6 overflow-y-auto border-r-2 border-brand-teal z-10 shadow-lg">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Reportes recibidos</h2>

          {reportes.map((rep) => (
            <div 
              key={rep.id} 
              className={`bg-white p-4 rounded-xl mb-4 shadow-sm transition-transform duration-200 cursor-pointer ${
                reporteActivo === rep.mes 
                  ? 'border-l-8 border-brand-primary transform scale-[1.02]' 
                  : 'border-l-4 border-brand-teal hover:border-brand-primary'
              }`}
              onClick={() => setReporteActivo(rep.mes)}
            >
              <h3 className="font-bold text-brand-dark text-lg">{rep.mes}</h3>
              <p className="text-gray-500 font-semibold text-sm mt-1">Empleado: {rep.empleado}</p>
              
              <div className="flex gap-2 mt-4">
                <button className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition ${
                  reporteActivo === rep.mes ? 'bg-brand-primary text-white' : 'bg-brand-teal text-white hover:bg-brand-primary'
                }`}>
                  Ver detalles
                </button>
                <button className="flex-1 py-2 px-2 text-sm font-bold rounded-lg bg-[#e07a5f] text-white hover:bg-[#d06a4f] border border-[#d06a4f] transition">
                  Descartar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENIDO: Detalle del Reporte */}
        <div className="w-2/3 p-8 overflow-y-auto bg-gray-50">
          
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex justify-between items-center border-t-4 border-brand-dark">
            <div>
              <h1 className="text-brand-dark text-2xl font-bold mb-2">Reporte de ventas - {reporteActivo}</h1>
              <p className="text-brand-teal font-bold text-lg">Generado por: Juan Pérez</p>
            </div>
            <div>
              <button 
                onClick={verificarFirma}
                className="bg-brand-dark text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-teal transition shadow-md flex items-center gap-2"
              >
                <span>🔐</span> Verificar firma
              </button>
            </div>
          </div>

          <h2 className="text-brand-dark text-xl font-bold mb-6">Desglose de Ventas del Mes</h2>

          {ventasMarzo.map((venta) => (
            <div key={venta.id} className="bg-white border border-brand-light rounded-xl p-5 mb-5 shadow-sm">
              <div className="flex justify-between border-b-2 border-brand-light pb-3 mb-3">
                <span className="font-bold text-gray-500">📅 Fecha: {venta.fecha}</span>
                <span className="font-bold text-brand-teal">Venta #{venta.id}</span>
              </div>
              
              <ul className="mb-4 space-y-2">
                {venta.productos.map((prod, index) => (
                  <li key={index} className="flex justify-between text-brand-dark text-[0.95rem] font-medium">
                    <span>{prod.nombre}</span>
                    <span>${prod.precio.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">MÉTODO DE PAGO</p>
                  <p className="text-brand-dark font-mono text-lg font-medium">💳 {venta.metodoPago}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold mb-1">TOTAL PAGADO</p>
                  <p className="text-2xl font-black text-brand-primary">${venta.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}