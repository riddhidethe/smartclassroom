// const User = require('../models/User.model');
// const jwt = require('jsonwebtoken');

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: 'Email already registered' });

//     const user = await User.create({ name, email, password, role });
//     res.status(201).json({ message: 'Registered successfully', userId: user._id });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await user.matchPassword(password)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const User = require('../models/User.model');
const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  // Return validation errors to frontend so they can be displayed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.status(400).json({ errors: [{ msg: 'Email already registered' }] });

    await User.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password,
      role:     'student',   // never from req.body
    });

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err); // log full error in terminal
    // Return Mongoose validation errors clearly
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => ({ msg: e.message }));
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ errors: [{ msg: 'Server error, please try again' }] });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ errors: [{ msg: 'Invalid input' }] });

    // ✅ explicitly select password field since we removed select:false
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
    }

    if (user.isLocked) {
      return res.status(423).json({ errors: [{ msg: 'Account locked. Try again in 1 hour.' }] });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
    }

    // Reset attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error, please try again' }] });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};