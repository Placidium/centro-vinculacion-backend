const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService'); // ← AGREGAR ESTA LÍNEA

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto';
const SALT_ROUNDS = 10;

// Clase para errores personalizados
class AuthError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type;
    this.name = 'AuthError';
  }
}

const register = async (userData) => {
  console.log('Datos recibidos en register:', userData);

  const { email, password, nombre } = userData;

  try {
    // Validaciones adicionales del backend
    if (!nombre || nombre.trim().length === 0) {
      throw new AuthError('El nombre es obligatorio', 'VALIDATION_ERROR');
    }

    if (nombre.trim().length < 3) {
      throw new AuthError('El nombre debe tener al menos 3 caracteres', 'VALIDATION_ERROR');
    }

    if (nombre.trim().length > 100) {
      throw new AuthError('El nombre no puede exceder los 100 caracteres', 'VALIDATION_ERROR');
    }

    if (!email || email.trim().length === 0) {
      throw new AuthError('El email es obligatorio', 'VALIDATION_ERROR');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AuthError('Por favor, introduce un email válido', 'VALIDATION_ERROR');
    }

    if (!password || password.length === 0) {
      throw new AuthError('La contraseña es obligatoria', 'VALIDATION_ERROR');
    }

    if (password.length < 6) {
      throw new AuthError('La contraseña debe tener al menos 6 caracteres', 'VALIDATION_ERROR');
    }

    // Validar complejidad de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      throw new AuthError('La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número', 'VALIDATION_ERROR');
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      console.log('Error: Email ya registrado');
      throw new AuthError('Ya existe una cuenta con este email', 'USER_EXISTS');
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear nuevo usuario
    const newUser = await prisma.usuarios.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        nombre: nombre.trim(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        fecha_creacion: true
      }
    });

    return newUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      throw new AuthError('Ya existe una cuenta con este email', 'USER_EXISTS');
    }

    // Error de conexión a base de datos
    console.error('Error de conexión en register:', error);
    throw new AuthError('No se pudo conectar con el servidor. Verifica tu conexión a internet', 'CONNECTION_ERROR');
  }
};

const login = async (email, password) => {
  console.log('=== DEBUG LOGIN ===');
  console.log('Email recibido:', email);
  console.log('Password recibido:', password ? '[OCULTA]' : 'NO RECIBIDA');

  try {
    // Buscar usuario por email
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        permisos_usuario_permisos_usuario_usuario_idTousuarios: {
          select: {
            permiso: true
          }
        }
      }
    });

    console.log('Usuario encontrado:', usuario ? 'SÍ' : 'NO');
    if (usuario) {
      console.log('ID Usuario:', usuario.id);
      console.log('Email Usuario:', usuario.email);
      console.log('Nombre Usuario:', usuario.nombre);
    }

    // Usuario no encontrado
    if (!usuario) {
      console.log('ERROR: Usuario no encontrado');
      throw new AuthError('Email o contraseña incorrectos. Inténtalo de nuevo', 'INVALID_CREDENTIALS');
    }

    // Verificar contraseña
    console.log('Verificando contraseña...');
    const validPassword = await bcrypt.compare(password, usuario.password);
    console.log('¿Contraseña válida?:', validPassword);

    if (!validPassword) {
      console.log('ERROR: Contraseña incorrecta');
      throw new AuthError('Email o contraseña incorrectos. Inténtalo de nuevo', 'INVALID_CREDENTIALS');
    }

    // Actualizar último acceso
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimo_acceso: new Date() }
    });

    // Extraer permisos
    const permisos = usuario.permisos_usuario_permisos_usuario_usuario_idTousuarios.map(p => p.permiso);
    console.log('Permisos encontrados:', permisos);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        permisos: permisos
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
console.log('🔐 Login exitoso - Usuario:', {
  id: usuario.id,
  email: usuario.email,
  permisos
});

    console.log('LOGIN EXITOSO');
    return {
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        permisos: permisos
      }
    };

  } catch (error) {
    console.log('ERROR EN LOGIN:', error.message);
    if (error instanceof AuthError) {
      throw error;
    }

    // Error de conexión a base de datos
    console.error('Error de conexión en login:', error);
    throw new AuthError('No se pudo conectar con el servidor. Verifica tu conexión a internet', 'CONNECTION_ERROR');
  }
};

const forgotPassword = async (email) => {
  try {
    // Validar que el email no esté vacío (validación adicional del backend)
    if (!email || !email.trim()) {
      throw new AuthError('El email es obligatorio', 'VALIDATION_ERROR');
    }

    // Validar formato de email en backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AuthError('Por favor, introduce un email válido', 'VALIDATION_ERROR');
    }

    // Verificar si el usuario existe
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!usuario) {
      throw new AuthError('No hay ninguna cuenta asociada a este email', 'USER_NOT_FOUND');
    }

    // Generar token de recuperación único y seguro
    const resetToken = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        timestamp: Date.now() // Para mayor unicidad
      },
      JWT_SECRET + usuario.password, // Incluir password para invalidar si cambia
      { expiresIn: '1h' }
    );

    // Guardar token en base de datos con fecha de expiración
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        token_recuperacion: resetToken,
        token_expiracion: new Date(Date.now() + 3600000) // 1 hora
      }
    });

    // ✅ ENVIAR EMAIL REAL CON RESEND
    try {
      await emailService.sendPasswordReset(email, resetToken, usuario.nombre);
      console.log(`✅ Email de recuperación enviado a ${email}`);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      throw new AuthError('No se pudo enviar el correo. Inténtalo más tarde', 'EMAIL_ERROR');
    }

    return {
      message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña',
      success: true
    };

  } catch (error) {
    // Si es un error de validación o de usuario no encontrado, re-lanzar
    if (error instanceof AuthError) {
      throw error;
    }

    // Para errores de conexión o prisma
    if (error.code === 'P2002') {
      throw new AuthError('Error en la base de datos. Inténtalo más tarde', 'DATABASE_ERROR');
    }

    console.error('Error en forgotPassword:', error);
    throw new AuthError('No se pudo procesar la solicitud. Inténtalo más tarde', 'EMAIL_ERROR');
  }
};

// ✅ AGREGAR FUNCIÓN resetPassword
const resetPassword = async (token, newPassword) => {
  try {
    // Validaciones básicas
    if (!token || !newPassword) {
      throw new AuthError('Token y contraseña son obligatorios', 'VALIDATION_ERROR');
    }

    if (newPassword.length < 6) {
      throw new AuthError('La contraseña debe tener al menos 6 caracteres', 'VALIDATION_ERROR');
    }

    // Validar complejidad de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      throw new AuthError('La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número', 'VALIDATION_ERROR');
    }

    // Buscar usuario por token válido
    const usuario = await prisma.usuarios.findFirst({
      where: {
        token_recuperacion: token,
        token_expiracion: {
          gte: new Date() // Token no expirado
        }
      }
    });

    if (!usuario) {
      throw new AuthError('Token inválido o expirado', 'INVALID_TOKEN');
    }

    // Verificar token JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET + usuario.password);

      // Verificar que el token corresponde al usuario
      if (decoded.id !== usuario.id || decoded.email !== usuario.email) {
        throw new AuthError('Token inválido', 'INVALID_TOKEN');
      }
    } catch (jwtError) {
      console.error('Error verificando JWT:', jwtError);
      throw new AuthError('Token inválido o expirado', 'TOKEN_EXPIRED');
    }

    // Crear hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Actualizar contraseña y limpiar token
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        password: hashedPassword,
        token_recuperacion: null,
        token_expiracion: null,
        ultimo_acceso: new Date()
      }
    });

    console.log(`✅ Contraseña actualizada para usuario ID: ${usuario.id}`);

    return {
      message: 'Tu contraseña ha sido actualizada exitosamente',
      success: true
    };

  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    console.error('Error en resetPassword:', error);
    throw new AuthError('No se pudo actualizar la contraseña. Inténtalo más tarde', 'DATABASE_ERROR');
  }




};


module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword, // ← AGREGAR ESTA LÍNEA
  AuthError,
};