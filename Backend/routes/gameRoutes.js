const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate, isAdmin } = require('../middleware/auth');


router.get('/', gameController.games);
router.get('/:gameId', gameController.game);
router.post('/',authenticate, isAdmin, gameController.addGame);
router.put('/:gameId',authenticate, isAdmin, gameController.updateGame);
router.delete('/:gameId',authenticate, isAdmin, gameController.deleteGame);

module.exports = router;