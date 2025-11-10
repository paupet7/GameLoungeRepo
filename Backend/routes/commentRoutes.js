const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { authenticate, isClientOrAdmin } = require('../middleware/auth');


router.get('/', commentController.comments);
router.get('/:commentId', commentController.comment);

router.post('/',authenticate, isClientOrAdmin, commentController.addComment);
router.put('/:commentId',authenticate, isClientOrAdmin, commentController.updateComment);
router.delete('/:commentId',authenticate, isClientOrAdmin, commentController.deleteComment);

module.exports = router;