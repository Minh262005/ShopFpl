const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getDb } = require('../db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const [results] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (results.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password',
        redirectUrl: '/client/src/login.html'
      });
    }

    const user = results[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password',
        redirectUrl: '/client/src/login.html'
      });
    }

    const redirectUrl = user.role === 'ADMIN' ? 
      '/client/src/admin.html' : 
      '/client/src/index.html';

    return res.json({
      status: 'success',
      message: 'Login successful',
      redirectUrl
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
