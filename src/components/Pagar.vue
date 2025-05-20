<template>
  <div class="container" style="max-width: 280px; margin-top: 0px;">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-top border-dark">
      <div class="celda text-center fw-bold">Totales</div>
      <div class="celda"></div>
      <div class="celda text-center">${{ formatNumber(totales.col3) }}</div>
      <div class="celda text-center">${{ formatNumber(totales.col4) }}</div>
      <div class="celda text-center">${{ formatNumber(totales.col5) }}</div>
    </div>
    <div class="text-start">
      <button
        class="btn btn-warning w-100 fw-bold d-flex justify-content-center align-items-center gap-2 btn-page"
        @click="lanzarToast"
      >
        <span>Enviar</span>
        <span>${{ formatNumber(totalGeneral) }}</span>
      </button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger mt-2">
      {{ errorMessage }}
    </div>
  </div>
  <div v-if="mostrarToastSave" class="toast-container">
    <div
      class="toast show w-100 rounded-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="p-3 d-flex justify-content-center">
        <i class="mx-2 bi bi-check-circle-fill text-success"></i>
        {{ isOnline ? 'Jugada enviada' : 'Jugada guardada (offline)' }}
      </div>
    </div>
  </div>
  <div v-if="mostrarToastUpdate" class="toast-container">
    <div
      class="toast show w-100 rounded-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="p-3 d-flex justify-content-center">
        <i class="mx-2 bi bi-check-circle-fill text-success"></i>
        {{ isOnline ? 'Jugada actualizada' : 'Cambios guardados (offline)' }}
      </div>
    </div>
  </div>
  <div v-if="mostrarToastError" class="toast-container bg-danger">
    <div
      class="toast show w-100 rounded-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="p-3 d-flex justify-content-center text-white">
        <i class="mx-2 bi bi-exclamation-triangle-fill"></i>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePagar } from '../scripts/Pagar.js'

const {
  mostrarToastSave,
  mostrarToastUpdate,
  mostrarToastError,
  errorMessage,
  isOnline,
  formatNumber,
  totales,
  totalGeneral,
  lanzarToast
} = usePagar()
</script>

<style scoped>
.celda {
  width: 50px;
  font-size: 16px;
}

.btn-page {
  border: #000000 solid 2px;
  box-shadow: #000000 2px 2px 2px;
  border-radius: 6px;
  background-color: #ffc107;
  color: #000000;
}

.toast-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1055;
  border: 1px solid #000000c6;
  box-shadow: 1px -2px 1px #00000064;
  border-radius: 8px;
  background-color: rgb(235, 235, 235);
}

.bg-danger {
  background-color: #dc3545 !important;
}
</style>