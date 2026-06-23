-- AlterTable
ALTER TABLE "alertas" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "ejercicios_escritura" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "ejercicios_ia" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "grupos_estudiantes" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "progreso_diario" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "resultados_escritura" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "resultados_lectura" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "tareas" ADD COLUMN     "activo" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "tabla" VARCHAR(100) NOT NULL,
    "operacion" VARCHAR(20) NOT NULL,
    "usuario_id" INTEGER,
    "registro_id" INTEGER,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_recuperacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expira_en" TIMESTAMP(6) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "usado_en" TIMESTAMP(6),
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_recuperacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_tabla_idx" ON "auditoria"("tabla");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_creado_en_idx" ON "auditoria"("creado_en");

-- CreateIndex
CREATE INDEX "auditoria_operacion_idx" ON "auditoria"("operacion");

-- CreateIndex
CREATE INDEX "idx_auditoria_fecha" ON "auditoria"("creado_en");

-- CreateIndex
CREATE INDEX "idx_auditoria_operacion" ON "auditoria"("operacion");

-- CreateIndex
CREATE INDEX "idx_auditoria_tabla" ON "auditoria"("tabla");

-- CreateIndex
CREATE INDEX "idx_auditoria_usuario" ON "auditoria"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_recuperacion_usuario_id_key" ON "codigos_recuperacion"("usuario_id");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "codigos_recuperacion" ADD CONSTRAINT "codigos_recuperacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
