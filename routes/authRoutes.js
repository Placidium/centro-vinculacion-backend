const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  handleValidationErrors
} = require('../middleware/validation');

// Ruta de login con validaciones
router.post('/login',
  validateLogin,
  handleValidationErrors,
  authController.login
);

// Ruta de registro con validaciones
router.post('/register',
  validateRegister,
  handleValidationErrors,
  authController.register
);

// Ruta de recuperación de contraseña con validaciones
router.post('/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);

module.exports = router;