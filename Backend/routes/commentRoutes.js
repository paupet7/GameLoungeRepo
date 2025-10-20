const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');


router.get('/', commentController.comments);
router.get('/:commentId', commentController.comment);
router.post('/', commentController.addComment);
router.put('/:commentId', commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;