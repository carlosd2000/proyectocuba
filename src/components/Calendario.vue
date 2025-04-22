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
  import { ref, computed } from 'vue'
  
  const fecha = ref(new Date(2025, 8, 11))
  const numeros = ref('123 - 45 - 45')
  
  const fechaFormateada = computed(() => {
    const dia = fecha.value.getDate().toString().padStart(2, '0')
    const mes = (fecha.value.getMonth() + 1).toString().padStart(2, '0')
    const anio = fecha.value.getFullYear()
    return `${dia}/${mes}/${anio}`
  })
  
  const diaAnterior = () => {
    fecha.value.setDate(fecha.value.getDate() - 1)
    fecha.value = new Date(fecha.value)
  }
  
  const diaSiguiente = () => {
    fecha.value.setDate(fecha.value.getDate() + 1)
    fecha.value = new Date(fecha.value)
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
  