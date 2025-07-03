<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Chevron_right from '../assets/icons/Chevron_right.svg'
import IconoRetiro from '../assets/icons/Retiro.svg'
import IconoDia from '../assets/icons/Dia.svg'
import IconoTarde from '../assets/icons/Atardecer.svg'
import IconoNoche from '../assets/icons/Luna.svg'
import IconoGanancia from '../assets/icons/Ganancia.svg'
import IconoDeposito from '../assets/icons/Deposito.svg'

const router = useRouter()
const route = useRoute()

// Datos simulados
const movimientos = ref([
  { id: 1, tipo: 'Tiro del Dia', monto: 5000, fecha: '2022-05-20' },
  { id: 2, tipo: 'Ganancia', monto: -15000, fecha: '2022-05-21' },
  { id: 3, tipo: 'Retiro', monto: 18000, fecha: '2022-05-22' },
  { id: 4, tipo: 'Deposito', monto: -5000, fecha: '2022-05-23' },
  { id: 5, tipo: 'Tiro de la Tarde', monto: 20000, fecha: '2022-05-24' },
  { id: 6, tipo: 'Ganancia', monto: -8000, fecha: '2022-05-25' },
  { id: 7, tipo: 'Retiro', monto: 15000, fecha: '2022-05-26' },
  { id: 8, tipo: 'Deposito', monto: -10000, fecha: '2022-05-27' },
  { id: 9, tipo: 'Tiro de la Noche', monto: 12000, fecha: '2022-05-28' },
  { id: 10, tipo: 'Ganancia', monto: -18000, fecha: '2022-05-29' },
  { id: 11, tipo: 'Retiro', monto: 25000, fecha: '2022-05-30' },
  { id: 12, tipo: 'Deposito', monto: -15000, fecha: '2022-05-31' },
  { id: 13, tipo: 'Tiro de la Tarde', monto: 20000, fecha: '2022-06-01' },
  { id: 14, tipo: 'Ganancia', monto: -10000, fecha: '2022-06-02' },
  { id: 15, tipo: 'Retiro', monto: 18000, fecha: '2022-06-03' },
  { id: 16, tipo: 'Deposito', monto: -5000, fecha: '2022-06-04' },
  { id: 17, tipo: 'Tiro del Dia', monto: 15000, fecha: '2022-06-05' },
  { id: 18, tipo: 'Ganancia', monto: -25000, fecha: '2022-06-06' },
  { id: 19, tipo: 'Retiro', monto: 12000, fecha: '2022-06-07' },
  { id: 20, tipo: 'Deposito', monto: -8000, fecha: '2022-06-08' },
])

function iconoPorTipo(tipo) {
  switch (tipo) {
    case 'Retiro': return IconoRetiro
    case 'Tiro del Dia': return IconoDia
    case 'Tiro de la Tarde': return IconoTarde
    case 'Tiro de la Noche': return IconoNoche
    case 'Ganancia': return IconoGanancia
    case 'Deposito': return IconoDeposito
    default: return '' // podrías usar un ícono por defecto aquí
  }
}
function iramovimiento(tipo) {
  if (tipo !== 'Deposito') {
    router.push(`/fondo/${route.params.id}`)
  }
}

</script>

<template>
  <div class="contenedor">
      <li v-for="movimiento in movimientos" :key="movimiento.id" class="container-list d-flex flex-row justify-content-center align-items-center gap-3">
        <img :src="iconoPorTipo(movimiento.tipo)" alt="" width="20px">
        <div class="d-flex flex-row justify-content-between w-100">
          <div class="d-flex flex-column justify-content-center align-items-start">
            <h5 class="body">
              {{ ['Tiro de la Noche', 'Tiro de la Tarde', 'Tiro del Dia'].includes(movimiento.tipo) ? 'Tiro' : movimiento.tipo }}
            </h5>
            <h5 class="small">
              {{ (movimiento.fecha).toLocaleString() }}
            </h5>
          </div>
          <h5 class="body-bold" :class="(movimiento.tipo !== 'Deposito de la Noche' && movimiento.monto >= 0) ? 'text-success' : (movimiento.tipo !== 'Deposito de la Noche' ? 'text-danger' : '')">
            ${{ (movimiento.monto).toLocaleString() }}
          </h5>
        </div>
        <img :src="Chevron_right" alt="" style="cursor: pointer;" :style="{ visibility: movimiento.tipo !== 'Deposito' ? 'visible' : 'hidden' }" @click="iramovimiento(movimiento)" />
      </li>
  </div>
</template>

<style scoped>
.contenedor {
  width: 100%;
  max-width: 400px;
}
.container-list{
  box-sizing: border-box;
  padding: 12px 8px 12px 16px;
  height: 48px;
  border: 1px solid #F3F3F3;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
}

h5.small{
  color: #696974 !important;
}

.text-success2 {
  color: #28a746c9;
}
.text-danger2 {
  color: #dc3546ba;
}
</style>
