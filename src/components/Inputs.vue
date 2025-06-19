<template>
  <div class="container py-3" style="max-width: 350px;"> <!-- Aumenté a 350px -->
    <div class="main-container">
      <!-- Contenedor del scroll (solo filas) - ahora más ancho -->
      <div class="scroll-container">
        <!-- Filas fijas -->
        <div v-for="fila in 5" :key="'fija-' + fila" class="input-row">
          <input
            type="number"
            class="cuadrado input.label"
            :class="claseImagenSiHayEspacio(fila - 1, 'fija')"
            v-model="filasFijas[fila - 1].cuadrado"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            placeholder="$"
            class="circular"
            :class="claseImagenSiHayEspacio(fila - 1, 'fija', 'circulo1')"
            v-model="filasFijas[fila - 1].circulo1"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            placeholder="$"
            class="circular"
            :class="claseImagenSiHayEspacio(fila - 1, 'fija', 'circulo2')"
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
            class="cuadrado"
            :class="claseImagenSiHayEspacio(index, 'extra')"
            v-model="fila.cuadrado"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            placeholder="$"
            class="circular"
            :class="claseImagenSiHayEspacio(index, 'extra', 'circulo1')"
            v-model="fila.circulo1"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <input
            type="number"
            placeholder="$"
            class="circular"
            :class="claseImagenSiHayEspacio(index, 'extra', 'circulo2')"
            v-model="fila.circulo2"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
        </div>
      </div>

      <!-- Círculo solo - FIJO FUERA DEL SCROLL (posición ajustada) -->
      <div class="circulo-solo-fixed">
        <input
          type="number"
          placeholder="$"
          class="circular-solo"
          v-model="filasFijas[2].circuloSolo"
          min="0"
          step="1"
          @keypress="soloEnteros($event)"
        />
      </div>

      <!-- Botón agregar -->
      <button class="btn-agregar-fila" @click="agregarFila">
        <img :src="masIcon" alt="Agregar fila" class="icono-mas">
      </button>
    </div>
  </div>
</template>

<script setup>
import masIcon from '@/assets/icons/mas.svg'
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
  claseImagenSiHayEspacio
} = useInputs(props)
</script>

<style scoped>
.main-container {
  position: relative;
  background-color: #fdfef2;
  height: 350px;
  padding-right: 64px; /* Espacio para el círculo solo */
}

.scroll-container {
  height: 290px;
  overflow-y: auto;
  width: calc(100% - 8px); /* Ajuste para mayor ancho */
  padding-right: 8px;
}

.input-row {
  display: flex;
  margin-bottom: 8px;
  gap: 10px; /* Aumenté el gap para mejor espacio */
  padding-left: 8px;
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
  position: absolute;
  right: 0;
  top: 112px; /* (48px + 8px) * 2 = 112px para tercera fila */
  width: 64px;
  height: 48px;
  z-index: 2;
}

/* Mantengo los demás estilos igual */
.btn-agregar-fila {
  position: absolute;
  bottom: 0;
  left: 8px;
  width: 64px;
  height: 48px;
  background: #E0E0F8;
  border-radius: 60px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 10;
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