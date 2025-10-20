const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');


router.get('/', gameController.games);
router.get('/:gameId', gameController.game);
router.post('/', gameController.addGame);
router.put('/:gameId', gameController.updateGame);
router.delete('/:gameId', gameController.deleteGame);

module.exports = router;