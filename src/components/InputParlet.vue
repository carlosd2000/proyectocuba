<template>
  <div class="container py-3" style="max-width: 320px;">
    <div class="col-8 ml-4 p-0 mb-0 border-bottom border-dark">
      <input type="text" class="form-control border-0" placeholder="Nombre (opcional)" />
    </div>

    <div v-for="fila in 5" :key="'fija-' + fila" class="mt-2 mb-3 d-flex justify-content-between align-items-center">
      <div class="celda"></div>
      <input type="number" class="form-input cuadrado celda" min="0" step="1" @keypress="soloEnteros($event)" />
      <div class="celda"></div>
      <div class="celda"></div>
      <div class="position-relative celda">
        <template v-if="fila === 3">
          <input type="number" placeholder="$" class="form-input circular mx-auto d-block"
            min="0" step="1" @keypress="soloEnteros($event)" v-model="filasFijas[2].circuloSolo" />
        </template>
      </div>
    </div>

    <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="mt-2 mb-3 d-flex justify-content-between align-items-center">
      <div class="celda"></div>
      <input type="number" class="form-input cuadrado celda" min="0" step="1" @keypress="soloEnteros($event)" />
      <div class="celda"></div>
      <div class="celda"></div>
      <div class="celda"></div>
    </div>

    <div class="d-flex justify-content-start">
      <button class="btn btn-dark rounded-circle p-0 d-flex justify-content-center align-items-center"
              style="width: 36px; height: 36px;" @click="agregarFila">
        <i class="bi bi-plus-lg text-white"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import { filasFijas, filasExtra, agregarFila, limpiarCampos } from '../scripts/operaciones.js'

const soloEnteros = (e) => {
  const charCode = e.which ? e.which : e.keyCode
  if (charCode < 48 || charCode > 57) {
    e.preventDefault()
  }
}

onUnmounted(() => {
  limpiarCampos()
})
</script>

<style scoped>
.form-input {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  outline: none;
  text-align: center;
  font-size: 14px;
}

.btn-enter{
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
    background-color: #ffc107; /* Color original */
    color: #000000; /* Texto negro */
}

.cuadrado {
  border-radius: 4px;
}

.circular {
  border-radius: 50%;
}

.celda {
  width: 40px;
}
/* Para navegadores WebKit (Chrome, Safari) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Para Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

</style>
