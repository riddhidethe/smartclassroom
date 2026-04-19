const router  = require('express').Router();
const multer  = require('multer');
const {
  createAssignment, getAllAssignments,
  getAssignmentById, deleteAssignment
} = require('../controllers/assignment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleGuard      = require('../middleware/role.middleware');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/',     authMiddleware, roleGuard('teacher', 'admin'), upload.single('file'), createAssignment);
router.get('/',      authMiddleware, getAllAssignments);
router.get('/:id',   authMiddleware, getAssignmentById);
router.delete('/:id',authMiddleware, roleGuard('teacher', 'admin'), deleteAssignment);

module.exports = router;