const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);
    
    res.status(201).json({ 
      success: true,
      message: 'Usuario creado exitosamente', 
      user: newUser 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores específicos de autenticación
    if (error instanceof authService.AuthError) {
      let statusCode = 400;
      
      switch (error.type) {
        case 'USER_EXISTS':
          statusCode = 409; // Conflict
          break;
        case 'CONNECTION_ERROR':
          statusCode = 503; // Service Unavailable
          break;
        default:
          statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        type: error.type
      });
    }
    
    // Error genérico
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

console.log('📤 Login response enviada al cliente:', {
  token: result.token.substring(0, 20) + '...', // por seguridad
  user: result.user
});


    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Error en login:', error);
    
    
    // Manejar errores específicos de autenticación
    if (error instanceof authService.AuthError) {
      let statusCode = 401;
      
      switch (error.type) {
        case 'USER_NOT_FOUND':
        case 'INVALID_CREDENTIALS':
          statusCode = 401; // Unauthorized
          break;
        case 'CONNECTION_ERROR':
          statusCode = 503; // Service Unavailable
          break;
        default:
          statusCode = 500;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        type: error.type
      });
    }
    
    // Error genérico
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validación adicional en el controller
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio',
        type: 'VALIDATION_ERROR'
      });
    }

    const result = await authService.forgotPassword(email);
    
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    
    // Manejar errores específicos de autenticación
    if (error instanceof authService.AuthError) {
      let statusCode = 400;
      
      switch (error.type) {
        case 'USER_NOT_FOUND':
          statusCode = 404; // Not Found
          break;
        case 'EMAIL_ERROR':
          statusCode = 503; // Service Unavailable
          break;
        case 'DATABASE_ERROR':
          statusCode = 503; // Service Unavailable
          break;
        case 'VALIDATION_ERROR':
          statusCode = 400; // Bad Request
          break;
        default:
          statusCode = 500;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        type: error.type
      });
    }
    
    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// controllers/authController.js - AGREGAR ESTA FUNCIÓN

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validación básica
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son obligatorios',
        type: 'VALIDATION_ERROR'
      });
    }

    const result = await authService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    
    if (error instanceof authService.AuthError) {
      let statusCode = 400;
      
      switch (error.type) {
        case 'INVALID_TOKEN':
        case 'TOKEN_EXPIRED':
          statusCode = 401;
          break;
        case 'USER_NOT_FOUND':
          statusCode = 404;
          break;
        case 'VALIDATION_ERROR':
          statusCode = 400;
          break;
        default:
          statusCode = 500;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        type: error.type
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// AGREGAR A LAS EXPORTACIONES:
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword // ← AGREGAR ESTA LÍNEA
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};