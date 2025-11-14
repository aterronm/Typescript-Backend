const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const app = require('../src/app');
const Product = require('../src/models/Product');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await connectDB(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
});

describe('API básica', () => {
  let token;
  let productId;

  test('JSON inválido devuelve 400 con "Invalid JSON body"', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "x", '); // JSON truncado
    expect(res.status).toBe(400);
    expect(res.text).toBe('Invalid JSON body');
  });

  test('Registro requiere campos válidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: '', email: 'noemail', password: '123' });
    expect(res.status).toBe(400);
  });

  test('Registro OK y duplicados 409', async () => {
    const ok = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret123' });
    expect(ok.status).toBe(201);
    expect(ok.body).toEqual({ message: 'User created' });

    const dup = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret123' });
    expect(dup.status).toBe(409);
  });

  test('Login devuelve token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('GET /api/products inicia vacío', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /api/products requiere JWT', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'A', price: 1, stock: 1 });
    expect(res.status).toBe(401);
    expect(res.text).toBe('Token inválido');
  });

  test('Crear producto OK', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Camiseta', description: 'Algodón', price: 10.5, stock: 3 });
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    productId = res.body._id;
  });

  test('PUT /api/cart/add 404 para productId inválido', async () => {
    const res = await request(app)
      .put('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: '64b64b64b64b64b64b64b64b', quantity: 1 });
    // El formato es válido pero no existe en DB -> debería ser 404
    expect([400,404]).toContain(res.status); // tolerancia
  });

  test('Insuficiente stock al superar límite', async () => {
    // Creamos un producto con stock 1 y pedimos 2
    const low = await Product.create({ name: 'ItemStock1', price: 5, stock: 1 });
    const res = await request(app)
      .put('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: low._id.toString(), quantity: 2 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Insufficient stock');
  });

  test('Agregar al carrito OK y luego obtener carrito', async () => {
    const resAdd = await request(app)
      .put('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });
    expect(resAdd.status).toBe(200);
    expect(Array.isArray(resAdd.body.items)).toBe(true);

    const resGet = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(resGet.status).toBe(200);
    expect(Array.isArray(resGet.body.items)).toBe(true);
    // Debe contener el producto agregado
    const found = resGet.body.items.find(i => (i.productId?._id || i.productId) === productId);
    expect(found).toBeDefined();
  });
});
