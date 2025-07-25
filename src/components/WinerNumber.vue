<script setup>
import { computed } from 'vue'

const props = defineProps({
  fecha: Date,
  horario: String
})

// Normalizamos el nombre del horario (sin tildes, lowercase)
function convertirHorarioAHorarioId(nombreHorario) {
  const limpio = nombreHorario.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const mapa = {
    'dia': '1',
    'tarde': '2',
    'noche': '3'
  }

  return mapa[limpio] || null
}

function obtenerTiroDeLocalStorage(fecha, horarioNombre) {
  const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}')
  const fechaStr = fecha.toISOString().slice(0, 10)
  const horarioId = convertirHorarioAHorarioId(horarioNombre)

  return tirosLocales?.[fechaStr]?.[horarioId]?.tiro || null
}

const partesTiro = computed(() => {
  const tiro = obtenerTiroDeLocalStorage(props.fecha, props.horario)
  if (tiro) {
    return tiro.split('-')
  }
  return ['---', '--', '--']
})
</script>

<template>
  <div class="d-flex flex-row gap-1">
    <h3>{{ partesTiro[0] }}</h3>
    <h3>{{ partesTiro[1] }}</h3>
    <h3>{{ partesTiro[2] }}</h3>
  </div>
</template>

<style scoped>
h3 {
  font-weight: bold;
}
</style>
