import { db } from '@/firebase/config'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'

export const WalletService = {
  // Crear o actualizar wallet al iniciar sesión
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
        retiro: 0,
        deposito: 0,
        ganancias: [],
        tiro_dia: [],
        tiro_tarde: [],
        tiro_noche: [],
        fondo_recaudado: 0,
        updatedAt: serverTimestamp()
      }

      if (!walletSnap.exists()) {
        // Crear nueva wallet
        await setDoc(walletRef, {
          ...walletData,
          createdAt: serverTimestamp()
        })
        return { success: true, message: 'Wallet creada' }
      } else {
        // Actualizar solo los campos necesarios
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

  // Obtener wallet del usuario
  async obtenerWallet(userId, bancoId) {
    try {
      if (!bancoId) return null
      
      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      const walletSnap = await getDoc(walletRef)
      
      if (walletSnap.exists()) {
        return walletSnap.data()
      }
      return null
    } catch (error) {
      console.error('Error obteniendo wallet:', error)
      throw error
    }
  },

  // Actualizar fondos
  async actualizarFondos({ userId, bancoId, tipo, monto, movimiento }) {
    try {
      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      const walletSnap = await getDoc(walletRef)

      if (!walletSnap.exists()) {
        throw new Error('Wallet no encontrada')
      }

      const walletData = walletSnap.data()
      let updates = {}

      switch (tipo) {
        case 'deposito':
          updates.deposito = (walletData.deposito || 0) + monto
          break
        case 'retiro':
          updates.retiro = (walletData.retiro || 0) + monto
          break
        case 'ganancia':
          updates.ganancias = [...(walletData.ganancias || []), movimiento]
          break
        case 'tiro_dia':
          updates.tiro_dia = [...(walletData.tiro_dia || []), movimiento]
          break
        case 'tiro_tarde':
          updates.tiro_tarde = [...(walletData.tiro_tarde || []), movimiento]
          break
        case 'tiro_noche':
          updates.tiro_noche = [...(walletData.tiro_noche || []), movimiento]
          break
        default:
          throw new Error('Tipo de movimiento no válido')
      }

      // Calcular fondo recaudado
      const fondoRecaudado = await this.calcularFondoRecaudado(walletData)
      updates.fondo_recaudado = fondoRecaudado

      await updateDoc(walletRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error actualizando fondos:', error)
      throw error
    }
  },

  // Calcular fondo recaudado
  async calcularFondoRecaudado(walletData) {
    try {
      // Sumar todos los depositos
      const totalDepositos = walletData.deposito || 0
      
      // Sumar todas las apuestas (asumiendo que tienes acceso a esta data)
      // Esto deberías implementarlo según tu estructura de apuestas
      const totalApuestas = 0 // Implementar lógica para obtener esto
      
      // Sumar ganancias totales
      const totalGanancias = walletData.ganancias?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0
      
      // Sumar retiros
      const totalRetiros = walletData.retiro || 0
      
      // Sumar premios a pagar (tiros ganadores)
      const totalPremiosDia = walletData.tiro_dia?.reduce((sum, t) => sum + (t.totalGlobal || 0), 0) || 0
      const totalPremiosTarde = walletData.tiro_tarde?.reduce((sum, t) => sum + (t.totalGlobal || 0), 0) || 0
      const totalPremiosNoche = walletData.tiro_noche?.reduce((sum, t) => sum + (t.totalGlobal || 0), 0) || 0
      const totalPremios = totalPremiosDia + totalPremiosTarde + totalPremiosNoche
      
      // Calcular fondo recaudado
      return totalDepositos + totalApuestas - totalGanancias - totalRetiros - totalPremios
    } catch (error) {
      console.error('Error calculando fondo recaudado:', error)
      return 0
    }
  },

  // Obtener movimientos para mostrar en ListaMovimientos.vue
  async obtenerMovimientos(userId, bancoId) {
    try {
      if (!bancoId) return []
      
      const walletRef = doc(db, `bancos/${bancoId}/wallets/${userId}`)
      const walletSnap = await getDoc(walletRef)
      
      if (!walletSnap.exists()) return []
      
      const walletData = walletSnap.data()
      const movimientos = []
      
      // Procesar depósitos
      if (walletData.deposito > 0) {
        movimientos.push({
          tipo: 'Deposito',
          monto: walletData.deposito,
          fecha: walletData.updatedAt?.toDate() || new Date()
        })
      }
      
      // Procesar retiros
      if (walletData.retiro > 0) {
        movimientos.push({
          tipo: 'Retiro',
          monto: -walletData.retiro,
          fecha: walletData.updatedAt?.toDate() || new Date()
        })
      }
      
      // Procesar ganancias
      walletData.ganancias?.forEach(g => {
        movimientos.push({
          tipo: 'Ganancia',
          monto: g.monto || 0,
          fecha: g.fecha?.toDate() || new Date()
        })
      })
      
      // Procesar tiros (simplificado - puedes ajustar según necesidades)
      walletData.tiro_dia?.forEach(t => {
        movimientos.push({
          tipo: 'Tiro del Dia',
          monto: -(t.totalGlobal || 0),
          fecha: t.fecha?.toDate() || new Date()
        })
      })
      
      walletData.tiro_tarde?.forEach(t => {
        movimientos.push({
          tipo: 'Tiro de la Tarde',
          monto: -(t.totalGlobal || 0),
          fecha: t.fecha?.toDate() || new Date()
        })
      })
      
      walletData.tiro_noche?.forEach(t => {
        movimientos.push({
          tipo: 'Tiro de la Noche',
          monto: -(t.totalGlobal || 0),
          fecha: t.fecha?.toDate() || new Date()
        })
      })
      
      // Ordenar por fecha (más reciente primero)
      return movimientos.sort((a, b) => b.fecha - a.fecha)
    } catch (error) {
      console.error('Error obteniendo movimientos:', error)
      return []
    }
  }
}

export default WalletService