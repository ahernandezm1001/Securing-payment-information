import React, { useState } from 'react';

export default function LoginPantalla() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí conectarías con tu backend:
    // axios.post('/api/login', { username, password }) (LoginRequest)
    console.log("Enviando LoginRequest...", { username, password });
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 font-sans">
      {/* Tarjeta central de Login */}
      <div className="bg-brand-light p-10 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-brand-primary">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-1">Punto de Venta</h1>
          <p className="text-brand-teal font-semibold">Acceso de Empleados</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-brand-dark font-bold mb-2">Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:outline-none focus:border-brand-dark bg-white transition"
              placeholder="Ej. jperez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-brand-dark font-bold mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border-2 border-brand-teal focus:outline-none focus:border-brand-dark bg-white transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-dark text-white font-bold py-3 rounded-xl hover:bg-brand-teal transition duration-300 mt-6 shadow-lg text-lg"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}