<template>
    <div class="container">
      <div class="d-flex justify-content-end">
        <div class="d-flex align-items-center justify-content-between border-0 p-1 bg-white" style="min-width: 200px;">
          <!-- Selector de Turno con ícono -->
          <div class="d-flex align-items-center gap-2">
            <i :class="iconoTurno"></i>
            <select v-model="turnoSeleccionado" class="form-select form-select-sm border-0 p-0 bg-transparent text-dark fw-semibold" style="width: auto;">
              <option v-for="opcion in opciones" :key="opcion" :value="opcion">{{ opcion }}</option>
            </select>
          </div>
  
          <!-- Precio -->
          <div class="ms-4 fw-bold text-dark">
            <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push('/listas')">
              {{ precio }}
            </button>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  // Opciones disponibles
  const opciones = ['Día', 'Noche']
  const turnoSeleccionado = ref('Día')
  
  // Precio cambia según el turno
  const precio = computed(() => {
    return turnoSeleccionado.value === 'Día' ? '$10,000.00' : '$10,000.00'
  })
  
  // Ícono cambia según el turno seleccionado
  const iconoTurno = computed(() => {
    return turnoSeleccionado.value === 'Día' ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-fill text-primary'
  })
  </script>
  
  <style scoped>
  select:focus {
    box-shadow: none;
  }
  .bi {
    font-size: 1.2rem;
  }
  </style>
  