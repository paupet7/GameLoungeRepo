const express = require('express');
const router = express.Router({ mergeParams: true });
const themeController = require('../controllers/themeController');
console.log(typeof themeController.theme);

router.get('/', themeController.themes);
router.get('/:themeId', themeController.theme);
router.post('/', themeController.addTheme);
router.put('/:themeId', themeController.updateTheme);
router.delete('/:themeId', themeController.deleteTheme);

module.exports = router;