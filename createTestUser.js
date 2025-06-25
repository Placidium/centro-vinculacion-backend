// createTestUser.js - Crear usuario con contraseña conocida
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function createTestUser() {
  try {
    // Contraseña que usaremos: "admin123"
    const plainPassword = "admin123";
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    console.log('Creando usuario de prueba...');
    console.log('Email: test@centro-alerce.cl');
    console.log('Contraseña: admin123');
    console.log('Hash generado:', hashedPassword);

    // Verificar si ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: 'test@centro-alerce.cl' }
    });

    if (existingUser) {
      console.log('Usuario ya existe, actualizando contraseña...');
      await prisma.usuarios.update({
        where: { email: 'test@centro-alerce.cl' },
        data: { password: hashedPassword }
      });
    } else {
      console.log('Creando nuevo usuario...');
      await prisma.usuarios.create({
        data: {
          nombre: 'Usuario Prueba',
          email: 'test@centro-alerce.cl',
          password: hashedPassword
        }
      });
    }

    // Verificar que funciona
    console.log('\n=== VERIFICANDO ===');
    const user = await prisma.usuarios.findUnique({
      where: { email: 'test@centro-alerce.cl' }
    });

    const isValid = await bcrypt.compare(plainPassword, user.password);
    console.log('¿Contraseña válida?:', isValid);

    if (isValid) {
      console.log('✅ Usuario creado correctamente!');
      console.log('Puedes hacer login con: test@centro-alerce.cl / admin123');
    } else {
      console.log('❌ Error en la verificación');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();