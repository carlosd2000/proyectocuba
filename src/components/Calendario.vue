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
import { ref, computed, watch, defineEmits } from 'vue'

const emit = defineEmits(['cambiar-fecha'])

const fecha = ref(new Date())
const numeros = ref('123 - 45 - 45')

// --- Unificación de lógica de selección de fecha ---
const fechaSeleccionada = ref(new Date())
const fechaSeleccionadaString = ref(fechaSeleccionada.value.toISOString().slice(0, 10))

watch(fechaSeleccionadaString, (val) => {
  fechaSeleccionada.value = new Date(val + 'T00:00:00')
})

// Actualiza el input cuando cambian las flechas
watch(fechaSeleccionada, (val) => {
  fechaSeleccionadaString.value = val.toISOString().slice(0, 10)
})

// Sincroniza la fecha visual del calendario con la seleccionada
watch(fechaSeleccionada, (val) => {
  fecha.value = new Date(val)
})

// Emite la fecha seleccionada cada vez que cambia
watch(fechaSeleccionada, (val) => {
  emit('cambiar-fecha', new Date(val))
})

// Formato visual para mostrar la fecha
const fechaFormateada = computed(() => {
  const dia = fechaSeleccionada.value.getDate().toString().padStart(2, '0')
  const mes = (fechaSeleccionada.value.getMonth() + 1).toString().padStart(2, '0')
  const anio = fechaSeleccionada.value.getFullYear()
  return `${dia}/${mes}/${anio}`
})

const diaAnterior = () => {
  fechaSeleccionada.value.setDate(fechaSeleccionada.value.getDate() - 1)
  fechaSeleccionada.value = new Date(fechaSeleccionada.value)
}

const diaSiguiente = () => {
  fechaSeleccionada.value.setDate(fechaSeleccionada.value.getDate() + 1)
  fechaSeleccionada.value = new Date(fechaSeleccionada.value)
}

// Función para comparar fechas (solo día, mes, año)
const esMismoDia = (fechaA, fechaB) => {
  const a = new Date(fechaA)
  const b = new Date(fechaB)
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
button {
  color: black;
}
</style>
