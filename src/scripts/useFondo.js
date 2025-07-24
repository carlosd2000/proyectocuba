import { ref, computed, onUnmounted } from 'vue'
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import localforage from 'localforage'
import { useAuthStore } from '@/stores/authStore'
import { WalletService } from '@/firebase/walletService'
import { TransactionsService } from '@/firebase/transactionsService'

// Variables de estado globales
let fondoBase = ref(0)
let cambiosPendientes = ref([])
let sincronizando = ref(false)
let intervalo = null
let instanciaIniciada = false
let usuariosHijos = ref([])

export function useFondo() {
  const authStore = useAuthStore()

  const userId = computed(() => authStore.userId)
  const userType = computed(() => authStore.userType)
  const bancoId = computed(() => authStore.bancoId)
  
  const walletRef = computed(() => doc(db, `bancos/${bancoId.value}/wallets/${userId.value}`))

  const fondoActual = computed(() => {
    const totalCambios = cambiosPendientes.value.reduce((acc, c) => {
      // Sumamos el valor directamente (ya viene con signo correcto)
      return acc + c.valor
    }, 0)
    return fondoBase.value + totalCambios
  })

  const puedeRetirar = computed(() => {
    return userType.value !== 'listeros'
  })

  const cargarUsuariosHijos = async () => {
    try {
      usuariosHijos.value = []

      if (userType.value === 'listeros') {
        if (authStore.profile?.creadorDirectoId && authStore.profile?.creadorDirectoTipo) {
          const padreRef = doc(db, `bancos/${bancoId.value}/${authStore.profile.creadorDirectoTipo}/${authStore.profile.creadorDirectoId}`)
          const padreSnap = await getDoc(padreRef)
          
          if (padreSnap.exists()) {
            usuariosHijos.value = [{
              id: padreSnap.id,
              nombre: padreSnap.data().nombre,
              tipo: authStore.profile.creadorDirectoTipo,
              esPadre: true
            }]
          }
        }
      } else if (userType.value === 'colectores') {
        if (authStore.profile?.creadorDirectoId && authStore.profile?.creadorDirectoTipo) {
          const padreRef = doc(db, `bancos/${bancoId.value}/${authStore.profile.creadorDirectoTipo}/${authStore.profile.creadorDirectoId}`)
          const padreSnap = await getDoc(padreRef)
          
          if (padreSnap.exists()) {
            usuariosHijos.value.push({
              id: padreSnap.id,
              nombre: padreSnap.data().nombre,
              tipo: authStore.profile.creadorDirectoTipo,
              esPadre: true
            })
          }
        }
        
        const listerosRef = collection(db, `bancos/${bancoId.value}/listeros`)
        const q = query(listerosRef, where('creadorDirectoId', '==', userId.value))
        const snapshot = await getDocs(q)
        
        snapshot.docs.forEach(doc => {
          usuariosHijos.value.push({
            id: doc.id,
            nombre: doc.data().nombre,
            tipo: 'listeros',
            esPadre: false
          })
        })
      } else if (userType.value === 'colectorPrincipal') {
        const bancoRef = doc(db, `bancos/${bancoId.value}`)
        const bancoSnap = await getDoc(bancoRef)
        
        if (bancoSnap.exists()) {
          usuariosHijos.value.push({
            id: bancoSnap.id,
            nombre: bancoSnap.data().nombre,
            tipo: 'bancos',
            esPadre: true
          })
        }
        
        const colectoresRef = collection(db, `bancos/${bancoId.value}/colectores`)
        const colectoresSnapshot = await getDocs(colectoresRef)
        
        colectoresSnapshot.docs.forEach(doc => {
          usuariosHijos.value.push({
            id: doc.id,
            nombre: doc.data().nombre,
            tipo: 'colectores',
            esPadre: false
          })
        })
        
        const listerosRef = collection(db, `bancos/${bancoId.value}/listeros`)
        const listerosSnapshot = await getDocs(listerosRef)
        
        listerosSnapshot.docs.forEach(doc => {
          usuariosHijos.value.push({
            id: doc.id,
            nombre: doc.data().nombre,
            tipo: 'listeros',
            esPadre: false
          })
        })
      } else if (userType.value === 'bancos') {
        const colectorPrincipalRef = collection(db, `bancos/${bancoId.value}/colectorPrincipal`)
        const cpSnapshot = await getDocs(colectorPrincipalRef)
        
        cpSnapshot.docs.forEach(doc => {
          usuariosHijos.value.push({
            id: doc.id,
            nombre: doc.data().nombre,
            tipo: 'colectorPrincipal',
            esPadre: false
          })
        })
        
        const colectoresRef = collection(db, `bancos/${bancoId.value}/colectores`)
        const colectoresSnapshot = await getDocs(colectoresRef)
        
        colectoresSnapshot.docs.forEach(doc => {
          usuariosHijos.value.push({
            id: doc.id,
            nombre: doc.data().nombre,
            tipo: 'colectores',
            esPadre: false
          })
        })
        
        const listerosRef = collection(db, `bancos/${bancoId.value}/listeros`)
        const listerosSnapshot = await getDocs(listerosRef)
        
        listerosSnapshot.docs.forEach(doc => {
          usuariosHijos.value.push({
            id: doc.id,
            nombre: doc.data().nombre,
            tipo: 'listeros',
            esPadre: false
          })
        })
      }
    } catch (error) {
      console.error('Error cargando usuarios hijos:', error)
      usuariosHijos.value = []
    }
  }

  const realizarTransferencia = async ({ destinatarioId, tipo, monto, destinatarioTipo }) => {
    try {
      if (!destinatarioId || !destinatarioTipo) {
        throw new Error('No se ha seleccionado un destinatario válido')
      }

      await TransactionsService.inicializarEstructura(userId.value, bancoId.value)
      await TransactionsService.inicializarEstructura(destinatarioId, bancoId.value)

      // Lógica corregida para determinar emisor/receptor
      const esListeroEnviandoAPadre = userType.value === 'listeros' && tipo === 'deposito'
      const esRetiro = tipo === 'retiro'

      const emisorId = esRetiro ? destinatarioId : userId.value
      const receptorId = esRetiro ? userId.value : destinatarioId

      const result = await WalletService.transferirFondos({
        emisorId,
        receptorId,
        bancoId: bancoId.value,
        monto
      })

      if (result.success) {
        // Lógica corregida para cambios locales
        if (esListeroEnviandoAPadre) {
          // Para listeros enviando a padre: sumar al pendiente (retiro)
          await agregarCambioLocal('retiro', -Math.abs(monto))
        } else if (userType.value !== 'listeros') {
          // Para otros usuarios: registrar cambio local inverso
          await agregarCambioLocal(tipo === 'deposito' ? 'retiro' : 'deposito', 
                                tipo === 'deposito' ? -monto : monto)
        }
        return { success: true }
      } else {
        throw new Error(result.error || 'Error en la transferencia')
      }
    } catch (error) {
      console.error('Error en transferencia:', error)
      return { success: false, error: error.message }
    }
  }

  const cargarLocal = async () => {
    try {
      const fondo = await localforage.getItem('fondoBase')
      fondoBase.value = fondo !== null ? fondo : 0
      
      const cambios = await localforage.getItem('cambiosPendientes')
      cambiosPendientes.value = cambios ? JSON.parse(cambios) : []
    } catch (error) {
      console.error('Error cargando datos locales:', error)
      fondoBase.value = 0
      cambiosPendientes.value = []
    }
  }

  const guardarLocal = async () => {
    try {
      await localforage.setItem('fondoBase', fondoBase.value)
      await localforage.setItem('cambiosPendientes', JSON.stringify(cambiosPendientes.value))
    } catch (error) {
      console.error('Error guardando datos locales:', error)
    }
  }

  const agregarCambioLocal = async (tipo, valor) => {
    // Asegurarnos de manejar correctamente el signo
    const valorNumerico = Number(valor)
    const cambio = {
      tipo,
      valor: valorNumerico,
      timestamp: Date.now()
    }
    cambiosPendientes.value.push(cambio)
    await guardarLocal()
  }

  const cargarFondoRemoto = async () => {
    try {
      const walletSnap = await getDoc(walletRef.value)
      if (walletSnap.exists()) {
        const { resultados } = await TransactionsService.getGroupedTransactions(userId.value, bancoId.value)
        return resultados.depositos - resultados.retiros - resultados.ganancias.Total - resultados.tiros.Total
      }
      return 0
    } catch (error) {
      console.error('Error cargando fondo remoto:', error)
      return 0
    }
  }

  const sincronizar = async () => {
    if (sincronizando.value || !navigator.onLine) return

    sincronizando.value = true
    try {
      const fondoRemoto = await cargarFondoRemoto()
      const totalCambios = cambiosPendientes.value.reduce((acc, c) => acc + c.valor, 0)
      const nuevoFondo = fondoRemoto + totalCambios

      await setDoc(walletRef.value, {
        fondo_recaudado: nuevoFondo,
        updatedAt: serverTimestamp()
      }, { merge: true })

      fondoBase.value = nuevoFondo
      cambiosPendientes.value = []
      await guardarLocal()
    } catch (err) {
      console.error('Error al sincronizar fondo:', err)
    } finally {
      sincronizando.value = false
    }
  }

  const iniciarSincronizacionCada5Min = () => {
    if (intervalo) clearInterval(intervalo)
    
    intervalo = setInterval(() => {
      if (navigator.onLine) {
        sincronizar()
      }
    }, 5 * 60 * 1000)
    
    window.addEventListener('online', sincronizar)
  }

  const detenerSincronizacion = () => {
    if (intervalo) {
      clearInterval(intervalo)
      intervalo = null
    }
    window.removeEventListener('online', sincronizar)
  }

  const iniciar = async () => {
    if (instanciaIniciada) return
    
    await cargarLocal()
    await cargarUsuariosHijos()
    if (navigator.onLine) await sincronizar()
    iniciarSincronizacionCada5Min()
    instanciaIniciada = true
  }

  onUnmounted(() => {
    detenerSincronizacion()
  })

  return {
    fondoBase,
    fondoActual,
    usuariosHijos,
    puedeRetirar,
    cargarUsuariosHijos,
    realizarTransferencia,
    agregarCambioLocal,
    sincronizar,
    walletRef,
    iniciar,
    detenerSincronizacion,
    cargarLocal,
    guardarLocal
  }
}

export function resetFondo() {
  fondoBase.value = 0
  cambiosPendientes.value = []
  sincronizando.value = false
  instanciaIniciada = false
  usuariosHijos.value = []

  if (intervalo) {
    clearInterval(intervalo)
    intervalo = null
  }

  localforage.removeItem('fondoBase')
  localforage.removeItem('cambiosPendientes')
}