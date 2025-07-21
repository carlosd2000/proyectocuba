// scripts/useFondo.js
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import localforage from 'localforage'
import { useAuthStore } from '@/stores/authStore'

// Variables de estado globales (singleton pattern)
let fondoBase = ref(0)
let cambiosPendientes = ref([])
let sincronizando = ref(false)
let intervalo = null
let instanciaIniciada = false

export function useFondo() {
  const authStore = useAuthStore()

  const userId = computed(() => authStore.userId)
  const userType = computed(() => authStore.userType)
  const bancoId = computed(() => authStore.bancoId)
  const rutaJerarquica = computed(() =>
    `bancos/${bancoId.value}/${userType.value}/${userId.value}`
  )

  const fondoRef = computed(() => doc(db, rutaJerarquica.value))

  const fondoActual = computed(() => {
    const totalCambios = cambiosPendientes.value.reduce((acc, c) => acc + c.valor, 0)
    return fondoBase.value + totalCambios
  })

  const ajustarFondoPorApuesta = async (tipoOperacion, monto, montoAnterior = 0) => {
    let ajuste = 0;
    
    switch(tipoOperacion) {
      case 'CREACION':
        ajuste = monto;
        break;
      case 'ELIMINACION':
        ajuste = -monto;
        break;
      case 'EDICION':
        ajuste = monto - montoAnterior; // Si nuevo monto es mayor, resta la diferencia
        break;
    }

    if (ajuste !== 0) {
      const tipo = `apuesta-${tipoOperacion.toLowerCase()}`;
      await agregarCambioLocal(tipo, ajuste);
    }
    return ajuste;
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
    const cambio = { tipo, valor: Number(valor), timestamp: Date.now() }
    cambiosPendientes.value.push(cambio)
    await guardarLocal()
  }

  const sincronizar = async () => {
    if (sincronizando.value || !navigator.onLine) return

    sincronizando.value = true
    try {
      const snap = await getDoc(fondoRef.value)
      const fondoRemoto = snap.exists() ? snap.data().fondo || 0 : 0

      const totalCambios = cambiosPendientes.value.reduce((acc, c) => acc + c.valor, 0)
      const nuevoFondo = fondoRemoto + totalCambios

      await setDoc(fondoRef.value, {
        fondo: nuevoFondo,
        actualizado: serverTimestamp()
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
    // Limpiar intervalo existente si hay uno
    if (intervalo) clearInterval(intervalo)
    
    intervalo = setInterval(() => {
      if (navigator.onLine) {
        sincronizar()
      }
    }, 10 * 60 * 1000) // 5 minutos
    
    // Listener para cuando regrese la conexión
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
    if (navigator.onLine) await sincronizar()
    iniciarSincronizacionCada5Min()
    instanciaIniciada = true
  }

  return {
    fondoBase,
    fondoActual,
    agregarCambioLocal,
    sincronizar,
    rutaJerarquica,
    fondoRef,
    iniciar,
    detenerSincronizacion,
    ajustarFondoPorApuesta,
  }
}

export function resetFondo() {
  fondoBase.value = 0
  cambiosPendientes.value = []
  sincronizando.value = false
  instanciaIniciada = false

  if (intervalo) {
    clearInterval(intervalo)
    intervalo = null
  }

  // Borra datos locales también
  localforage.removeItem('fondoBase')
  localforage.removeItem('cambiosPendientes')
}