import React from 'react';

export default function TerminalVentas({ 
  products = [], 
  ticketItems = [], 
  total = 0, 
  username = 'Juan Pérez',
  onAddProduct,
  onEmptyTicket,
  onProcessPayment,
  onGenerateReport,
  onRegisterClient
}) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO */}
      <div className="w-2/3 p-6 flex flex-col h-full">
        
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brand-dark">Terminal para ventas</h1>
          <div className="text-brand-teal font-bold border-b-2 border-brand-teal pb-1">
            Empleado: {username}
          </div>
        </header>

        {/* Grid de Productos (con scroll independiente) */}
        <div className="grid grid-cols-3 gap-6 overflow-y-auto flex-1 pr-2 pb-4 cursor-default">
          {products.map((product, index) => (
            <div key={product.id || product.idProducto || index} className="bg-white rounded-xl shadow-sm border border-brand-light p-4 hover:shadow-md transition flex flex-col">
              
              <div className="h-32 bg-brand-light rounded-lg mb-4 flex items-center justify-center text-brand-dark text-sm font-medium border border-gray-200">
                {product.imagePlaceholder || '[Foto Producto]'}
              </div>
              <h3 className="font-bold text-brand-dark text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">Talla: {product.size}</p>

              <div className="flex justify-between items-center mt-auto">
                <div className="flex flex-col">
                  <span className="font-bold text-brand-teal text-lg leading-none">
                    ${product.price.toFixed(2)}
                  </span>
                  {/* Etiqueta pequeñita que dice cuántos quedan */}
                  <span className="text-[11px] font-bold text-gray-400 mt-1">
                    Disponibles: {product.stock}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={() => onAddProduct(product)}
                  disabled={product.stock === 0} // ¡Se bloquea si es 0!
                  className={`px-4 py-2 rounded-lg transition shadow-sm text-sm font-semibold ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' // Estilo apagado
                      : 'bg-brand-dark text-white hover:bg-brand-teal' // Estilo normal
                  }`}
                >
                  {product.stock === 0 ? 'Agotado' : '+ Agregar'}
                </button>
              </div>
            </div>
          ))}
          
          {/* Tarjeta de estado vacío si no hay productos */}
          {products.length === 0 && (
            <div className="col-span-3 flex items-center justify-center h-40 text-gray-400 font-medium">
              No hay productos disponibles en el catálogo.
            </div>
          )}
        </div>

        {/* SECCIÓN DE BOTONES INFERIORES */}
        <div className="pt-4 mt-2 border-t-2 border-gray-200 flex gap-4">
          <button 
            onClick={onGenerateReport}
            className="bg-brand-dark text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-teal transition shadow-md flex-1"
          >
            Generar reporte mensual
          </button>
          <button 
            onClick={onRegisterClient}
            className="bg-white text-brand-dark border-2 border-brand-dark font-bold py-3 px-6 rounded-xl hover:bg-brand-dark hover:text-white transition shadow-md flex-1"
          >
            Registrar cliente nuevo
          </button>
        </div>
      </div>

      {/* SECCIÓN DERECHA: TICKET */}
      <div className="w-1/3 bg-brand-light p-6 shadow-2xl flex flex-col border-l border-gray-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Ticket actual</h2>
          <button
            type="button"
            onClick={onEmptyTicket}
            disabled={ticketItems.length === 0}
            className="text-sm font-semibold text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 disabled:no-underline transition"
          >
            Vaciar ticket
          </button>
        </div>

        {/* Detalle de Ticket */}
        <div className="flex-1 overflow-y-auto pr-2">
          {ticketItems.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Agrega productos para ver el ticket.
            </div>
          ) : (
            ticketItems.map((item, index) => (
              <div key={item.id || item.idProducto || index} className="flex justify-between items-center bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
                <div>
                  <div className="font-bold text-brand-dark">{item.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.quantity} x ${item.price.toFixed(2)}</div>
                </div>
                <div className="text-brand-teal font-black text-lg">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen y Acción */}
        <div className="mt-4 pt-6 border-t-2 border-brand-teal bg-brand-light">
          <div className="flex justify-between text-2xl font-black text-brand-dark mb-6 px-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={onProcessPayment}
            disabled={total === 0}
            className="w-full bg-brand-primary text-white text-xl font-bold py-4 rounded-xl hover:bg-brand-accent hover:text-brand-dark transition duration-300 shadow-lg disabled:cursor-not-allowed disabled:opacity-60 flex justify-center items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Procesar pago seguro
          </button>
        </div>
        
      </div>
    </div>
  );
}