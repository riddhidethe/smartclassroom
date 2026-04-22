// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads')); // serve uploaded files

// // Routes
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/assignments', require('./routes/assignment.routes'));
// app.use('/api/users', require('./routes/user.routes'));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(process.env.PORT, () =>
//       console.log(`Server running on port ${process.env.PORT}`)
//     );
//   })
//   .catch(err => console.error('DB connection failed:', err));

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
const hpp        = require('hpp');
require('dotenv').config();

const app = express();

// ── 1. HELMET — sets 14 secure HTTP headers automatically ──────────────────
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],          // blocks inline scripts → kills XSS
    styleSrc:   ["'self'"],
    imgSrc:     ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc:    ["'self'"],
    objectSrc:  ["'none'"],
    frameSrc:   ["'none'"],
  }
}));

// ── 2. CORS — whitelist only your frontend origin ──────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  methods:     ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ── 3. BODY PARSING — limit payload size to prevent DoS ───────────────────
app.use(express.json({ limit: '10kb' }));

// ── 4. NoSQL INJECTION (CUSTOM FIX) ─────────────────────────────
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key]; // remove dangerous keys
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]); // recursive
      }
    });
  };

  sanitize(req.body);
  sanitize(req.params);
  // ❌ DO NOT sanitize req.query (causes crash)

  next();
});

// ── 5. HTTP PARAMETER POLLUTION prevention ────────────────────────────────
app.use(hpp());

// ── 6. RATE LIMITING — brute-force protection ─────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints specifically
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                    // only 10 login attempts per 15 min
  message: { message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/users',       require('./routes/user.routes'));

// Static uploads
app.use('/uploads', express.static('uploads'));

// ── 7. GLOBAL ERROR HANDLER — never leak stack traces ─────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);   // log internally only
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message            // show detail only in dev
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Secure server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('DB connection failed:', err));