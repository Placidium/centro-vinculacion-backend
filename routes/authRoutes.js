const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword, // ← AGREGAR ESTA LÍNEA
  handleValidationErrors
} = require('../middleware/validation');

// Ruta de login con validaciones
router.post('/login',
  validateLogin,
  handleValidationErrors,
  authController.login
);

// Ruta GET para mostrar el formulario de reset password
router.get('/reset-password', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).send(`
      <h1>Error</h1>
      <p>Token no proporcionado</p>z
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}">Volver al inicio</a>
    `);
  }

  // Renderizar formulario HTML
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Restablecer Contraseña - Centro Integral Alerce</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #166534; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #14532d; }
            .error { color: red; margin-top: 10px; }
            .success { color: green; margin-top: 10px; }
        </style>
    </head>
    <body>
        <h1>Centro Integral Alerce</h1>
        <h2>Restablecer Contraseña</h2>
        
        <form id="resetForm">
            <input type="hidden" id="token" value="${token}">
            
            <div class="form-group">
                <label for="newPassword">Nueva Contraseña:</label>
                <input type="password" id="newPassword" required>
                <small>Mínimo 6 caracteres, incluir mayúscula, minúscula y número</small>
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">Confirmar Contraseña:</label>
                <input type="password" id="confirmPassword" required>
            </div>
            
            <button type="submit">Cambiar Contraseña</button>
            <div id="message"></div>
        </form>

        <script>
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const token = document.getElementById('token').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const messageDiv = document.getElementById('message');
                
                // Validar que las contraseñas coincidan
                if (newPassword !== confirmPassword) {
                    messageDiv.innerHTML = '<div class="error">Las contraseñas no coinciden</div>';
                    return;
                }
                
                try {
                    const response = await fetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            token: token,
                            newPassword: newPassword,
                            confirmPassword: confirmPassword
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        messageDiv.innerHTML = '<div class="success">' + data.message + '</div>';
                        // 🔧 CORRECCIÓN: Redirigir correctamente al login
                        setTimeout(() => {
                            window.location.href = 'http://localhost:3001/login';
                        }, 2000);
                    } else {
                        messageDiv.innerHTML = '<div class="error">' + data.message + '</div>';
                    }
                } catch (error) {
                    messageDiv.innerHTML = '<div class="error">Error de conexión. Inténtalo de nuevo.</div>';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Ruta de registro con validaciones
router.post('/register',
  validateRegister,
  handleValidationErrors,
  authController.register
);

// Ruta POST para procesar el reset de contraseña
router.post('/reset-password',
  validateResetPassword,
  handleValidationErrors,
  authController.resetPassword
);

// Ruta de recuperación de contraseña con validaciones
router.post('/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes funcionando' });
});

module.exports = router;