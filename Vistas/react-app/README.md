# React Views App - Terminal POS

Interfaz React para la Terminal de Empleado con integración de pago seguro.

## Requisitos previos

- Node.js 18+ y npm
- El backend (`terminal-empleado`) corriendo en `http://localhost:8081`

## Instalación y ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Vite abrirá automáticamente la app en `http://localhost:5173`.

## Flujo de la aplicación

1. **Login**: Ingresa credenciales (por defecto: `admin` / `admin123`)
   - Se conecta al endpoint `POST /api/auth/login` del backend
   - Realiza handshake criptográfico con el servidor central

2. **Punto de Venta**: Selecciona productos del catálogo
   - Se agregan items al ticket
   - Se calcula el total automáticamente

3. **Pago Seguro**: Ingresa número de tarjeta
   - Se cifra el payload con AES-256-GCM
   - Se envía al endpoint `POST /api/payment/test-send`
   - El backend se encarga del cifrado y envío al servidor central

## Componentes

- `LoginPantalla.jsx` - Formulario de autenticación
- `PuntoVenta.jsx` - Catálogo de productos y carrito
- `ModalPagoSeguro.jsx` - Modal de procesamiento de pago
- `api.js` - Cliente HTTP para llamadas al backend

## Variables de entorno (futuro)

Crear `.env` si necesitas cambiar la URL del backend:
```
VITE_API_URL=http://localhost:8081/api
```

## Estructura

- `src/App.jsx` - Control de navegación y estado
- `src/components/` - Componentes React
- `src/services/` - Cliente API
- `vite.config.js` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind CSS
