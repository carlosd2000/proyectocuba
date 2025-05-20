<template>
  <div class="d-flex align-items-center justify-content-center gap-3">
    <!-- Flecha izquierda -->
    <button class="btn btn-link fs-4" @click="diaAnterior">
      <i class="bi bi-chevron-left"></i>
    </button>

    <!-- Contenedor principal con ancho más ajustado -->
    <div
      class="bg-light rounded py-2 px-2 shadow-sm d-flex align-items-center justify-content-between"
      style="width: 210px;"
    >
      <!-- Columna 1: Luna -->
      <div class="d-flex align-items-center justify-content-center">
        <i class="bi bi-moon-stars-fill fs-5"></i>
      </div>

      <!-- Columna 2: Fecha y números -->
      <div class="text-center mx-1" style="width: 110px;">
        <div>{{ fechaFormateada }}</div>
        <div>{{ numeros }}</div>
        <!-- Selector de fecha editable -->
        <input
          type="date"
          v-model="fechaSeleccionadaString"
          class="form-control mt-1"
          style="max-width: 130px; font-size: 0.9rem;"
        />
      </div>

      <!-- Columna 3: Calendario -->
      <div class="d-flex align-items-center justify-content-center">
        <i class="bi bi-calendar fs-5"></i>
      </div>
    </div>

    <!-- Flecha derecha -->
    <button class="btn btn-link fs-4" @click="diaSiguiente">
      <i class="bi bi-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import { useCalendario } from '../scripts/calendario.js'

const emit = defineEmits(['cambiar-fecha'])

const {
  fecha,
  numeros,
  fechaSeleccionada,
  fechaSeleccionadaString,
  fechaFormateada,
  diaAnterior,
  diaSiguiente,
  esMismoDia
} = useCalendario(emit)
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
button {
  color: black;
}
</style>
