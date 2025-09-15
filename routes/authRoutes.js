const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ message: 'username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({ id: user._id, username: user.username });
  } catch (e) {
    res.status(500).json({ message: 'registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ message: 'username and password required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });
    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username },
      config.jwtSecret,
      { expiresIn: '2h' },
    );
    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: 'login failed' });
  }
});

module.exports = router;
