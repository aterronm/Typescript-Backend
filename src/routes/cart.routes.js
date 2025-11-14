const express = require('express');
const mongoose = require('mongoose');
const { authRequired } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

router.put('/add', authRequired, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body || {};
    if (typeof productId !== 'string' || !mongoose.isValidObjectId(productId)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'quantity must be a positive integer' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const idx = cart.items.findIndex(i => i.productId.toString() === productId);
    const existingQty = idx >= 0 ? cart.items[idx].quantity : 0;
    const newTotalQty = existingQty + quantity;

    if (newTotalQty > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (idx >= 0) {
      cart.items[idx].quantity = newTotalQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate('items.productId', 'name price stock');
    return res.json(populated);
  } catch (err) {
    return next(err);
  }
});

router.get('/', authRequired, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price stock')
      .lean();
    if (!cart) {
      return res.json({ userId: req.user.id, items: [] });
    }
    return res.json(cart);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
