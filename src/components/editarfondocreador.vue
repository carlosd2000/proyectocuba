<template>
  <div>
    <h2>Modificar fondo de usuario creado</h2>

    <label for="usuario-select">Selecciona un usuario:</label>
    <select v-model="usuarioSeleccionadoId" id="usuario-select">
      <option disabled value="">-- Selecciona --</option>
      <option v-for="usuario in usuarios" :key="usuario.uid" :value="usuario.uid">
        {{ usuario.nombre }} ({{ usuario.tipo }})
      </option>
    </select>

    <div v-if="usuarioSeleccionadoId">
      <input v-model.number="valor" type="number" placeholder="Cantidad" />
      <button @click="agregar">Agregar</button>
      <button @click="quitar">Quitar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/authStore'
import { useFondoCreador } from '../scripts/useFondoCreador'

const authStore = useAuthStore()
const creadorId = computed(() => {
  console.log('creadorId:', authStore.userId)
  return authStore.userId
})
const bancoId = computed(() => {
  console.log('bancoId:', authStore.bancoId)
  return authStore.bancoId
})
const userType = computed(() => {
  console.log('userType:', authStore.userType)
  return authStore.userType
})

const { agregarCambioFondo } = useFondoCreador()

const usuarios = ref([])
const usuarioSeleccionadoId = ref('')
const usuarioSeleccionadoTipo = ref('')
const valor = ref(0)

const tiposPorRol = computed(() => {
  if (userType.value === 'bancos') return ['colectoresPrincipales', 'colectores', 'listeros']
  else if (userType.value === 'colectorPrincipal') return ['colectores', 'listeros']
  else if (userType.value === 'colectores') return ['listeros']
  return []
})

const cargarUsuarios = async () => {
  const usuariosCreados = []

  for (const tipo of tiposPorRol.value) {
    const colRef = collection(db, `bancos/${bancoId.value}/${tipo}`)
    const q = query(colRef, where('creadorId', '==', creadorId.value))
    const snap = await getDocs(q)

    snap.forEach(docSnap => {
      const data = docSnap.data()
      usuariosCreados.push({
        uid: docSnap.id,
        tipo,
        nombre: data.nombre || 'Sin nombre'
      })
    })
  }

  usuarios.value = usuariosCreados
}

onMounted(cargarUsuarios)

watch(usuarioSeleccionadoId, (nuevoId) => {
  const seleccionado = usuarios.value.find(u => u.uid === nuevoId)
  usuarioSeleccionadoTipo.value = seleccionado?.tipo || ''
})

const agregar = async () => {
  if (valor.value > 0) {
    await agregarCambioFondo(usuarioSeleccionadoId.value, 'creador-agrega', usuarioSeleccionadoTipo.value, Math.abs(valor.value))
  }
}

const quitar = async () => {
  if (valor.value > 0) {
    await agregarCambioFondo(usuarioSeleccionadoId.value, 'creador-quita', usuarioSeleccionadoTipo.value, -Math.abs(valor.value))
  }
}
</script>

