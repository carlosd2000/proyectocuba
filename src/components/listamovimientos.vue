<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Chevron_right from '../assets/icons/Chevron_right.svg'
import IconoRetiro from '../assets/icons/Retiro.svg'
import IconoDia from '../assets/icons/Dia.svg'
import IconoTarde from '../assets/icons/Tarde.svg'
import IconoNoche from '../assets/icons/Noche.svg'
import IconoGanancia from '../assets/icons/Ganancia.svg'
import IconoDeposito from '../assets/icons/Deposito.svg'

const router = useRouter()

const props = defineProps({
  movimientos: {
    type: Array,
    default: () => []
  },
  ganancias: {
    type: Array,
    default: () => []
  }
})

// Combinar y formatear movimientos y ganancias
const transaccionesCombinadas = computed(() => {
  // Formatear ganancias para estructura compatible
  const gananciasFormateadas = props.ganancias.map(g => ({
    id: g.id,
    tipo: 'Ganancia',
    monto: g.monto || g.Ganancia, // Compatibilidad con ambos nombres
    fecha: g.fecha,
    // Mantener otros campos importantes
    horario: g.horario,
    apuestaId: g.apuestaId
  }))
  
  // Combinar y ordenar por fecha (más reciente primero)
  return [...props.movimientos, ...gananciasFormateadas]
    .sort((a, b) => b.fecha - a.fecha)
})

// Debug: ver datos en consola
watch(transaccionesCombinadas, (newVal) => {
  console.log("Transacciones combinadas:", newVal)
}, { immediate: true })

const iconoPorTipo = (tipo) => {
  const iconos = {
    'Retiro': IconoRetiro,
    'Depósito': IconoDeposito,
    'Tiro del Dia': IconoDia,
    'Tiro de la Tarde': IconoTarde,
    'Tiro de la Noche': IconoNoche,
    'Ganancia': IconoGanancia
  }
  return iconos[tipo] || ''
}

const formatFecha = (fecha) => {
  if (!fecha) return '';
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const irAMovimiento = (tipo) => {
  if (tipo !== 'Depósito' && tipo !== 'Ganancia') {
    router.push('/lista/movimientos')
  }
}
</script>

<template>
  <div class="contenedor p-1 d-flex flex-column align-items-center justify-content-center">
    <li 
      v-for="(movimiento, index) in transaccionesCombinadas" 
      :key="index" 
      class="container-list d-flex flex-row justify-content-center align-items-center gap-3"
    >
    <div v-if="movimiento.tipo === 'Retiro' || movimiento.tipo === 'Depósito' " class="container-list d-flex flex-row justify-content-center align-items-center gap-3">
      <img 
        :src="iconoPorTipo(movimiento.tipo)" 
        :alt="movimiento.tipo" 
        width="20px"
        :class="movimiento.tipo === 'Depósito'  ? 'verde' : ''"
      >
      <div class="d-flex flex-row justify-content-between w-100">
        <div class="d-flex flex-column justify-content-center align-items-start">
          <h5 class="body">
            {{ ['Tiro de la Noche', 'Tiro de la Tarde', 'Tiro del Dia'].includes(movimiento.tipo) ? 'Tiro' : movimiento.tipo }}
          </h5>
          <h5 class="small">
            {{ formatFecha(movimiento.fecha) }}
          </h5>
        </div>
        <h5 
          class="body-bold" 
          :class="{
            'text-success': movimiento.monto >= 0 && !['Depósito', 'Retiro'].includes(movimiento.tipo),
            'text-danger': movimiento.monto < 0 && !['Depósito', 'Retiro'].includes(movimiento.tipo)
          }"
        >
          ${{ Math.abs(movimiento.monto).toLocaleString() }}
        </h5>
      </div>
      <img 
        :src="Chevron_right" 
        alt="Ver detalle" 
        style="cursor: pointer;" 
        :style="{ visibility: !['Depósito', 'Ganancia'].includes(movimiento.tipo) ? 'visible' : 'hidden' }" 
        @click="irAMovimiento(movimiento.tipo)" 
      />
    </div>
    <div v-else class="container-list d-flex flex-row justify-content-center align-items-center gap-3">
      <img 
        :src="iconoPorTipo(movimiento.tipo)" 
        :alt="movimiento.tipo" 
        width="20px" 
        :class="movimiento.tipo === 'Depósito'  ? 'verde' : ''"
      >
      <div class="d-flex flex-row justify-content-between w-100">
        <div class="d-flex flex-column justify-content-center align-items-start">
          <h5 class="body">
            {{ ['Tiro de la Noche', 'Tiro de la Tarde', 'Tiro del Dia'].includes(movimiento.horario) ? 'Tiro' : movimiento.horario }}
          </h5>
          <h5 class="small">
            {{ formatFecha(movimiento.fecha) }}
          </h5>
        </div>
        <h5 
          class="body-bold" 
          :class="{
            'text-success': movimiento.monto >= 0 && !['Depósito', 'Retiro'].includes(movimiento.tipo),
            'text-danger': movimiento.monto < 0 && !['Depósito', 'Retiro'].includes(movimiento.tipo)
          }"
        >
          ${{ Math.abs(movimiento.monto).toLocaleString() }}
        </h5>
      </div>
      <img 
        :src="Chevron_right" 
        alt="Ver detalle" 
        style="cursor: pointer;" 
        :style="{ visibility: !['Depósito', 'Ganancia'].includes(movimiento.tipo) ? 'visible' : 'hidden' }" 
        @click="irAMovimiento(movimiento.tipo)" 
      />
    </div>
    </li>
  </div>
</template>

<style scoped>
.contenedor {
  width: 100%;
  max-width: 400px;
  gap: 8px;
}
.container-list {
  box-sizing: border-box;
  padding: 12px 8px 12px 16px;
  height: 48px;
  width: 100%;
  border: 1px solid #F3F3F3;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
}
h5.small {
  color: #696974 !important;
}
img.verde {
  filter: invert(43%) sepia(85%) saturate(3743%) hue-rotate(84deg) brightness(95%) contrast(95%);
}
.text-success {
  color: #28a745;
}
.text-danger {
  color: #dc3545;
}
</style>