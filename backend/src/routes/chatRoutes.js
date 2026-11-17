const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/historial', chatController.getHistorial);
router.delete('/historial', chatController.clearHistorial);
router.post('/stream', chatController.streamChat);

module.exports = router;
