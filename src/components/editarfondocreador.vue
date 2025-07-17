<script setup>
import { ref, computed, watch } from 'vue'
import { useUsuariosCreados } from '@/scripts/useUsuariosCreados'
import { useFondoCreador } from '@/scripts/useFondoCreador'

const { usuariosCreados } = useUsuariosCreados()
const { agregarCambioFondo } = useFondoCreador()

const usuarioSeleccionadoId = ref('')
const usuarioSeleccionadoTipo = ref('')
const valor = ref(0)

const usuarioSeleccionado = computed(() =>
  usuariosCreados.value.find(u => u.uid === usuarioSeleccionadoId.value)
)

watch(usuarioSeleccionadoId, (nuevoId) => {
  const u = usuariosCreados.value.find(u => u.uid === nuevoId)
  usuarioSeleccionadoTipo.value = u?.tipo || ''
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

<template>
  <div>
    <h2>Modificar fondo de usuario creado</h2>

    <label for="usuario-select">Selecciona un usuario:</label>
    <select v-model="usuarioSeleccionadoId" id="usuario-select">
      <option disabled value="">-- Selecciona --</option>
      <option v-for="usuario in usuariosCreados" :key="usuario.uid" :value="usuario.uid">
        {{ usuario.nombre }} ({{ usuario.tipo }})
      </option>
    </select>

    <div v-if="usuarioSeleccionadoId">
      <p>Fondo actual: <strong>${{ usuarioSeleccionado?.fondo?.toLocaleString() }}</strong></p>
      <input v-model.number="valor" type="number" placeholder="Cantidad" />
      <button @click="agregar">Agregar</button>
      <button @click="quitar">Quitar</button>
    </div>
  </div>
</template>
