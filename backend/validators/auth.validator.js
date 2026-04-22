// const { body } = require('express-validator');

// exports.registerValidator = [
//   body('name')
//     .trim()
//     .notEmpty().withMessage('Name is required')
//     .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters')
//     .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

//   body('email')
//     .trim()
//     .notEmpty().withMessage('Email is required')
//     .isEmail().withMessage('Please provide a valid email')
//     .normalizeEmail(),

//   body('password')
//     .notEmpty().withMessage('Password is required')
//     .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
//     .withMessage('Password must contain uppercase, lowercase, number, and special character'),
// ];

// exports.loginValidator = [
//   body('email')
//     .trim()
//     .notEmpty().withMessage('Email is required')
//     .isEmail().withMessage('Invalid email format')
//     .normalizeEmail(),

//   body('password')
//     .notEmpty().withMessage('Password is required')
//     .isString().withMessage('Password must be a string'),
// ];

const { body } = require('express-validator');

exports.registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Invalid password format'),
];