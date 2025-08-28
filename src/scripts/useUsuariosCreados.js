// scripts/useUsuariosCreados.js
import { ref } from 'vue'
import localforage from 'localforage'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'

const usuariosCreados = ref([])
let intervalo = null

const cargarUsuariosCreados = async (authStore) => {
  const userId = authStore.userId
  const bancoId = authStore.bancoId
  const userType = authStore.userType
  const tiposPorRol = {
    bancos: ['colectoresPrincipales', 'colectores', 'listeros'],
    colectorPrincipal: ['colectores', 'listeros'],
    colectores: ['listeros']
  }

  const tipos = tiposPorRol[userType] || []

  const nuevosUsuarios = []
  
  for (const tipo of tipos) {
    const colRef = collection(db, `bancos/${bancoId}/${tipo}`)
    const q = query(colRef, where('creadorDirectoId', '==', userId))
    const snap = await getDocs(q)

    snap.forEach(docSnap => {
      const data = docSnap.data()
      nuevosUsuarios.push({
        uid: docSnap.id,
        tipo,
        nombre: data.nombre || 'Sin nombre',
        fondo: data.fondo || 0
      })
    })
  }

  usuariosCreados.value = nuevosUsuarios
  await localforage.setItem('usuariosCreados', nuevosUsuarios)
}

const iniciar = async () => {
  const { useAuthStore } = await import('@/stores/authStore') // ✅ Importa dinámicamente
  const authStore = useAuthStore()

  // Carga inicial desde local
  usuariosCreados.value = await localforage.getItem('usuariosCreados') || []

  // Primera carga desde Firestore
  await cargarUsuariosCreados(authStore)

  // Actualiza cada 10 minutos
  intervalo = setInterval(() => {
    cargarUsuariosCreados(authStore)
  }, 10 * 60 * 1000)
}

const detener = () => {
  if (intervalo) clearInterval(intervalo)
}

let singleton = null

export function useUsuariosCreados() {
  if (!singleton) {
    singleton = {
      usuariosCreados,
      iniciar,
      detener
    }
  }
  return singleton
}
export function resetUsuariosCreados() {
  usuariosCreados.value = []
  if (intervalo) clearInterval(intervalo)
  intervalo = null
  localforage.removeItem('usuariosCreados')
}