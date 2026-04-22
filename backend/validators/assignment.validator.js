const { body } = require('express-validator');

exports.assignmentValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters')
    // Strip any HTML tags from title
    .customSanitizer(value => value.replace(/<[^>]*>/g, '')),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    // Strip HTML tags to prevent stored XSS
    .customSanitizer(value => value.replace(/<[^>]*>/g, '')),
];