-- AlterTable
ALTER TABLE "tareas" ADD COLUMN     "ejercicio_id" INTEGER,
ADD COLUMN     "texto_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_texto_id_fkey" FOREIGN KEY ("texto_id") REFERENCES "textos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_ejercicio_id_fkey" FOREIGN KEY ("ejercicio_id") REFERENCES "ejercicios_escritura"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
