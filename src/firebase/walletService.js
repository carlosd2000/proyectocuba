import { db } from '@/firebase/config'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  runTransaction
} from 'firebase/firestore'
import { TransactionsService } from './transactionsService'
import { GananciasService } from './gananciasService'

export const WalletService = {
  /**
   * Crea o actualiza una wallet y su estructura de transacciones
   */
  async crearOActualizarWallet({ userId, bancoId, userType }) {
    try {
      if (!bancoId) {
        console.log('Usuario admin no necesita wallet')
        return { success: false, message: 'Admin no necesita wallet' }
      }

      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      const walletSnap = await getDoc(walletRef)

      const walletData = {
        id_dueño: userId,
        dueño_tipo: userType,
        bancoId,
        fondo_recaudado: 0,
        updatedAt: serverTimestamp()
      }

      if (!walletSnap.exists()) {
        await setDoc(walletRef, {
          ...walletData,
          createdAt: serverTimestamp()
        })

        // Inicializar estructura de transacciones
        await TransactionsService.inicializarEstructura(userId, bancoId)

        return { success: true, message: 'Wallet creada con estructura de transacciones' }
      } else {
        await updateDoc(walletRef, {
          dueño_tipo: userType,
          updatedAt: serverTimestamp()
        })
        return { success: true, message: 'Wallet actualizada' }
      }
    } catch (error) {
      console.error('Error en crearOActualizarWallet:', error)
      throw error
    }
  },

  /**
   * Transferencia segura entre wallets con transacción atómica
   */
  async transferirFondos({ emisorId, receptorId, bancoId, monto }) {
    try {
      // Validar monto positivo
      if (Number(monto) <= 0) {
        throw new Error('El monto debe ser mayor que cero')
      }

      // Usar transacción atómica para evitar inconsistencias
      await runTransaction(db, async (transaction) => {
        // 1. Verificar y actualizar wallet del emisor
        const emisorRef = doc(db, `bancos/${bancoId}/wallets/${emisorId}`)
        const emisorSnap = await transaction.get(emisorRef)
        
        if (!emisorSnap.exists()) {
          throw new Error('Wallet del emisor no existe')
        }

        const fondoEmisor = emisorSnap.data().fondo_recaudado || 0
        
        // 2. Verificar y actualizar wallet del receptor
        const receptorRef = doc(db, `bancos/${bancoId}/wallets/${receptorId}`)
        const receptorSnap = await transaction.get(receptorRef)
        
        if (!receptorSnap.exists()) {
          // Crear wallet si no existe
          transaction.set(receptorRef, {
            id_dueño: receptorId,
            dueño_tipo: 'colectores', // Tipo por defecto para receptores
            bancoId,
            fondo_recaudado: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        }

        const fondoReceptor = receptorSnap.exists() 
          ? receptorSnap.data().fondo_recaudado || 0
          : 0

        // 3. Actualizar saldos (sin validar fondos insuficientes)
        transaction.update(emisorRef, {
          fondo_recaudado: fondoEmisor - Number(monto),
          updatedAt: serverTimestamp()
        })

        transaction.update(receptorRef, {
          fondo_recaudado: fondoReceptor + Number(monto),
          updatedAt: serverTimestamp()
        })
      })

      // 4. Registrar las transacciones (fuera de la transacción atómica)
      await TransactionsService.transferirFondos({
        emisorId,
        receptorId,
        bancoId,
        monto
      })

      return { success: true, message: 'Transferencia realizada con éxito' }
    } catch (error) {
      console.error('Error en transferencia:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtiene los datos completos de una wallet
   */
  async obtenerWallet(userId, bancoId) {
    try {
      if (!bancoId) return null
      
      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      const walletSnap = await getDoc(walletRef)
      
      if (walletSnap.exists()) {
        const { resultados } = await TransactionsService.getGroupedTransactions(userId, bancoId)
        
        return {
          ...walletSnap.data(),
          fondo_recaudado: walletSnap.data().fondo_recaudado || 0
        }
      }
      return null
    } catch (error) {
      console.error('Error obteniendo wallet:', error)
      throw error
    }
  },

  /**
   * Obtiene movimientos formateados (versión corregida)
   */




/**
 * Obtiene movimientos formateados (versión corregida)
 */
async obtenerMovimientos(userId, bancoId) {
  try {
    if (!bancoId) return []
    
    // Obtener transacciones normales
    const transacciones = await TransactionsService.getDailyTransactions(userId, bancoId)
    const transaccionesValores = transacciones
      .filter(t => t.periodo === 'Valores' && (t.tipo === 'deposito' || t.tipo === 'retiro'))
      .map(t => ({
        id: t.id,
        tipo: t.tipo === 'deposito' ? 'Depósito' : 'Retiro',
        monto: t.tipo === 'deposito' ? t.monto : -t.monto,
        fecha: t.fecha
      }))
    

    
    // Combinar y ordenar
    return [...transaccionesValores]
      .sort((a, b) => b.fecha - a.fecha)
  } catch (error) {
    console.error('Error obteniendo movimientos:', error)
    return []
  }
},

  /**
   * Actualiza fondos con transacción
   */
  async actualizarFondos({ userId, bancoId, tipo, monto, destinatarioId }) {
    try {
      return await TransactionsService.crearTransaccion({
        userId,
        bancoId,
        tipo,
        monto,
        destinatarioId
      })
    } catch (error) {
      console.error('Error actualizando fondos:', error)
      throw error
    }
  },

  /**
   * Actualiza el fondo recaudado de forma segura
   */
  async actualizarFondoRecaudado(userId, bancoId, monto, operacion = 'sumar') {
    try {
      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      
      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef)
        let fondoActual = 0
        
        if (walletSnap.exists()) {
          fondoActual = walletSnap.data().fondo_recaudado || 0
        }

        const nuevoFondo = operacion === 'sumar' 
          ? fondoActual + Number(monto)
          : fondoActual - Number(monto)

        transaction.set(walletRef, {
          fondo_recaudado: nuevoFondo,
          updatedAt: serverTimestamp()
        }, { merge: true })
      })

      return { success: true }
    } catch (error) {
      console.error('Error actualizando fondo recaudado:', error)
      throw error
    }
  }
}

export default WalletService