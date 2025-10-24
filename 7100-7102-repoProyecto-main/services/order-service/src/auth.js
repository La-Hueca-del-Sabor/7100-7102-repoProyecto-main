const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Intenta obtener el token de 'authorization' o 'Authorization'
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth error: No token provided or wrong format');
      return res.status(401).json({
        message: 'Error de autenticación',
        error: 'Cabecera Authorization faltante o con formato incorrecto',
        solucion: 'Incluir header: Authorization: Bearer <token_jwt>'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Auth error: Token is missing after Bearer');
        return res.status(401).json({ message: 'Token de autenticación faltante' });
    }

    // Verificar el token usando el secreto del entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded; // Adjuntar datos decodificados (como userId, role) a la request
    console.log('Token decodificado:', decoded); // Log para depuración
    next(); // Pasar al siguiente middleware o ruta si el token es válido

  } catch (error) {
    console.error('Auth error:', error.message); // Log detallado del error
    let errorMessage = 'Autenticación fallida';
    if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Token inválido';
    } else if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expirado';
    }
    return res.status(401).json({
      message: errorMessage,
      error: error.message // Proporcionar más detalles del error si es necesario
    });
  }
};