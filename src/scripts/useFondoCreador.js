// scripts/useFondoCreador.js
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import localforage from 'localforage'
import { useAuthStore } from '@/stores/authStore'

const fondosLocales = ref({})       // { [userId]: fondoBase }
const cambiosLocales = ref({})      // { [userId]: [cambios] }
const sincronizando = ref(false)

const authStore = useAuthStore()
const bancoId = computed(() => authStore.bancoId)

let intervalId = null // Necesario para poder detener el setInterval luego

const cargarLocal = async () => {
  fondosLocales.value = await localforage.getItem('fondosCreador') || {}
  cambiosLocales.value = await localforage.getItem('cambiosFondosCreador') || {}
}

const guardarLocal = async () => {
  await localforage.setItem('fondosCreador', JSON.parse(JSON.stringify(fondosLocales.value)))
  await localforage.setItem('cambiosFondosCreador', JSON.parse(JSON.stringify(cambiosLocales.value)))
}

const agregarCambioFondo = async (usuarioId, tipo, tipoUsuario, valor) => {
  const cambio = { tipo, valor, timestamp: Date.now(), tipoUsuario }
  cambiosLocales.value[usuarioId] = cambiosLocales.value[usuarioId] || []
  cambiosLocales.value[usuarioId].push(cambio)
  await guardarLocal()
}

const sincronizarFondos = async () => {
  if (sincronizando.value || !navigator.onLine) return
  sincronizando.value = true

  try {
    for (const usuarioId in cambiosLocales.value) {
      const cambios = cambiosLocales.value[usuarioId]
      if (!cambios || cambios.length === 0) continue

      const tipoUsuario = cambios[0].tipoUsuario
      const refDoc = doc(db, `bancos/${bancoId.value}/${tipoUsuario}/${usuarioId}`)
      const snap = await getDoc(refDoc)
      const remoto = snap.exists() ? snap.data().fondo || 0 : 0

      const sumaCambios = cambios.reduce((acc, c) => acc + c.valor, 0)
      const nuevoFondo = remoto + sumaCambios

      await setDoc(refDoc, {
        fondo: nuevoFondo,
        actualizado: serverTimestamp()
      }, { merge: true })

      fondosLocales.value[usuarioId] = nuevoFondo
      cambiosLocales.value[usuarioId] = []
    }

    await guardarLocal()
  } catch (err) {
    console.error('Error al sincronizar fondos del creador:', err)
  } finally {
    sincronizando.value = false
  }
}

const iniciarSincronizacionCada5Min = () => {
  intervalId = setInterval(() => {
    if (navigator.onLine) sincronizarFondos()
    else window.addEventListener('online', sincronizarFondos, { once: true })
  }, 1 * 60 * 1000)
}

const detenerSincronizacion = () => {
  if (intervalId) clearInterval(intervalId)
}

const iniciar = async () => {
  await cargarLocal()
  if (navigator.onLine) await sincronizarFondos()
  iniciarSincronizacionCada5Min()
}

let fondoCreadorManager = null

export function useFondoCreador() {
  if (!fondoCreadorManager) {
    fondoCreadorManager = {
      agregarCambioFondo,
      fondosLocales,
      cambiosLocales,
      sincronizarFondos,
      iniciar,
      detenerSincronizacion
    }
  }
  return fondoCreadorManager
}
