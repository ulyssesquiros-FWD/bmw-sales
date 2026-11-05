const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas del Agente IA requieren autenticación
router.use(authMiddleware);

router.post('/chat', (req, res) => aiController.chat(req, res));
router.get('/sugerencias', (req, res) => aiController.sugerencias(req, res));
router.get('/estado', (req, res) => aiController.estado(req, res));

module.exports = router;
