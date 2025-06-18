<template>
  <div class="container py-3" style="max-width: 320px; ">
    <!-- Campo de nombre -->
    <div class="col-8 ml-4 p-0 mb-2 border-bottom border-dark">
      <input
        type="text"
        class="form-control border-0 border-bottom border-dark"
        style="background-color: #fdfef2;"
        placeholder="Nombre (opcional)"
        v-model="nombreUsuario"
      />
    </div>

    <!-- Contenedor principal -->
    <div class="main-container">
      <!-- Contenedor del contenido principal con altura fija -->
      <div class="content-wrapper">
        <!-- Scroll container con altura FIJA -->
        <div class="scroll-container">
          <!-- Contenedor de filas (fijas + extra) -->
          <div class="rows-container">
            <!-- Filas fijas (siempre visibles) -->
            <div
              v-for="fila in 5"
              :key="'fija-' + fila"
              class="input-row"
            >
              <!-- Input cuadrado -->
              <input
                type="number"
                class="cuadrado"
                :class="claseImagenSiHayEspacio(fila - 1, 'fija')"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="filasFijas[fila - 1].cuadrado"
              />
              
              <!-- Inputs circulares -->
              <input
                type="number"
                placeholder="$"
                class="circular"
                :class="claseImagenSiHayEspacio(fila - 1, 'fija', 'circulo1')"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="filasFijas[fila - 1].circulo1"
              />
              <input
                type="number"
                placeholder="$"
                class="circular"
                :class="claseImagenSiHayEspacio(fila - 1, 'fija', 'circulo2')"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="filasFijas[fila - 1].circulo2"
              />
            </div>

            <!-- Filas extra -->
            <div
              v-for="(fila, index) in filasExtra"
              :key="'extra-' + index"
              class="input-row"
            >
              <!-- Input cuadrado -->
              <input
                type="number"
                class="cuadrado"
                :class="claseImagenSiHayEspacio(index, 'extra')"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="fila.cuadrado"
              />
              
              <!-- Inputs circulares -->
              <input
                type="number"
                placeholder="$"
                class="circular"
                :class="claseImagenSiHayEspacio(index, 'extra', 'circulo1')"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="fila.circulo1"
              />
              <input
                type="number"
                placeholder="$"
                class="circular"
                :class="claseImagenSiHayEspacio(index, 'extra', 'circulo2')"
                min="0"
                step="1"
                @keypress="soloEnteros($event)"
                v-model="fila.circulo2"
              />
            </div>
          </div>
        </div>

        <!-- Botón agregar (POSICIÓN ABSOLUTAMENTE FIJA) -->
        <button
          class="btn-agregar-fila"
          @click="agregarFila"
        >
          <img :src="masIcon" alt="Agregar fila" class="icono-mas">
        </button>
      </div>

      <!-- Columna del círculo solo -->
      <div class="right-column">
        <div
          v-for="fila in 5"
          :key="'circulo-solo-' + fila"
          class="circulo-solo-container"
        >
          <input
            v-if="fila === 3"
            type="number"
            placeholder="$"
            class="circular-solo"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
            v-model="filasFijas[2].circuloSolo"
          />
        </div>
        
        <!-- Espacio para filas extra -->
        <div
          v-for="(fila, index) in filasExtra"
          :key="'extra-circulo-solo-' + index"
          class="circulo-solo-container"
        ></div>
      </div>
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
  limpiarCampos,
  nombreUsuario,
  soloEnteros,
  claseImagenSiHayEspacio,
} = useInputs(props)
</script>

<style scoped>
/* Layout principal */
.main-container {
  display: flex;
  background-color: #fdfef2;
  position: relative;
  height: 350px; /* Altura fija del contenedor principal */
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.right-column {
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Scroll container con altura fija */
.scroll-container {
  height: 290px; /* Altura fija para el scroll */
  overflow-y: auto;
  padding-right: 8px;
}

/* Contenedor de filas */
.rows-container {
  min-height: 290px; /* Asegura espacio para las 5 filas fijas */
}

/* Estilos de filas */
.input-row {
  display: flex;
  margin-bottom: 8px;
  gap: 8px;
  padding-left: 8px;
  height: 48px; /* Altura fija por fila */
}

.circulo-solo-container {
  width: 64px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

/* Botón agregar (POSICIÓN ABSOLUTA FIJA) */
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

/* Estilos de inputs (mantenidos) */
.cuadrado {
  width: 64px;
  height: 48px;
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  background: #FFFFFF;
  padding: 8px 12px 8px 16px;
  text-align: center;
  font-size: 14px;
  outline: none;
}

.circular {
  width: 64px;
  height: 48px;
  background: #F3F3F3;
  border: 1px solid #F3F3F3;
  border-radius: 30px;
  padding: 8px 12px 8px 16px;
  text-align: center;
  font-size: 14px;
  outline: none;
}

.circular-solo {
  width: 64px;
  height: 48px;
  background: #F3F3F3;
  border: 1px solid #F3F3F3;
  border-radius: 30px;
  padding: 8px 12px 8px 16px;
  text-align: center;
  font-size: 14px;
  outline: none;
}

/* Scrollbar styling */
.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #555;
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