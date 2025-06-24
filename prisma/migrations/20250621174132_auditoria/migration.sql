-- CreateTable
CREATE TABLE `auditorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accion` VARCHAR(191) NOT NULL,
    `entidad` VARCHAR(191) NOT NULL,
    `registroId` INTEGER NULL,
    `descripcion` VARCHAR(191) NULL,
    `usuarioId` INTEGER NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auditorias` ADD CONSTRAINT `auditorias_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
