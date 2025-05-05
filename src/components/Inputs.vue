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

    <!-- Contenedor principal: columnas con scroll y columna fija -->
    <div class="container m-0 p-0 d-flex">
      <!-- Botón para agregar filas -->
      <div class="col-2 m-0 p-0 d-flex justify-content-end align-items-end mt-2">
        <button
          class="btn btn-dark rounded-circle m-1 mb-2 p-0 d-flex justify-content-center align-items-center"
          style="width: 30px; height: 30px;"
          @click="agregarFila"
        >
          <i class="bi bi-plus-lg text-white"></i>
        </button>
      </div>

      <div class="col-8 m-0 p-0 d-flex flex-column align-items-center justify-content-center">
        <!-- Scroll vertical para columnas 1-4 -->
        <div class="col-12 p-0 scroll-vertical border-0">
          <!-- Filas fijas -->
          <div
            v-for="fila in 5"
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
            <div
              v-for="col in 2"
              :key="'fija-circulo-' + fila + '-' + col"
              class="celda"
            >
              <input
                type="number"
                placeholder="$"
                class="form-input circular"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="filasFijas[fila - 1]['circulo' + col]"
              />
            </div>
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
            <div
              v-for="i in 2"
              :key="'extra-circulo-' + index + '-' + i"
              class="celda"
            >
              <input
                type="number"
                placeholder="$"
                class="form-input circular"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="fila['circulo' + i]"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Columna 5 fija (input circular solo en fila 3) -->
      <div class="col-2 m-0 p-0 d-flex flex-column align-items-center justify-content-center">
        <div>
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
import { ref, watch, onUnmounted } from 'vue' // ✅ Corregido aquí
import {
  filasFijas,
  filasExtra,
  agregarFila,
  limpiarCampos,
  nombreUsuario
} from '../scripts/operaciones.js'
import { setNombre, setTipoOrigen } from '../scripts/añadir.js'
setTipoOrigen('tiros')

// Sincroniza nombre con añadir.js
watch(nombreUsuario, (nuevo) => {
  setNombre(nuevo)
})

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
  margin: 0 6px;
}

.scroll-vertical {
  max-height: 290px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex: 1;
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
