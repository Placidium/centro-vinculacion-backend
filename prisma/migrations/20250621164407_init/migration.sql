-- CreateTable
CREATE TABLE `actividades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo_actividad_id` INTEGER NOT NULL,
    `periodicidad` ENUM('Puntual', 'Periódica') NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `cupo` INTEGER NULL,
    `socio_comunitario_id` INTEGER NOT NULL,
    `proyecto_id` INTEGER NULL,
    `estado` ENUM('Programada', 'Cancelada', 'Completada') NOT NULL DEFAULT 'Programada',
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `creado_por` INTEGER NOT NULL,

    INDEX `creado_por`(`creado_por`),
    INDEX `idx_actividades_estado`(`estado`, `fecha_inicio`),
    INDEX `proyecto_id`(`proyecto_id`),
    INDEX `socio_comunitario_id`(`socio_comunitario_id`),
    INDEX `tipo_actividad_id`(`tipo_actividad_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividades_beneficiarios` (
    `actividad_id` INTEGER NOT NULL,
    `beneficiario_id` INTEGER NOT NULL,

    INDEX `beneficiario_id`(`beneficiario_id`),
    PRIMARY KEY (`actividad_id`, `beneficiario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividades_oferentes` (
    `actividad_id` INTEGER NOT NULL,
    `oferente_id` INTEGER NOT NULL,

    INDEX `oferente_id`(`oferente_id`),
    PRIMARY KEY (`actividad_id`, `oferente_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `archivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `ruta` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(100) NOT NULL,
    `tamano` INTEGER NOT NULL,
    `actividad_id` INTEGER NOT NULL,
    `tipo_adjunto` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_carga` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cargado_por` INTEGER NOT NULL,

    INDEX `cargado_por`(`cargado_por`),
    INDEX `idx_archivos_actividad`(`actividad_id`, `tipo_adjunto`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `beneficiarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `caracterizacion` VARCHAR(200) NOT NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actividad_id` INTEGER NOT NULL,
    `lugar_id` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `hora_inicio` TIME(0) NOT NULL,
    `hora_fin` TIME(0) NULL,
    `estado` ENUM('Programada', 'Cancelada', 'Completada') NOT NULL DEFAULT 'Programada',
    `motivo_cancelacion` TEXT NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `creado_por` INTEGER NOT NULL,

    INDEX `creado_por`(`creado_por`),
    INDEX `idx_citas_actividad`(`actividad_id`, `fecha`),
    INDEX `idx_citas_fecha`(`fecha`, `hora_inicio`),
    INDEX `idx_citas_lugar_fecha`(`lugar_id`, `fecha`, `estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lugares` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `cupo` INTEGER NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oferentes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `docente_responsable` VARCHAR(100) NOT NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permisos_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `permiso` VARCHAR(50) NOT NULL,
    `fecha_asignacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `asignado_por` INTEGER NULL,

    INDEX `asignado_por`(`asignado_por`),
    INDEX `idx_permisos_usuario`(`usuario_id`, `permiso`),
    UNIQUE INDEX `unique_user_permission`(`usuario_id`, `permiso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyectos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `socios_comunitarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_actividad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ultimo_acceso` TIMESTAMP(0) NULL,
    `token_recuperacion` VARCHAR(255) NULL,
    `token_expiracion` TIMESTAMP(0) NULL,

    UNIQUE INDEX `email`(`email`),
    INDEX `idx_usuarios_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`tipo_actividad_id`) REFERENCES `tipos_actividad`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_ibfk_2` FOREIGN KEY (`socio_comunitario_id`) REFERENCES `socios_comunitarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_ibfk_3` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_ibfk_4` FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades_beneficiarios` ADD CONSTRAINT `actividades_beneficiarios_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades_beneficiarios` ADD CONSTRAINT `actividades_beneficiarios_ibfk_2` FOREIGN KEY (`beneficiario_id`) REFERENCES `beneficiarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades_oferentes` ADD CONSTRAINT `actividades_oferentes_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades_oferentes` ADD CONSTRAINT `actividades_oferentes_ibfk_2` FOREIGN KEY (`oferente_id`) REFERENCES `oferentes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `archivos` ADD CONSTRAINT `archivos_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `archivos` ADD CONSTRAINT `archivos_ibfk_2` FOREIGN KEY (`cargado_por`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`lugar_id`) REFERENCES `lugares`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `permisos_usuario` ADD CONSTRAINT `permisos_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `permisos_usuario` ADD CONSTRAINT `permisos_usuario_ibfk_2` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
