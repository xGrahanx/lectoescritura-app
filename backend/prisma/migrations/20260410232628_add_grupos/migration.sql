-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "docenteId" INTEGER NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_estudiantes" (
    "grupoId" INTEGER NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_estudiantes_pkey" PRIMARY KEY ("grupoId","estudianteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "grupos_nombre_key" ON "grupos"("nombre");

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
