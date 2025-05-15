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
          class="btn btn-dark rounded-circle mx-1 my-2 p-0 d-flex justify-content-center align-items-center"
          style="width: 30px; height: 30px;"
          @click="agregarFila"
        >
          <i class="bi bi-plus-lg text-white"></i>
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
  filasFijas,
  filasExtra,
  agregarFila,
  limpiarCampos,
  nombreUsuario
} from '../scripts/operaciones.js'
import { setNombre, setTipoOrigen, setModoEdicion } from '../scripts/añadir.js'
import { soloEnteros, cargarDatosEdicion as cargarDatosEdicionCompartida } from '../scripts/inputsFunction.js'

const props = defineProps({
  datosEdicion: Object,
  modoEdicion: Boolean,
  idEdicion: String
})

setTipoOrigen('parlet')

// Cargar datos de edición usando función compartida
const cargarDatosEdicion = () => {
  cargarDatosEdicionCompartida(
    props,
    nombreUsuario,
    filasFijas,
    filasExtra,
    2 // Solo 2 filas fijas para parlet
  )
  // Lógica específica para círculo solo (si aplica)
  if (props.datosEdicion?.circuloSolo) {
    filasFijas.value[2].circuloSolo = props.datosEdicion.circuloSolo.toString()
  }
}

// Reactivo: actualiza si los datos de edición cambian
watch(() => props.datosEdicion, (nuevosDatos) => {
  if (props.modoEdicion && nuevosDatos) {
    console.log('Actualización detectada en datosEdicion:', nuevosDatos)
    cargarDatosEdicion()
  }
}, { deep: true, immediate: true })

// Sincroniza nombre con añadir.js
watch(nombreUsuario, (nuevo) => {
  setNombre(nuevo)
})

onMounted(() => {
  if (props.modoEdicion && props.idEdicion) {
    setModoEdicion(true, props.idEdicion)
  }
})

onUnmounted(() => {
  limpiarCampos()
  setModoEdicion(false, '')
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
