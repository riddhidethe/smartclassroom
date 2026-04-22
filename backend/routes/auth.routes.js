// const router = require('express').Router();
// const { register, login, getMe } = require('../controllers/auth.controller');
// const authMiddleware = require('../middleware/auth.middleware');

// router.post('/register', register);
// router.post('/login',    login);
// router.get('/me',        authMiddleware, getMe);   // get logged-in user info

// module.exports = router;

const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', registerValidator, register);
router.post('/login',    loginValidator,    login);
router.get('/me',        authMiddleware,    getMe);

module.exports = router;