<template>
  <div class="container py-2" style="max-width: 350px;">
    <div class="main-container">
      <!-- Contenedor del scroll (filas) -->
      <div class="scroll-container">
        <!-- Filas fijas -->
        <div v-for="fila in 5" :key="'fija-' + fila" class="input-row">
          <input
            type="number"
            class="cuadrado label"
            placeholder="-"
            v-model="filasFijas[fila - 1].cuadrado"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <div class="espacio-vacio"></div>
          <div class="espacio-vacio"></div>
        </div>

        <!-- Filas extra -->
        <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="input-row">
          <input
            type="number"
            class="cuadrado label"
            placeholder="-"
            v-model="fila.cuadrado"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          <div class="espacio-vacio"></div>
          <div class="espacio-vacio"></div>
        </div>
        <div class="btn-agregar-container">
          <button class="btn-agregar-fila" @click="agregarFila">
            <img :src="masIcon" alt="Agregar fila" class="icono-mas">
          </button>
        </div>
      </div>

      <!-- Círculo solo - FIJO FUERA DEL SCROLL -->
      <div class="circulo-solo-fixed">
        <input
          type="number"
          placeholder="$"
          class="circular-solo label"
          v-model="filasFijas[2].circuloSolo"
          :class="camposInvalidos.circuloSolo ? 'input-invalido' : ''"
          min="0"
          step="1"
          @keypress="soloEnteros($event)"
          @input="validarCampo(filasFijas[2].circuloSolo, 'circuloSolo')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect, onMounted } from 'vue'
import masIcon from '@/assets/icons/mas.svg'
import { useInputCandado } from '../scripts/InputCandado.js'
import {
  camposInvalidos,
  validarCampo,
  hayErroresCriticos,
  resetCamposInvalidos,
} from '../scripts/fieldValidator.js'

const emit = defineEmits(['update:hayCamposInvalidos'])
const props = defineProps({ datosEdicion: Object, modoEdicion: Boolean, idEdicion: String })

const {
  filasFijas,
  filasExtra,
  agregarFila,
  soloEnteros
} = useInputCandado(props)

watchEffect(() => {
  const hayErrores = hayErroresCriticos()
  emit('update:hayCamposInvalidos', hayErrores)
})

onMounted(() => {
  resetCamposInvalidos()
})
</script>

<style scoped>
.main-container {
  position: relative;
  background-color: #fdfef2;
  height: 350px;
  padding-right: 64px;
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
  gap: 10px;
  height: 48px;
  width: 100%;
}

.cuadrado, .circular-solo {
  width: 70px;
  height: 48px;
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
}

.espacio-vacio {
  width: 70px;
  height: 48px;
}

/* Círculo solo - POSICIÓN FIJA (tercera fila) */
.circulo-solo-fixed {
  position: absolute;
  right: 0;
  top: 112px; /* (48px + 8px) * 2 = 112px para tercera fila */
  width: 64px;
  height: 48px;
  z-index: 2;
}

/* Botón agregar */
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

/* Estilos para los inputs */
.cuadrado {
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  background: #FFFFFF;
}

.circular-solo {
  background: #F3F3F3;
  border: 1px solid #F3F3F3;
  border-radius: 30px;
}

/* Quitar flechas de los inputs number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>