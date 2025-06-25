// fixExistingUser.js - Actualizar el usuario existente
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function fixExistingUser() {
  try {
    // Contraseña que estableceremos: "docente123"
    const plainPassword = "docente123";
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    console.log('Actualizando usuario existente...');
    console.log('Email: docente.informatica@centro-alerce.cl');
    console.log('Nueva contraseña: docente123');
    console.log('Nuevo hash:', hashedPassword);

    // Actualizar el usuario existente
    const updatedUser = await prisma.usuarios.update({
      where: { email: 'docente.informatica@centro-alerce.cl' },
      data: { password: hashedPassword }
    });

    console.log('Usuario actualizado:', updatedUser.email);

    // Verificar que funciona
    console.log('\n=== VERIFICANDO ===');
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('¿Contraseña válida?:', isValid);

    if (isValid) {
      console.log('✅ Usuario actualizado correctamente!');
      console.log('Puedes hacer login con: docente.informatica@centro-alerce.cl / docente123');
    } else {
      console.log('❌ Error en la verificación');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingUser();