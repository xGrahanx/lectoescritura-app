/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `grupos` table. All the data in the column will be lost.
  - You are about to drop the column `docenteId` on the `grupos` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `grupos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `grupos_estudiantes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `asignadoEn` on the `grupos_estudiantes` table. All the data in the column will be lost.
  - You are about to drop the column `estudianteId` on the `grupos_estudiantes` table. All the data in the column will be lost.
  - You are about to drop the column `grupoId` on the `grupos_estudiantes` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `usuarios` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `apellido` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `correo` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `password` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `grado` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - Added the required column `estudiante_id` to the `grupos_estudiantes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grupo_id` to the `grupos_estudiantes` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rol` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "tipo_alerta" AS ENUM ('error', 'logro', 'inactividad', 'mejora', 'alto_rendimiento');

-- CreateEnum
CREATE TYPE "tipo_ejercicio" AS ENUM ('dictado', 'completar', 'libre', 'copia');

-- CreateEnum
CREATE TYPE "tipo_estado_tarea" AS ENUM ('pendiente', 'completada', 'vencida');

-- CreateEnum
CREATE TYPE "tipo_ia" AS ENUM ('sinonimos', 'oraciones', 'acentuacion', 'comprension');

-- CreateEnum
CREATE TYPE "tipo_nivel" AS ENUM ('basico', 'intermedio', 'avanzado');

-- CreateEnum
CREATE TYPE "tipo_rol" AS ENUM ('estudiante', 'docente', 'administrador');

-- CreateEnum
CREATE TYPE "tipo_tarea" AS ENUM ('lectura', 'escritura', 'especial', 'ia');

-- DropForeignKey
ALTER TABLE "grupos" DROP CONSTRAINT "grupos_docenteId_fkey";

-- DropForeignKey
ALTER TABLE "grupos_estudiantes" DROP CONSTRAINT "grupos_estudiantes_estudianteId_fkey";

-- DropForeignKey
ALTER TABLE "grupos_estudiantes" DROP CONSTRAINT "grupos_estudiantes_grupoId_fkey";

-- AlterTable
ALTER TABLE "grupos" DROP COLUMN "creadoEn",
DROP COLUMN "docenteId",
ADD COLUMN     "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "docente_id" INTEGER,
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "activo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "grupos_estudiantes" DROP CONSTRAINT "grupos_estudiantes_pkey",
DROP COLUMN "asignadoEn",
DROP COLUMN "estudianteId",
DROP COLUMN "grupoId",
ADD COLUMN     "asignado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estudiante_id" INTEGER NOT NULL,
ADD COLUMN     "grupo_id" INTEGER NOT NULL,
ADD CONSTRAINT "grupos_estudiantes_pkey" PRIMARY KEY ("grupo_id", "estudiante_id");

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "creadoEn",
ADD COLUMN     "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "apellido" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "correo" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
DROP COLUMN "rol",
ADD COLUMN     "rol" "tipo_rol" NOT NULL,
ALTER COLUMN "grado" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "activo" DROP NOT NULL;

-- CreateTable
CREATE TABLE "alertas" (
    "id" SERIAL NOT NULL,
    "docente_id" INTEGER,
    "estudiante_id" INTEGER,
    "tipo" "tipo_alerta" NOT NULL,
    "titulo" VARCHAR(200),
    "mensaje" TEXT,
    "leida" BOOLEAN DEFAULT false,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" SERIAL NOT NULL,
    "umbral_alto_rendimiento" INTEGER DEFAULT 80,
    "umbral_bajo_rendimiento" INTEGER DEFAULT 60,
    "dias_inactividad_alerta" INTEGER DEFAULT 3,
    "notif_activas" BOOLEAN DEFAULT true,
    "intervalo_sync_minutos" INTEGER DEFAULT 30,
    "actualizado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios_escritura" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "tipo" "tipo_ejercicio" NOT NULL,
    "descripcion" TEXT,
    "contenido" TEXT,
    "nivel" "tipo_nivel" NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_escritura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios_ia" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER,
    "tipo" "tipo_ia" NOT NULL,
    "preguntas" JSONB NOT NULL,
    "respuestas" JSONB,
    "puntaje" INTEGER,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_diario" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER,
    "fecha" DATE DEFAULT CURRENT_DATE,
    "puntaje_promedio" INTEGER,
    "ejercicios_completados" INTEGER DEFAULT 0,
    "racha_dias" INTEGER DEFAULT 0,

    CONSTRAINT "progreso_diario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_escritura" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER,
    "ejercicio_id" INTEGER,
    "puntaje" INTEGER,
    "respuesta" TEXT,
    "errores_ortograficos" JSONB,
    "retroalimentacion" TEXT,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_escritura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_lectura" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER,
    "texto_id" INTEGER,
    "puntaje" INTEGER,
    "respuestas" JSONB,
    "retroalimentacion" TEXT,
    "errores" JSONB,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_lectura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "tipo_tarea" NOT NULL,
    "docente_id" INTEGER,
    "estudiante_id" INTEGER,
    "fecha_limite" DATE,
    "estado" "tipo_estado_tarea" DEFAULT 'pendiente',
    "es_avanzada" BOOLEAN DEFAULT false,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "textos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "autor" VARCHAR(100) NOT NULL,
    "contenido" TEXT NOT NULL,
    "nivel" "tipo_nivel" NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "textos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ejercicios_ia" ADD CONSTRAINT "ejercicios_ia_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "progreso_diario" ADD CONSTRAINT "progreso_diario_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resultados_escritura" ADD CONSTRAINT "resultados_escritura_ejercicio_id_fkey" FOREIGN KEY ("ejercicio_id") REFERENCES "ejercicios_escritura"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resultados_escritura" ADD CONSTRAINT "resultados_escritura_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resultados_lectura" ADD CONSTRAINT "resultados_lectura_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resultados_lectura" ADD CONSTRAINT "resultados_lectura_texto_id_fkey" FOREIGN KEY ("texto_id") REFERENCES "textos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
