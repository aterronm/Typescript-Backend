# Práctica 3 — Tienda en línea (API REST con JWT)

Implementación de una pequeña tienda con registro, autenticación JWT, gestión de productos y carritos.

La API inicia por defecto en `http://localhost:${PORT:-3000}`

### Semillas (opcional)
```bash
npm run seed
```

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


## Estructura
```
src/
  app.js
  server.js
  config/db.js
  middleware/auth.js
  models/{User,Product,Cart}.js
  routes/{auth,products,cart}.routes.js
scripts/seed.js
tests/api.test.js
```

## Ramas y Pull Request
1. Inicializa el repo y crea `develop`:
   ```bash
   git init
   git checkout -b develop
   git add .
   git commit -m "chore: scaffold proyecto base"
   ```
2. Crea la rama de solución `feature/practica-3`:
   ```bash
   git checkout -b feature/practica-3
   git commit --allow-empty -m "feat: implementación práctica 3"
   ```
   (Si quieres separar commits base/solución, mueve cambios según tu flujo.)
3. Crea el remoto y sube ramas:
   ```bash
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin develop
   git push -u origin feature/practica-3
   ```
4. Abre un Pull Request **de `feature/practica-3` hacia `develop`** en GitHub.

## Colección de pruebas rápida (VS Code `REST Client`)
Mira `requests.http` para ejemplos concretos.
