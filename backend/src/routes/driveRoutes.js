const express = require('express');
const driveController = require('../controllers/driveController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Callback OAuth de navegador (protegido por token anti-CSRF `state` ligado al admin de la empresa)
router.get('/oauth/callback', driveController.oauthCallback);

// Endpoints autenticados con JWT + empresa_id
router.get('/oauth', authMiddleware, requireAdmin, driveController.startOAuth);
router.get('/status', authMiddleware, driveController.getStatus);
router.post('/connect-folder', authMiddleware, requireAdmin, driveController.connectFolder);
router.put('/config', authMiddleware, requireAdmin, driveController.connectFolder);
router.post('/sync', authMiddleware, requireAdmin, driveController.syncNow);
router.delete('/disconnect', authMiddleware, requireAdmin, driveController.disconnect);

module.exports = router;
