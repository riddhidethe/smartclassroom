const router = require('express').Router();
const {
  getAllUsers, getUserById, updateUser, deleteUser
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleGuard    = require('../middleware/role.middleware');

// Admin only — manage all users
router.get('/',        authMiddleware, roleGuard('admin'), getAllUsers);
router.get('/:id',     authMiddleware, roleGuard('admin'), getUserById);
router.put('/:id',     authMiddleware, roleGuard('admin'), updateUser);
router.delete('/:id',  authMiddleware, roleGuard('admin'), deleteUser);

module.exports = router;