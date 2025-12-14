const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All user management routes require admin authentication
router.get('/', authenticate, isAdmin, userController.users);
router.get('/:userId', authenticate, isAdmin, userController.user);
router.put('/:userId/role', authenticate, isAdmin, userController.updateUserRole);
router.delete('/:userId', authenticate, isAdmin, userController.deleteUser);

module.exports = router;