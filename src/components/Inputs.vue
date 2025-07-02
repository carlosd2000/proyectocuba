<template>
  <div class="container-main p-2">
    <div class="d-flex flex-row justify-content-center gap-1" style="height: 340px;">
      <!-- Contenedor del scroll (solo filas) - ahora más ancho -->
      <div class="scroll-container">
        <!-- Filas fijas -->
        <div v-for="fila in 5" :key="'fija-' + fila" class="input-row">
          <input
            type="number"
            class="cuadrado label"
            :placeholder="claseImagenSiHayEspacioGlobal(fila - 1) ? null : '-'"
            :class="claseImagenSiHayEspacioGlobal(fila - 1)"
            v-model="filasFijas[fila - 1].cuadrado"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            class="circular label"
            :placeholder="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo1') ? null : '$'"
            :class="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo1')"
            v-model="filasFijas[fila - 1].circulo1"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            class="circular label"
            :placeholder="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo2') ? null : '$'"
            :class="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo2')"
            v-model="filasFijas[fila - 1].circulo2"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
        </div>

        <!-- Filas extra -->
        <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="input-row">
          <input
            type="number"
            class="cuadrado label"
            :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index) ? null : '-'"
            :class="claseImagenSiHayEspacioGlobal(filasFijas.length + index)"
            v-model="fila.cuadrado"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            class="circular label"
            :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo1') ? null : '$'"
            :class="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo1')"
            v-model="fila.circulo1"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            class="circular label"
            :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo2') ? null : '$'"
            :class="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo2')"
            v-model="fila.circulo2"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
        </div>
        <div class="btn-agregar-container">
          <button class="btn-agregar-fila" @click="agregarFila">
            <img :src="masIcon" alt="Agregar fila" class="icono-mas">
          </button>
        </div>
      </div>

      <!-- Círculo solo - FIJO FUERA DEL SCROLL (posición ajustada) -->
      <div class="circulo-solo-fixed">
        <input
          type="number"
          class="circular-solo label"
          placeholder="$"
          v-model="filasFijas[2].circuloSolo"
          min="0"
          step="1"
          @keypress="soloEnteros($event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import masIcon from '../assets/icons/mas.svg'
import { useInputs } from '../scripts/Inputs.js'

const props = defineProps({
  datosEdicion: Object,
  modoEdicion: Boolean,
  idEdicion: String
})

const {
  filasFijas,
  filasExtra,
  agregarFila,
  soloEnteros,
  claseImagenSiHayEspacioGlobal
} = useInputs(props)

</script>

<style scoped>
.input-con-imagen {
  background-image: url('../assets/icons/Arrow downward alt.svg') !important;
  background-size: 24px 24px !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}
.container-main{
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Line 1 */
  border-top: 2px solid #F0F0FC;
  border-bottom: 2px solid #F0F0FC;
  flex: none;
  flex-grow: 0;
}
.scroll-container {
  display: flex;
  flex-direction: column;
  max-height: 330px;
  gap: 8px;
  width: 100%;
  overflow-y: auto;
  width: calc(100% - 8px); /* Ajuste para mayor ancho */
}
.btn-agregar-container {
  display: flex;
  justify-content: flex-start;
}

.input-row {
  display: flex;
  justify-content: space-between;
  gap: 10px; /* Aumenté el gap para mejor espacio */
  height: 48px;
  width: 100%;
}

/* Aumenté el tamaño de los inputs */
.cuadrado, .circular, .circular-solo {
  width: 70px; /* Aumenté de 64px a 70px */
  height: 48px;
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
}

/* Círculo solo - POSICIÓN FIJA ABSOLUTA (ajustada) */
.circulo-solo-fixed {
  margin-top: 113px;
  width: 70px;
  height: 48px;
}

/* Mantengo los demás estilos igual */
.btn-agregar-fila {
  width: 70px;
  height: 48px;
  background: #E0E0F8;
  border-radius: 60px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-agregar-fila:hover {
  background: #D0D0F0;
}

.icono-mas {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.cuadrado {
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  background: #FFFFFF;
}

.circular, .circular-solo {
  background: #F3F3F3;
  border: 1px solid #F3F3F3;
  border-radius: 30px;
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