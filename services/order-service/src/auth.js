//const jwt = require('jsonwebtoken');
/*
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Error de autenticación',
        error: 'Cabecera Authorization faltante',
        solución: 'Incluir header: Authorization: Bearer <token_jwt>'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Usar propiedad 'user' estándar
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Autenticación fallida',
      error: error.message
    });
  }
};*/