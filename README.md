# Práctica 3 — Tienda en línea (API REST con JWT)

Implementación de una pequeña tienda con registro, autenticación JWT, gestión de productos y carritos.

## Requisitos
- Node.js 18+
- MongoDB 6+ (o Docker)
- npm

## Variables de entorno
Crea un archivo `.env` copiando desde `.env.example` y ajusta los valores:
```bash
cp .env.example .env
```

## Correr en desarrollo
```bash
npm install
npm run dev
```
La API inicia por defecto en `http://localhost:${PORT:-3000}`

## Endpoints

### Públicos
- **POST /api/auth/register**
  - Body: `{ "username":"...", "email":"...", "password":"..." }`
  - Respuesta: `201` con `{ "message":"User created" }`

- **POST /api/auth/login**
  - Body: `{ "email":"...", "password":"..." }`
  - Respuesta: `200` con `{ "token":"<JWT>" }`

- **GET /api/products**
  - Respuesta: `200` con `[{...}]`

### Autenticados (header `Authorization: Bearer <token>`)
- **POST /api/products**
  - Body: `{ "name":"...", "description":"...", "price":100, "stock":10 }`
  - Respuesta: `201` con el producto creado

- **PUT /api/cart/add**
  - Body: `{ "productId":"<id>", "quantity":2 }`
  - Respuesta: `200` con el carrito actualizado

- **GET /api/cart**
  - Respuesta: `200` con el contenido del carrito del usuario

## Validaciones y errores
- JSON inválido → `400` con **texto plano** `"Invalid JSON body"`
- Campos faltantes/tipo incorrecto → `400` con `{ "message":"..." }`
- Usuario/email ya registrado → `409` con `{ "message":"Username or email already registered" }`
- Producto no encontrado → `404` con `{ "message":"Product not found" }`
- Stock insuficiente → `400` con `{ "message":"Insufficient stock" }`
- Token inválido/expirado → `401` con **texto plano** `"Token inválido"`
- Ruta inexistente → `404` con `{ "message":"Not found" }`

