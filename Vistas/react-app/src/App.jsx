import { useMemo, useState } from 'react';
import LoginPantalla from './components/LoginPantalla';
import PuntoVenta from './components/PuntoVenta';
import ModalPagoSeguro from './components/ModalPagoSeguro';

const products = [
  { id: 1, name: 'Chamarra de Mezclilla', price: 850, size: 'M' },
  { id: 2, name: 'Playera Básica', price: 320, size: 'L' },
  { id: 3, name: 'Pantalón Casual', price: 670, size: '32' }
];

export default function App() {
  const [page, setPage] = useState('login');
  const [username, setUsername] = useState('');
  const [ticketItems, setTicketItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const total = useMemo(
    () => ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [ticketItems]
  );

  const handleLogin = (user) => {
    setUsername(user);
    setPage('pos');
  };

  const handleAddProduct = (product) => {
    setTicketItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const handleProcessPayment = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCardNumber('');
    setTicketItems([]);
  };

  return (
    <>
      {page === 'login' ? (
        <LoginPantalla onLogin={handleLogin} />
      ) : (
        <PuntoVenta
          products={products}
          ticketItems={ticketItems}
          total={total}
          onAddProduct={handleAddProduct}
          onProcessPayment={handleProcessPayment}
          username={username}
        />
      )}

      <ModalPagoSeguro
        isOpen={showModal}
        total={total}
        onClose={handleCloseModal}
        ticketItems={ticketItems}
        username={username}
        cardNumber={cardNumber}
        onCardNumberChange={setCardNumber}
      />
    </>
  );
}
