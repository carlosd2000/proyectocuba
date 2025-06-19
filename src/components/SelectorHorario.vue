<template>
  <div class="container">
    <div class="d-flex justify-content-start">
      <div class="d-flex align-items-center justify-content-between border-0 p-1 bg-white" style="min-width: 200px;">    
        <!-- Contenedor del SVG con estilos personalizados -->
        <div class="svg-turno-container d-flex align-items-center">
          <img :src="lunaSvg" alt="Luna" style="width: 60px; height: 50px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHorario } from '../scripts/Horario.js'
import lunaSvg from '../assets/icons/Luna.svg'

const props = defineProps({
  horarioEdicion: String,
  modoEdicion: Boolean
})

const {
  totalFormateado,
  router,
  route
} = useHorario(props)
</script>

<style scoped>
  select:focus {
    box-shadow: none;
  }
  .bi {
    font-size: 1.2rem;
  }

 .svg-turno-container {
  width: 64px;
  height: 48px;
  border-radius: 60px;
  padding-left: 8px;
  padding-right: 4px;
}

</style>
