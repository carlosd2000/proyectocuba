import { db } from '@/firebase/config'
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore'

export const GananciasService = {
  /**
   * Crea un registro de ganancia asociado a una apuesta
   * @param {Object} params 
   * @param {string} params.apuestaId - ID de la apuesta relacionada
   * @param {string} params.bancoId - ID del banco
   * @param {string} params.userId - ID del usuario que recibe la ganancia
   * @param {number} params.totalGlobal - Monto total de la apuesta
   * @param {number} params.ganancia - Monto de la ganancia calculada
   * @param {string} params.horario - Horario de la apuesta (Dia/Tarde/Noche)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async crearRegistroGanancia({ apuestaId, bancoId, userId, totalGlobal, ganancia, horario }) {
    try {
      // Validar que el horario sea correcto
      const horariosValidos = ['Dia', 'Tarde', 'Noche']
      if (!horariosValidos.includes(horario)) {
        throw new Error(`Horario inválido: ${horario}. Debe ser Dia, Tarde o Noche`)
      }

      // Obtener referencia a la subcolección correcta según el horario
      const periodoRef = collection(
        db,
        'bancos', bancoId, 'wallets', userId, `Transacciones_${horario}`
      )

      // Crear el documento de ganancia
      const nuevoDoc = doc(periodoRef)
      await setDoc(nuevoDoc, {
        id_transaccion: nuevoDoc.id,
        tipo: 'ganancia',
        apuestaId,
        bancoId,
        TotalGlobal: Number(totalGlobal),
        Ganancia: Number(ganancia),
        fecha: serverTimestamp()
      })

      return { 
        success: true, 
        id: nuevoDoc.id,
        horario
      }
    } catch (error) {
      console.error('[GananciasService] Error creando registro de ganancia:', error)
      throw error
    }
  },

  /**
   * Calcula y registra la ganancia basada en una apuesta existente
   * @param {string} apuestaId - ID de la apuesta
   * @param {string} bancoId - ID del banco
   * @param {string} userId - ID del usuario
   * @param {number} porcentajeGanancia - Porcentaje de ganancia a aplicar (ej: 0.85 para 85%)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async procesarGananciaDesdeApuesta(apuestaId, bancoId, userId, porcentajeGanancia = 0.85) {
    try {
      // Obtener los datos de la apuesta
      const apuestaRef = doc(db, `bancos/${bancoId}/apuestas`, apuestaId)
      const apuestaSnap = await getDoc(apuestaRef)

      if (!apuestaSnap.exists()) {
        throw new Error(`No se encontró la apuesta con ID: ${apuestaId}`)
      }

      const apuestaData = apuestaSnap.data()
      const { totalGlobal, horario } = apuestaData

      // Calcular la ganancia (85% del totalGlobal por defecto)
      const ganancia = Number(totalGlobal) * porcentajeGanancia

      // Crear el registro de ganancia
      return this.crearRegistroGanancia({
        apuestaId,
        bancoId,
        userId,
        totalGlobal,
        ganancia,
        horario
      })
    } catch (error) {
      console.error('[GananciasService] Error procesando ganancia:', error)
      throw error
    }
  }
}

export default GananciasService