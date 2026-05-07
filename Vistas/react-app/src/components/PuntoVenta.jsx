export default function PuntoVenta({ products, ticketItems, total, onAddProduct, onProcessPayment, username }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-2/3 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">Terminal POS - Ropa</h1>
          <div className="text-brand-teal font-semibold">Empleado: {username}</div>
        </header>

        <div className="grid grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-brand-light p-4 hover:shadow-md transition">
              <div className="h-32 bg-brand-light rounded-lg mb-4 flex items-center justify-center text-brand-dark">
                {product.name}
              </div>
              <h3 className="font-bold text-brand-dark">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Talla: {product.size}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-brand-teal">${product.price.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onAddProduct(product)}
                  className="bg-brand-dark text-white px-3 py-1 rounded hover:bg-brand-teal transition"
                >
                  + Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/3 bg-brand-light p-6 shadow-l flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Ticket Actual</h2>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm text-brand-dark underline hover:text-brand-teal"
          >
            Reiniciar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {ticketItems.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Agrega productos para ver el ticket.
            </div>
          ) : (
            ticketItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg mb-2 shadow-sm">
                <div>
                  <p className="font-semibold text-brand-dark">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                </div>
                <span className="text-brand-teal font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t-2 border-brand-teal">
          <div className="flex justify-between text-xl font-bold text-brand-dark mb-6">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={onProcessPayment}
            disabled={total === 0}
            className="w-full bg-brand-primary text-white text-xl font-bold py-4 rounded-xl hover:bg-brand-accent hover:text-brand-dark transition duration-300 shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Procesar Pago Seguro
          </button>
        </div>
      </div>
    </div>
  );
}
