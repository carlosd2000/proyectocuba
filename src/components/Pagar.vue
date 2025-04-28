<template>
  <div class="container" style="max-width: 280px; margin-top: 0px;">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-top border-dark">
      <div class="celda text-center fw-bold">Totales</div>
      <div class="celda"></div>
      <div class="celda text-center">${{ totales.col3 }}</div>
      <div class="celda text-center">${{ totales.col4 }}</div>
      <div class="celda text-center">${{ totales.col5 }}</div>
    </div>

    <div class="text-start">
      <button class="btn btn-warning w-100 fw-bold d-flex justify-content-center align-items-center gap-2 btn-page">
        <span>Enviar</span>
        <span>${{ totales.col3 + totales.col4 + totales.col5 }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { filasFijas, filasExtra, calcularTotales } from '../scripts/operaciones.js'

const totales = computed(() => calcularTotales(filasFijas, filasExtra))
</script>

<style scoped>
.celda {
  width: 50px;
  font-size: 16px;
}
.btn-enter{
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
    background-color: #ffc107; /* Color original */
    color: #000000; /* Texto negro */
}

button {
  border: 2px solid black;
}
</style>
