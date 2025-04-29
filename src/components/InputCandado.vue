<template>
  <div class="container py-3" style="max-width: 320px;">
    <!-- Campo de nombre -->
    <div class="col-8 ml-4 p-0 mb-0 border-bottom border-dark">
      <input type="text" class="form-control border-0" placeholder="Nombre (opcional)" />
    </div>

    <!-- Contenedor scroll con columna fija -->
    <div class="d-flex">
      <!-- Scroll vertical para filas -->
      <div class="scroll-vertical">
        <!-- Filas fijas -->
        <div
          v-for="fila in 5"
          :key="'fija-' + fila"
          class="mt-2 mb-3 d-flex justify-content-between align-items-center"
        >
          <div class="celda"></div>
          <input
            type="number"
            class="form-input cuadrado celda"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <div class="celda"></div>
          <div class="celda"></div>
        </div>

        <!-- Filas extra -->
        <div
          v-for="(fila, index) in filasExtra"
          :key="'extra-' + index"
          class="mt-2 mb-3 d-flex justify-content-between align-items-center"
        >
          <div class="celda"></div>
          <input
            type="number"
            class="form-input cuadrado celda"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <div class="celda"></div>
          <div class="celda"></div>
        </div>
      </div>

      <!-- Columna fija solo para fila 3 -->
      <div class="columna-quinta">
        <div class="espacio-filas"></div>
        <div class="input-fila-3">
          <input
            type="number"
            placeholder="$"
            class="form-input circular mx-auto d-block"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
            v-model="filasFijas[2].circuloSolo"
          />
        </div>
      </div>
    </div>

    <!-- Botón para agregar filas -->
    <div class="d-flex justify-content-start">
      <button
        class="btn btn-dark rounded-circle p-0 d-flex justify-content-center align-items-center"
        style="width: 36px; height: 36px;"
        @click="agregarFila"
      >
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

.btn-enter {
  border: #000000 solid 2px;
  box-shadow: #000000 2px 2px 2px;
  border-radius: 6px;
  background-color: #ffc107;
  color: #000000;
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

/* Scroll vertical */
.scroll-vertical {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 10px;
  flex: 1;
}

/* Columna 5 fija */
.columna-quinta {
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.espacio-filas {
  height: calc(40px * 2 + 24px); /* 2 filas + márgenes aprox */
}

.input-fila-3 {
  height: 40px;
}

/* Quitar flechas de los input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
