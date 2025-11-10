const express = require('express');
const router = express.Router({ mergeParams: true });
const themeController = require('../controllers/themeController');
console.log(typeof themeController.theme);
const { authenticate, isClientOrAdmin } = require('../middleware/auth');

router.get('/', themeController.themes);
router.get('/:themeId', themeController.theme);
router.post('/', authenticate, isClientOrAdmin,themeController.addTheme);
router.put('/:themeId',authenticate, isClientOrAdmin, themeController.updateTheme);
router.delete('/:themeId',authenticate, isClientOrAdmin, themeController.deleteTheme);

module.exports = router;