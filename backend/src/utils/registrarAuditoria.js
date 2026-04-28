/**
 * registrarAuditoria.js
 * 
 * Ejecuta una operación de Prisma dentro de una transacción
 * que primero setea el usuario_id para que el trigger lo capture.
 * 
 * Uso:
 *   const resultado = await conAuditoria(prisma, usuarioId, async (tx) => {
 *     return await tx.usuario.create({ data: {...} });
 *   });
 */

/**
 * Ejecuta una operación dentro de una transacción con usuario_id seteado
 * @param {PrismaClient} prisma 
 * @param {number|null} usuarioId - ID del usuario que realiza la acción
 * @param {Function} operacion - Función async que recibe el cliente de transacción
 */
const conAuditoria = async (prisma, usuarioId, operacion) => {
  return await prisma.$transaction(async (tx) => {
    // Setear el usuario_id en la sesión de PostgreSQL DENTRO de la transacción
    if (usuarioId) {
      await tx.$executeRawUnsafe(`SET LOCAL app.usuario_id = '${parseInt(usuarioId)}'`);
    }
    // Ejecutar la operación real
    return await operacion(tx);
  });
};

module.exports = conAuditoria;
