<template>
  <div class="container py-3" style="max-width: 320px;">
    <div class="mb-2">
      <input type="text" class="form-control" placeholder="Nombre (opcional)">
    </div>

    <div v-for="fila in 5" :key="'fija-' + fila" class="d-flex justify-content-between align-items-center mb-2">
      <div class="celda"></div>
      <input type="number" class="form-input cuadrado celda" min="0" step="1" @keypress="soloEnteros($event)" />
      <div v-for="col in 2" :key="'fija-circulo-' + fila + '-' + col" class="celda">
        <input type="number" placeholder="$" class="form-input circular" min="0" step="1"
               @keypress="soloEnteros($event)" v-model="filasFijas[fila - 1]['circulo' + col]" />
      </div>
      <div class="celda">
        <template v-if="fila === 3">
          <input type="number" placeholder="$" class="form-input circular mx-auto d-block" min="0" step="1"
                 @keypress="soloEnteros($event)" v-model="filasFijas[2].circuloSolo" />
        </template>
      </div>
    </div>

    <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="d-flex justify-content-between align-items-center mb-2">
      <div class="celda"></div>
      <input type="number" class="form-input cuadrado celda" min="0" step="1" @keypress="soloEnteros($event)" />
      <div v-for="i in 2" :key="'extra-circulo-' + index + '-' + i" class="celda">
        <input type="number" placeholder="$" class="form-input circular" min="0" step="1"
               @keypress="soloEnteros($event)" v-model="fila['circulo' + i]" />
      </div>
      <div class="celda"></div>
    </div>

    <div class="d-flex justify-content-start mt-2">
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
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  outline: none;
  text-align: center;
  font-size: 14px;
}

.cuadrado {
  border-radius: 4px;
}

.circular {
  border-radius: 50%;
}

.celda {
  width: 50px;
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
