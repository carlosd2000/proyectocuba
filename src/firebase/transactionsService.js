import { db } from '@/firebase/config'
import { 
  collection, 
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

export const TransactionsService = {
  /**
   * Inicializa la estructura de transacciones para un usuario
   */
  async inicializarEstructura(userId, bancoId) {
    try {
      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      
      // Crear subcolecciones si no existen
      const subcolecciones = [
        'Transacciones_Valores',
        'Transacciones_Dia',
        'Transacciones_Tarde',
        'Transacciones_Noche'
      ]

      for (const subcol of subcolecciones) {
        const colRef = collection(walletRef, subcol)
        const snapshot = await getDocs(query(colRef, limit(1)))
        if (snapshot.empty) {
          await setDoc(doc(colRef), {
            inicializado: true,
            fecha: serverTimestamp()
          })
        }
      }

      return { success: true }
    } catch (error) {
      console.error('[Firestore] Error inicializando estructura:', error)
      throw error
    }
  },

  /**
   * Crea una transacción en Transacciones_Valores
   * (Versión corregida con lógica mejorada para origen/destino)
   */
  async crearTransaccion({ userId, bancoId, tipo, monto, destinatarioId }) {
    try {
      const transaccionesRef = collection(
        db,
        'bancos', bancoId, 'wallets', userId, 'Transacciones_Valores'
      )

      // Estructura base de la transacción
      const transactionData = {
        tipo,
        monto: Number(monto),
        fecha: serverTimestamp(),
        estado: 'completado'
      }

      // Lógica corregida para origen/destino
      if (tipo === 'deposito') {
        transactionData.id_wallet_origen = destinatarioId  // Quien envía el dinero
        transactionData.id_wallet_destino = userId         // Quien recibe el dinero
      } else if (tipo === 'retiro') {
        transactionData.id_wallet_origen = userId          // Quien envía el dinero
        transactionData.id_wallet_destino = destinatarioId // Quien recibe el dinero
      }

      const nuevoDoc = doc(transaccionesRef)
      await setDoc(nuevoDoc, transactionData)

      return { success: true, id: nuevoDoc.id }
    } catch (error) {
      console.error('[Firestore] Error creando transacción:', error)
      throw error
    }
  },

  /**
   * Crea transacción en subcolecciones de periodo (Dia/Tarde/Noche)
   */
  async crearTransaccionPeriodo({ userId, bancoId, periodo, datos }) {
    try {
      const periodoCapitalizado = periodo.charAt(0).toUpperCase() + periodo.slice(1)
      const periodoRef = collection(
        db,
        'bancos', bancoId, 'wallets', userId, `Transacciones_${periodoCapitalizado}`
      )

      const nuevoDoc = doc(periodoRef)
      await setDoc(nuevoDoc, {
        ...datos,
        fecha: serverTimestamp()
      })

      return { success: true, id: nuevoDoc.id }
    } catch (error) {
      console.error(`[Firestore] Error creando transacción en ${periodo}:`, error)
      throw error
    }
  },

  /**
   * Transferencia entre usuarios (versión corregida)
   */
  async transferirFondos({ emisorId, receptorId, bancoId, monto }) {
    try {
      // 1. Inicializar estructuras si no existen
      await this.inicializarEstructura(emisorId, bancoId)
      await this.inicializarEstructura(receptorId, bancoId)

      // 2. Crear transacciones con referencia cruzada CORRECTA
      // Retiro del emisor (dinero sale de su cuenta)
      await this.crearTransaccion({
        userId: emisorId,
        bancoId,
        tipo: 'retiro',
        monto,
        destinatarioId: receptorId
      })

      // Depósito en receptor (dinero entra a su cuenta)
      await this.crearTransaccion({
        userId: receptorId,
        bancoId,
        tipo: 'deposito',
        monto,
        destinatarioId: emisorId
      })

      return { success: true }
    } catch (error) {
      console.error('[Firestore] Error en transferencia:', error)
      throw error
    }
  },

  // Métodos de conveniencia
  async crearDeposito({ userId, bancoId, monto }) {
    return this.crearTransaccion({
      userId,
      bancoId,
      tipo: 'deposito',
      monto,
      destinatarioId: null
    })
  },

  async crearRetiro({ userId, bancoId, monto }) {
    return this.crearTransaccion({
      userId,
      bancoId,
      tipo: 'retiro',
      monto,
      destinatarioId: null
    })
  },

  /**
   * Obtiene transacciones agrupadas por periodo
   */
  async getGroupedTransactions(userId, bancoId, fecha = new Date()) {
    try {
      const periodos = ['Valores', 'Dia', 'Tarde', 'Noche']
      let resultados = {
        depositos: 0,
        retiros: 0,
        ganancias: { Dia: 0, Tarde: 0, Noche: 0, Total: 0 },
        tiros: { Dia: 0, Tarde: 0, Noche: 0, Total: 0 }
      }

      for (const periodo of periodos) {
        try {
          const periodoRef = collection(
            db,
            'bancos', bancoId, 'wallets', userId, `Transacciones_${periodo}`
          )

          const inicioDia = new Date(fecha)
          inicioDia.setHours(0, 0, 0, 0)

          const finDia = new Date(fecha)
          finDia.setHours(23, 59, 59, 999)

          const q = query(
            periodoRef,
            where('fecha', '>=', Timestamp.fromDate(inicioDia)),
            where('fecha', '<=', Timestamp.fromDate(finDia))
          )

          const snapshot = await getDocs(q)
          snapshot.forEach(doc => {
            const data = doc.data()
            if (periodo === 'Valores') {
              if (data.tipo === 'deposito') {
                resultados.depositos += data.monto
              } else if (data.tipo === 'retiro') {
                resultados.retiros += data.monto
              }
            }
            // Agregar lógica para otros periodos según necesidades
          })
        } catch (error) {
          console.warn(`[Firestore] No hay transacciones en ${periodo}:`, error.message)
        }
      }

      return { resultados }
    } catch (error) {
      console.error('[Firestore] Error obteniendo transacciones:', error)
      return { resultados: {
        depositos: 0,
        retiros: 0,
        ganancias: { Dia: 0, Tarde: 0, Noche: 0, Total: 0 },
        tiros: { Dia: 0, Tarde: 0, Noche: 0, Total: 0 }
      }}
    }
  },

  /**
   * Obtiene transacciones diarias (de todos los periodos)
   */
  async getDailyTransactions(userId, bancoId, fecha = new Date()) {
    try {
      const periodos = ['Valores', 'Dia', 'Tarde', 'Noche']
      let transacciones = []

      for (const periodo of periodos) {
        try {
          const periodoRef = collection(
            db,
            'bancos', bancoId, 'wallets', userId, `Transacciones_${periodo}`
          )

          const inicioDia = new Date(fecha)
          inicioDia.setHours(0, 0, 0, 0)

          const finDia = new Date(fecha)
          finDia.setHours(23, 59, 59, 999)

          const q = query(
            periodoRef,
            where('fecha', '>=', Timestamp.fromDate(inicioDia)),
            where('fecha', '<=', Timestamp.fromDate(finDia)),
            orderBy('fecha', 'desc')
          )

          const snapshot = await getDocs(q)
          snapshot.forEach(doc => {
            transacciones.push({
              id: doc.id,
              periodo,
              ...doc.data(),
              fecha: doc.data().fecha?.toDate() || new Date()
            })
          })
        } catch (error) {
          console.warn(`[Firestore] No hay transacciones en ${periodo}:`, error.message)
        }
      }

      return transacciones
    } catch (error) {
      console.error('[Firestore] Error obteniendo transacciones:', error)
      return []
    }
  }
}

export default TransactionsService