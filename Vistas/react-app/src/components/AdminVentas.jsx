import React, { useState } from 'react';

export default function AdminVentas() {
  const [clienteActivo, setClienteActivo] = useState('Ana Alcántara');

  // Datos simulados extraídos de tu HTML
  const clientes = [
    { id: 1, nombre: 'Ana Alcántara', tarjeta: '1234 5678 9012 3456' },
    { id: 2, nombre: 'Alejandro Martínez', tarjeta: '9876 5432 1098 7654' }
  ];

  const historialVentas = [
    {
      id: '001',
      fecha: '15/03/2026 - 14:30 hrs',
      productos: [
        { nombre: '1x Chamarra de Mezclilla', precio: 850.00 },
        { nombre: '2x Playeras Básicas Blancas', precio: 400.00 }
      ],
      total: 1250.00
    },
    {
      id: '002',
      fecha: '16/03/2026 - 10:15 hrs',
      productos: [
        { nombre: '1x Pantalón de Vestir (Talla 32)', precio: 650.00 }
      ],
      total: 650.00
    }
  ];

  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="bg-brand-dark text-white px-8 py-4 flex justify-between items-center shadow-md h-[70px]">
        <div className="text-xl font-bold">Bienvenido Don Diego</div>
        <div className="flex gap-4">
          <button className="bg-brand-primary text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-brand-accent transition shadow-sm">
            Reportes mensuales
          </button>
          <button className="bg-brand-teal text-white font-bold py-2 px-4 rounded-lg shadow-sm transition">
            Ventas
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-70px)]">
        
        {/* CONTENIDO PRINCIPAL: Desglose de Ventas */}
        <div className="w-2/3 p-8 overflow-y-auto bg-gray-50">
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-brand-dark">
            <h1 className="text-brand-dark text-2xl font-bold mb-2">
              Desglose de ventas de {clienteActivo}
            </h1>
            <p className="text-brand-teal font-bold text-lg">
              No. de tarjeta cifrado: {clientes.find(c => c.nombre === clienteActivo)?.tarjeta}
            </p>
          </div>

          {historialVentas.map((venta) => (
            <div key={venta.id} className="bg-white border border-brand-light rounded-xl p-5 mb-5 shadow-sm">
              <div className="flex justify-between border-b-2 border-brand-light pb-3 mb-3">
                <span className="font-bold text-gray-500">📅 Fecha: {venta.fecha}</span>
                <span className="font-bold text-brand-teal">Venta #{venta.id}</span>
              </div>
              
              <ul className="mb-4 space-y-2">
                {venta.productos.map((prod, index) => (
                  <li key={index} className="flex justify-between text-brand-dark text-[0.95rem]">
                    <span>{prod.nombre}</span>
                    <span>${prod.precio.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Método de Pago</p>
                  <p className="text-brand-dark font-mono text-lg font-medium">💳 {clientes.find(c => c.nombre === clienteActivo)?.tarjeta}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Total Pagado</p>
                  <p className="text-2xl font-black text-brand-primary">${venta.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR: Clientes Registrados */}
        <div className="w-1/3 bg-brand-light p-6 overflow-y-auto border-l-2 border-brand-teal shadow-lg">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Clientes registrados</h2>

          {clientes.map((cliente) => (
            <div 
              key={cliente.id} 
              className={`bg-white p-4 rounded-xl mb-4 shadow-sm transition-all cursor-pointer ${
                clienteActivo === cliente.nombre 
                  ? 'border-l-8 border-brand-primary transform scale-[1.02]' 
                  : 'border-l-4 border-brand-teal hover:border-brand-primary'
              }`}
              onClick={() => setClienteActivo(cliente.nombre)}
            >
              <h3 className="font-bold text-brand-dark text-lg">{cliente.nombre}</h3>
              <p className="text-gray-500 font-semibold text-xs mt-1">Tarjeta: {cliente.tarjeta}</p>
              
              <div className="flex gap-2 mt-4">
                <button className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition ${
                  clienteActivo === cliente.nombre ? 'bg-brand-primary text-white' : 'bg-brand-teal text-white'
                }`}>
                  Ver detalles
                </button>
                <button className="flex-1 py-2 px-2 text-xs font-bold rounded-lg bg-[#e07a5f] text-white hover:bg-[#d06a4f] transition">
                  Descartar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}