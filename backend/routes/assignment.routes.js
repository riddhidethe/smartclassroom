// const router  = require('express').Router();
// const multer  = require('multer');
// const {
//   createAssignment, getAllAssignments,
//   getAssignmentById, deleteAssignment
// } = require('../controllers/assignment.controller');
// const authMiddleware = require('../middleware/auth.middleware');
// const roleGuard      = require('../middleware/role.middleware');

// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// });
// const upload = multer({ storage });

// router.post('/',     authMiddleware, roleGuard('teacher', 'admin'), upload.single('file'), createAssignment);
// router.get('/',      authMiddleware, getAllAssignments);
// router.get('/:id',   authMiddleware, getAssignmentById);
// router.delete('/:id',authMiddleware, roleGuard('teacher', 'admin'), deleteAssignment);

// module.exports = router;

const router    = require('express').Router();
const multer    = require('multer');
const path      = require('path');
const { createAssignment, getAllAssignments,
        getAssignmentById, deleteAssignment } = require('../controllers/assignment.controller');
const { assignmentValidator } = require('../validators/assignment.validator');
const authMiddleware = require('../middleware/auth.middleware');
const roleGuard      = require('../middleware/role.middleware');

// SECURE multer — whitelist file types and limit size
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + path.basename(file.originalname).replace(/\s/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('File type not allowed'));
  }
});

router.post('/',      authMiddleware, roleGuard('teacher','admin'), upload.single('file'), assignmentValidator, createAssignment);
router.get('/',       authMiddleware, getAllAssignments);
router.get('/:id',    authMiddleware, getAssignmentById);
router.delete('/:id', authMiddleware, roleGuard('teacher','admin'), deleteAssignment);

module.exports = router;