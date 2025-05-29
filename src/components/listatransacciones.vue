<script setup>
import { ref } from 'vue'

// Datos simulados
const listeros = ref([
  { id: 1, tipo: 'Tiro de la Noche', monto: 5000, fecha: '2022-05-20' },
  { id: 2, tipo: 'Ganancia de la Noche', monto: -15000, fecha: '2022-05-21' },
  { id: 3, tipo: 'Retiro de la Noche', monto: 18000, fecha: '2022-05-22' },
  { id: 4, tipo: 'Deposito de la Noche', monto: -5000, fecha: '2022-05-23' },
  { id: 5, tipo: 'Tiro de la Noche', monto: 20000, fecha: '2022-05-24' },
  { id: 6, tipo: 'Ganancia de la Noche', monto: -8000, fecha: '2022-05-25' },
  { id: 7, tipo: 'Retiro de la Noche', monto: 15000, fecha: '2022-05-26' },
  { id: 8, tipo: 'Deposito de la Noche', monto: -10000, fecha: '2022-05-27' },
  { id: 9, tipo: 'Tiro de la Noche', monto: 12000, fecha: '2022-05-28' },
  { id: 10, tipo: 'Ganancia de la Noche', monto: -18000, fecha: '2022-05-29' },
  { id: 11, tipo: 'Retiro de la Noche', monto: 25000, fecha: '2022-05-30' },
  { id: 12, tipo: 'Deposito de la Noche', monto: -15000, fecha: '2022-05-31' },
  { id: 13, tipo: 'Tiro de la Noche', monto: 20000, fecha: '2022-06-01' },
  { id: 14, tipo: 'Ganancia de la Noche', monto: -10000, fecha: '2022-06-02' },
  { id: 15, tipo: 'Retiro de la Noche', monto: 18000, fecha: '2022-06-03' },
  { id: 16, tipo: 'Deposito de la Noche', monto: -5000, fecha: '2022-06-04' },
  { id: 17, tipo: 'Tiro de la Noche', monto: 15000, fecha: '2022-06-05' },
  { id: 18, tipo: 'Ganancia de la Noche', monto: -25000, fecha: '2022-06-06' },
  { id: 19, tipo: 'Retiro de la Noche', monto: 12000, fecha: '2022-06-07' },
  { id: 20, tipo: 'Deposito de la Noche', monto: -8000, fecha: '2022-06-08' },
])

// Estado reactivo para detalles abiertos por id
const detallesAbiertos = ref([])

function toggleDetails(id) {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter(openId => openId !== id)
  } 
  else {
    detallesAbiertos.value.push(id)
  }
}

function iconoPorTipo(tipo) {
  switch (tipo) {
    case 'Retiro de la Noche':
      return 'bi bi-arrow-up'
    case 'Tiro de la Noche':
      return 'bi bi-moon'
    case 'Ganancia de la Noche':
      return 'bi bi-currency-dollar'
    case 'Deposito de la Noche':
      return 'bi bi-arrow-down'
    default:
      return 'bi bi-question-circle'
  }
}
</script>

<template>
  <div class="contenedor">
    <ul>
      <li v-for="listero in listeros" :key="listero.id"  @click="toggleDetails(listero.id)" class="listero my-1 px-2 py-1 d-flex justify-content-between align-items-center">
        <div class="col-12 m-0 p-0 d-flex flex-column">
          <div class="col-12 m-0 p-0 container row">
            <div class="col-8 container row m-0 px-1">
              <i :class="iconoPorTipo(listero.tipo)" class="mx-2"></i>
              <h5 class="ngt">{{ listero.tipo }}</h5>
            </div>
            <div class="col-4 container m-0 p-0 d-flex flex-column justify-content-end align-items-center">
              <h5 class="ngt" :class="(listero.monto) >= 0 ? 'text-success' : 'text-danger'">
                ${{ (listero.monto).toLocaleString() }}
              </h5>
              <h5>
                {{ (listero.fecha).toLocaleString() }}
              </h5>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.contenedor {
  max-width: 600px;
  margin: auto;
  font-family: Arial, sans-serif;
}
.contenedor h5 {
  margin: 0;
  font-size: 0.6rem;
}
h5{
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

p{
  margin: 0;
  padding: 0;
  font-size: 0.7rem;
  color: #6e6e6e;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

i{
  margin: 0px;
  font-size: 1.2rem;
  text-shadow: 0 0 1.0px #000;
}
i.bi-chevron-up, i.bi-chevron-down {
  font-size: 0.9rem;
  text-shadow: 0 0 1.0px #000;
}

.listero {
  background-color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  position: relative;
}

.detalles-container {
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
}

h5.detalles-h5{
  font-size: 0.7rem;
}

.text-success2 {
  color: #28a746c9;
}
.text-danger2 {
  color: #dc3546ba;
}
</style>
