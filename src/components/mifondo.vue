<template>
  <div>
    <h2>Modificar mi fondo</h2>
    <input v-model.number="valor" type="number" placeholder="Cantidad" />
    <button @click="agregar">Agregar</button>
    <button @click="quitar">Quitar</button>
    <p>Fondo base: ${{ fondoBase }}</p>
    <p>Fondo actual con cambios: ${{ fondoActual }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFondo } from '@/scripts/useFondo'

const valor = ref(0)
const { agregarCambioLocal, fondoBase, fondoActual } = useFondo()

const agregar = () => {
  if (valor.value > 0) agregarCambioLocal('usuario-agrega', valor.value)
}

const quitar = () => {
  if (valor.value > 0) agregarCambioLocal('usuario-quita', -valor.value)
}
</script>
