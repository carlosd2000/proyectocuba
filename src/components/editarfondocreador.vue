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
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const creadorId = computed(() => authStore.userId)
const bancoId = computed(() => authStore.bancoId)
const userType = computed(() => authStore.userType)

const usuarios = ref([]) // [{ uid, tipo, Nombre }]
const usuarioSeleccionadoId = ref('')
const usuarioSeleccionadoTipo = ref('')
const valor = ref(0)

const tiposPorRol = computed(() => {
  console.log('Tipo actual:', userType.value)

  if (userType.value === 'bancos') {
    return ['colectoresPrincipales', 'colectores', 'listeros']
  } else if (userType.value === 'colectorPrincipal') {
    return ['colectores', 'listeros']
  } else if (userType.value === 'colectores') {
    return ['listeros']
  } else {
    return []
  }
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

onMounted(() => {
  cargarUsuarios()
})

watch(usuarioSeleccionadoId, (nuevoId) => {
  const seleccionado = usuarios.value.find(u => u.uid === nuevoId)
  usuarioSeleccionadoTipo.value = seleccionado?.tipo || ''
})

const agregar = () => {
  if (valor.value > 0) {
    actualizarFondo(+Math.abs(valor.value), 'creador-agrega')
  }
}

const quitar = () => {
  if (valor.value > 0) {
    actualizarFondo(-Math.abs(valor.value), 'creador-quita')
  }
}

const actualizarFondo = async (cambioValor, tipoCambio) => {
  if (!usuarioSeleccionadoId.value || !usuarioSeleccionadoTipo.value) return

  const ruta = `bancos/${bancoId.value}/${usuarioSeleccionadoTipo.value}/${usuarioSeleccionadoId.value}`
  const refDoc = doc(db, ruta)
  const snap = await getDoc(refDoc)

  const data = snap.exists() ? snap.data() : { fondo: 0, historial: [] }
  const historial = data.historial || []
  historial.push({ tipo: tipoCambio, valor: cambioValor, timestamp: Date.now() })

  const nuevoFondo = historial.reduce((acc, c) => acc + c.valor, 0)

  await setDoc(refDoc, {
    fondo: nuevoFondo,
    historial,
    actualizado: serverTimestamp()
  }, { merge: true })
}
</script>
