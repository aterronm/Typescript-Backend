const express = require('express');
const Product = require('../models/Product');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Público
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().lean();
    return res.json(products);
  } catch (err) {
    return next(err);
  }
});

// Protegido
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { name, description = '', price, stock } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (typeof price !== 'number' || !isFinite(price) || price <= 0) {
      return res.status(400).json({ message: 'price must be a number greater than 0' });
    }
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'stock must be an integer >= 0' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: String(description || ''),
      price,
      stock
    });

    return res.status(201).json(product);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
