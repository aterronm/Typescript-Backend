const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};
    if (typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ message: 'username is required' });
    }
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'email must be a valid email' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'password must be at least 6 characters' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.trim() }] });
    if (existing) {
      return res.status(409).json({ message: 'Username or email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username: username.trim(), email: email.toLowerCase(), passwordHash });
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Username or email already registered' });
    }
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '2h' }
    );

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
