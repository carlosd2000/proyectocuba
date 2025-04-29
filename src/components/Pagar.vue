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
      <button class="btn btn-warning w-100 fw-bold d-flex justify-content-center align-items-center gap-2 btn-page" @click="lanzarToast">
        <span>Enviar</span>
        <span>${{ totales.col3 + totales.col4 + totales.col5 }}</span>
      </button>
    </div>
  </div>
  <div v-if="mostrarToastSave" class="toast-container">
        <div class="toast show w-100 rounded-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="p-3 d-flex justify-content-center">
                <i class="mx-2 bi bi-check-circle-fill text-success"></i>
                Jugada enviada
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { filasFijas, filasExtra, calcularTotales } from '../scripts/operaciones.js'

const totales = computed(() => calcularTotales(filasFijas, filasExtra))

const mostrarToastSave = ref(false);

const lanzarToast = () => {
  mostrarToastSave.value = true;
    // DESPUÉS DE 3 SEGUNDOS, OCULTA EL TOAST
    setTimeout(() => {
        mostrarToastSave.value = false;
    }, 3000);
};
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
.toast-container {
    position: fixed; /* Fijo en la pantalla */
    bottom: 0; /* Siempre en la parte inferior */
    left: 0;
    width: 100%; /* Ocupa todo el ancho */
    z-index: 1055; /* Encima de todo */
    border: 1px solid #000000c6;
    box-shadow: 1px -2px 1px #00000064;
    border-radius: 8px;
    background-color: rgb(235, 235, 235);
}
</style>
