<template>
  <div class="container py-3" style="max-width: 320px;">
    <!-- Campo de nombre -->
    <div class="col-8 ml-4 p-0 mb-2 border-bottom border-dark">
      <input
        type="text"
        class="form-control border-0 border-bottom border-dark"
        placeholder="Nombre (opcional)"
        v-model="nombreUsuario"
      />
    </div>

    <!-- Contenedor con scroll y columna fija -->
    <div class="container m-0 p-0 d-flex">
      <!-- Botón para agregar filas -->
      <div class="col-2 m-0 p-0 d-flex justify-content-end align-items-end">
        <button
          class="btn bg-transparent mx-1 my-2 p-0 d-flex justify-content-center align-items-center"
          style="width: 30px; height: 30px;"
          @click="agregarFila"
        >
          <i class="bi bi-plus-circle text-black" style="font-size: 24px;"></i>
        </button>
      </div>

      <div class="col-8 m-0 p-0 d-flex flex-column align-items-center justify-content-center candado-altura">
        <!-- Scroll vertical -->
        <div class="col-12 p-0 scroll-vertical border-0">
          <!-- Filas fijas -->
          <div
            v-for="fila in 2"
            :key="'fija-' + fila"
            class="d-flex justify-content-center align-items-center my-1"
          >
            <input
              type="number"
              class="form-input cuadrado celda"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              v-model="filasFijas[fila - 1].cuadrado"
            />
            <div class="celda"></div>
            <div class="celda"></div>
          </div>

          <!-- Filas extra -->
          <div
            v-for="(fila, index) in filasExtra"
            :key="'extra-' + index"
            class="d-flex justify-content-center align-items-center my-1"
          >
            <input
              type="number"
              class="form-input cuadrado celda"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              v-model="fila.cuadrado"
            />
            <div class="celda"></div>
            <div class="celda"></div>
          </div>
        </div>
      </div>

      <!-- Columna fija para fila 3 -->
      <div class="col-2 m-0 p-0 d-flex justify-content-center align-items-center">
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
  </div>
</template>

<script setup>
import { useInputParlet } from '../scripts/InputParlet.js'

const props = defineProps({
  datosEdicion: Object,
  modoEdicion: Boolean,
  idEdicion: String
})

const {
  filasFijas,
  filasExtra,
  agregarFila,
  limpiarCampos,
  nombreUsuario,
  soloEnteros
} = useInputParlet(props)
</script>

<style scoped>
.form-input {
  width: 45px;
  height: 45px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  outline: none;
  text-align: center;
  font-size: 14px;
  margin: 4px;
}

.cuadrado {
  border-radius: 6px;
}

.circular {
  border-radius: 50%;
}

.celda {
  width: 45px;
  height: 45px;
  padding: 0px;
  margin: 1 6px;
}

.scroll-vertical {
  max-height: 290px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex: 1;
}

.candado-altura {
  height: 290px;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
