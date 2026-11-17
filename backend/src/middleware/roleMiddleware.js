/**
 * Middleware de autorización por roles para rutas administrativas de PolicyBot SaaS.
 * Impide que un usuario con rol 'colaborador' cargue, elimine o reconfigure documentos/planes.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({
        ok: false,
        success: false,
        error: 'No autorizado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        success: false,
        error: `Acceso denegado: la acción requiere rol [${allowedRoles.join(', ')}]. Su rol actual es '${req.user.rol}'.`
      });
    }

    return next();
  };
}

const requireAdmin = requireRole('admin');

module.exports = {
  requireRole,
  requireAdmin
};
