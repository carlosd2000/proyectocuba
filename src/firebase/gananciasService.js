import { db } from '@/firebase/config'
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp, // Añade esta importación
  orderBy 
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

      // Crear el documento de ganancia con estructura compatible con listamovimientos.vue
      const nuevoDoc = doc(periodoRef)
      await setDoc(nuevoDoc, {
        tipo: 'Ganancia', // Usar mayúscula para coincidir con iconoPorTipo
        monto: Number(ganancia), // Campo requerido por listamovimientos.vue
        fecha: serverTimestamp(),
        // Campos adicionales específicos de ganancia
        apuestaId,
        totalGlobal: Number(totalGlobal),
        horario
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
   * Elimina un registro de ganancia asociado a una apuesta
   * @param {Object} params 
   * @param {string} params.apuestaId - ID de la apuesta relacionada
   * @param {string} params.bancoId - ID del banco
   * @param {string} params.userId - ID del usuario que recibió la ganancia
   * @param {string} params.horario - Horario de la apuesta (Dia/Tarde/Noche)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async eliminarRegistroGanancia({ apuestaId, bancoId, userId, horario }) {
    try {
      // Validar que el horario sea correcto
      const horariosValidos = ['Dia', 'Tarde', 'Noche']
      if (!horariosValidos.includes(horario)) {
        throw new Error(`Horario inválido: ${horario}. Debe ser Dia, Tarde o Noche`)
      }

      // Obtener referencia a la subcolección de transacciones
      const transaccionesRef = collection(
        db,
        'bancos', bancoId, 'wallets', userId, `Transacciones_${horario}`
      )

      // Buscar la transacción de ganancia asociada a esta apuesta
      const q = query(
        transaccionesRef, 
        where('tipo', '==', 'Ganancia'), 
        where('apuestaId', '==', apuestaId)
      )
      const querySnapshot = await getDocs(q)

      // Eliminar todos los registros encontrados (debería ser solo uno)
      const resultados = []
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, transaccionesRef.path, docSnap.id))
        resultados.push({ id: docSnap.id, success: true })
      }

      return { 
        success: true,
        resultados,
        count: resultados.length
      }
    } catch (error) {
      console.error('[GananciasService] Error eliminando registro de ganancia:', error)
      throw error
    }
  },

  /**
   * Obtiene todas las ganancias de un usuario por día
   */
async obtenerGananciasDiarias(userId, bancoId, fecha = new Date()) {
  try {
    const horarios = ['Dia', 'Tarde', 'Noche']
    let ganancias = []

    // Configurar rango de fechas
    const inicioDia = new Date(fecha)
    inicioDia.setHours(0, 0, 0, 0)

    const finDia = new Date(fecha)
    finDia.setHours(23, 59, 59, 999)

    for (const horario of horarios) {
      const colRef = collection(
        db, 
        `bancos/${bancoId}/wallets/${userId}/Transacciones_${horario}`
      )
      
      const q = query(
        colRef,
        where('tipo', '==', 'Ganancia'),
        where('fecha', '>=', Timestamp.fromDate(inicioDia)),
        where('fecha', '<=', Timestamp.fromDate(finDia)),
        orderBy('fecha', 'desc')
      )
      
      const snapshot = await getDocs(q)
      console.log(`[GananciasService] Ganancias encontradas en ${horario}:`, snapshot.size,snapshot);
      
      snapshot.forEach(doc => {
        const data = doc.data()
        ganancias.push({
          id: doc.id,
          tipo: 'Ganancia',
          monto: data.monto || data.Ganancia, // Asegura compatibilidad
          fecha: data.fecha?.toDate() || new Date(),
          // Mantén otros campos importantes
          horario: data.horario,
          apuestaId: data.apuestaId
        })
      })
    }

    return ganancias
  } catch (error) {
    console.error('[GananciasService] Error obteniendo ganancias:', error)
    return []
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