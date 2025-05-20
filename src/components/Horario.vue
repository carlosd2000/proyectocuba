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
            <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push(`/listas/${$route.params.id}`)">
              {{ totalFormateado }}
            </button>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useHorario } from '../scripts/Horario.js'

  const props = defineProps({
    horarioEdicion: String,
    modoEdicion: Boolean
  })

  const {
    opciones,
    turnoSeleccionado,
    totalFormateado,
    iconoTurno,
    route,
    router
  } = useHorario(props)
  </script>
  
  
<style scoped>
  select:focus {
    box-shadow: none;
  }
  .bi {
    font-size: 1.2rem;
  }
</style>
