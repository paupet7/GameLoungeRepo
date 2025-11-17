const express = require('express');
const router = express.Router({ mergeParams: true });
const themeController = require('../controllers/themeController');
console.log(typeof themeController.theme);
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/', themeController.themes);
router.get('/:themeId', themeController.theme);
router.post('/', authenticate, isAdmin,themeController.addTheme);
router.put('/:themeId',authenticate, isAdmin, themeController.updateTheme);
router.delete('/:themeId',authenticate, isAdmin, themeController.deleteTheme);

module.exports = router;