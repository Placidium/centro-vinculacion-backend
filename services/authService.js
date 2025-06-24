const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

  const { email, password, nombre, rol } = userData; // ← AGREGAR ROL

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
    
    if (!rol || rol.trim().length === 0) {
      throw new AuthError('El rol es obligatorio', 'VALIDATION_ERROR');
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
        rol: rol.trim(), // ← AGREGAR ROL
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
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
  try {
    // Buscar usuario por email
    const usuario = await prisma.usuarios.findUnique({ 
      where: { email },
      include: {
        permisos_usuario_permisos_usuario_usuario_idTousuarios: {
          select: {
            permiso: true
          }
        }
      }
    });

    // Usuario no encontrado
    if (!usuario) {
      throw new AuthError('No existe ninguna cuenta con este email', 'USER_NOT_FOUND');
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      throw new AuthError('Email o contraseña incorrectos. Inténtalo de nuevo', 'INVALID_CREDENTIALS');
    }

    // Actualizar último acceso
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimo_acceso: new Date() }
    });

    // Extraer permisos
    const permisos = usuario.permisos_usuario_permisos_usuario_usuario_idTousuarios.map(p => p.permiso);

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

    // TODO: Implementar envío de email real
    // await emailService.sendPasswordReset(email, resetToken);
    console.log(`Token de recuperación generado para ${email}: ${resetToken}`);

    return { 
      message: 'Se ha enviado un email para restablecer tu contraseña',
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
    throw new AuthError('No se pudo enviar el email. Inténtalo más tarde', 'EMAIL_ERROR');
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  AuthError
};