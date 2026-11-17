const path = require('path');
const express = require('express');
const multer = require('multer');
const documentoController = require('../controllers/documentoController');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { AppError } = require('../middleware/errorHandler');

const ALLOWED_EXT = new Set(['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return cb(new AppError('Extensión no permitida. Solo se admiten PDF, DOCX, TXT o imágenes PNG/JPG/WEBP.', 400));
    }
    return cb(null, true);
  }
});

function handleConditionalUpload(req, res, next) {
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    return upload.single('archivo')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('El archivo supera el límite máximo permitido de 15 MB.', 400));
        }
        return next(err instanceof AppError ? err : new AppError(err.message || 'Error al procesar archivo.', 400));
      }
      return next();
    });
  }
  return next();
}

const router = express.Router();

router.get('/', documentoController.getAll);
router.get('/:id', documentoController.getById);
router.post('/upload', requireAdmin, handleConditionalUpload, documentoController.uploadDocumento);
router.post('/:id/reindex', requireAdmin, documentoController.reindexDocumento);
router.delete('/:id', requireAdmin, documentoController.deleteDocumento);

module.exports = router;
