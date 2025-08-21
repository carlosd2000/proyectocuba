<template>
  <div class="container-main p-2">
    <div class="d-flex flex-row justify-content-center gap-1" style="height: 340px;">
      <!-- Contenedor del scroll (solo filas) - ahora más ancho -->
      <div class="scroll-container">
        <!-- Filas fijas -->
        <div v-for="fila in 5" :key="'fija-' + fila" class="input-row-container">
          <div class="input-row">
            <input
              type="number"
              class="cuadrado label"
              :placeholder="claseImagenSiHayEspacioGlobal(fila - 1) ? null : '-'"
              :class="[claseImagenSiHayEspacioGlobal(fila - 1), mensajesError[fila - 1] ? 'input-restringido' : '']"
              v-model="filasFijas[fila - 1].cuadrado"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarFilaCompleta(fila - 1, 'fija')"
            />
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo1') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(fila - 1, 'circulo1'), camposInvalidos.circulo1.has(fila - 1) ? 'input-invalido' : '']"
              v-model="filasFijas[fila - 1].circulo1"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(filasFijas[fila - 1].circulo1, 'circulo1', fila - 1); validarFilaCompleta(fila - 1, 'fija')"
            />
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo2') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(fila - 1, 'circulo2'), camposInvalidos.circulo2.has(fila - 1) ? 'input-invalido' : '']"
              v-model="filasFijas[fila - 1].circulo2"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(filasFijas[fila - 1].circulo2, 'circulo2', fila - 1); validarFilaCompleta(fila - 1, 'fija')"
            />
          </div>
          <!-- Mensaje de error para filas fijas -->
          <div v-if="mensajesError[fila - 1]" class="mensaje-error mensaje-restringido">
            {{ mensajesError[fila - 1] }}
          </div>
        </div>

        <!-- Filas extra -->
        <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="input-row-container">
          <div class="input-row">
            <input
              type="number"
              class="cuadrado label"
              :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index) ? null : '-'"
              :class="[claseImagenSiHayEspacioGlobal(filasFijas.length + index), mensajesErrorExtra[index] ? 'input-restringido' : '']"
              v-model="fila.cuadrado"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarFilaCompleta(index, 'extra')"
            />
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo1') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo1'), camposInvalidos.circulo1.has(filasFijas.length + index) ? 'input-invalido' : '']"
              v-model="fila.circulo1"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(fila.circulo1, 'circulo1', filasFijas.length + index); validarFilaCompleta(index, 'extra')"
            />
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo2') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo2'), camposInvalidos.circulo2.has(filasFijas.length + index) ? 'input-invalido' : '']"
              v-model="fila.circulo2"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(fila.circulo2, 'circulo2', filasFijas.length + index); validarFilaCompleta(index, 'extra')"
            />
          </div>
          <!-- Mensaje de error para filas extra -->
          <div v-if="mensajesErrorExtra[index]" class="mensaje-error mensaje-restringido">
            {{ mensajesErrorExtra[index] }}
          </div>
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
          :class="camposInvalidos.circuloSolo ? 'input-invalido' : ''"
          min="0"
          step="1"
          @keypress="soloEnteros($event)"
          @input="validarCampo(filasFijas[2].circuloSolo, 'circuloSolo'); validarParlet()"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect, watch, onMounted, onUnmounted, ref } from 'vue'
import masIcon from '../assets/icons/mas.svg'
import { useInputs } from '../scripts/Inputs.js'
import {
  camposInvalidos,
  validarCampo,
  hayErroresCriticos,
  resetCamposInvalidos,
  revalidarTodosLosNumeros,
  validarNumeroRestringido,
  setErrorCallback,
  horarioActual,
  resetEstadoCompleto
} from '../scripts/fieldValidator.js'

const emit = defineEmits(['update:hayCamposInvalidos' , 'update:hayNumerosNoJuega'])
const props = defineProps({ datosEdicion: Object, modoEdicion: Boolean, idEdicion: String })

const {
  filasFijas,
  filasExtra,
  agregarFila,
  soloEnteros,
  claseImagenSiHayEspacioGlobal
} = useInputs(props)

// Estados para mensajes de error
const mensajesError = ref(Array(5).fill(''))
const mensajesErrorExtra = ref([])
const hayNumerosNoJuega = ref(false)

const manejarErrorNumero = (index, tipoFila, mensaje) => {
  if (tipoFila === 'fija') {
    const newMensajes = [...mensajesError.value];
    newMensajes[index] = mensaje;
    mensajesError.value = newMensajes;
  } else if (tipoFila === 'extra') {
    const newMensajes = [...mensajesErrorExtra.value];
    if (newMensajes.length <= index) {
      newMensajes.length = index + 1;
    }
    newMensajes[index] = mensaje;
    mensajesErrorExtra.value = newMensajes;
  }
}

// Configurar el callback
setErrorCallback(manejarErrorNumero)

// NUEVA FUNCIÓN: Validar solo cuando hay datos en cuadrado Y al menos un círculo
const validarFilaCompleta = (index, tipoFila) => {
  let fila;
  let tieneNumeroNoJuega = false;

  if (tipoFila === 'fija') {
    fila = filasFijas.value[index];
    // Limpiar mensaje solo si no hay datos en círculos
    const newMensajes = [...mensajesError.value];
    const tieneCirculos = !!fila.circulo1 || !!fila.circulo2;
    if (!tieneCirculos || !fila.cuadrado) {
      newMensajes[index] = '';
    }
    mensajesError.value = newMensajes;
  } else {
    fila = filasExtra.value[index];
    const newMensajes = [...mensajesErrorExtra.value];
    if (newMensajes.length <= index) {
      newMensajes.length = index + 1;
    }
    const tieneCirculos = !!fila.circulo1 || !!fila.circulo2;
    if (!tieneCirculos || !fila.cuadrado) {
      newMensajes[index] = '';
    }
    mensajesErrorExtra.value = newMensajes;
  }

  // Solo validar si hay número en cuadrado Y al menos un círculo tiene valor
  const tieneCuadrado = !!fila.cuadrado;
  const tieneCirculo1 = !!fila.circulo1;
  const tieneCirculo2 = !!fila.circulo2;
  
  if (tieneCuadrado && (tieneCirculo1 || tieneCirculo2)) {
    if (tieneCirculo1) {
      const resultadoFijo = validarNumeroRestringido(fila.cuadrado, 'circulo1', index, tipoFila)
      // SOLO BLOQUEAR SI ES NoJuega (no válido)
      if (!resultadoFijo.esValido) {
        tieneNumeroNoJuega = true;
        if (tipoFila === 'fija') {
          const newMensajes = [...mensajesError.value];
          newMensajes[index] = resultadoFijo.mensaje;
          mensajesError.value = newMensajes;
        } else {
          const newMensajes = [...mensajesErrorExtra.value];
          if (newMensajes.length <= index) {
            newMensajes.length = index + 1;
          }
          newMensajes[index] = resultadoFijo.mensaje;
          mensajesErrorExtra.value = newMensajes;
        }
      }
    }
    
    if (tieneCirculo2) {
      const resultadoCorrido = validarNumeroRestringido(fila.cuadrado, 'circulo2', index, tipoFila)
      // SOLO BLOQUEAR SI ES NoJuega (no válido)
      if (!resultadoCorrido.esValido) {
        tieneNumeroNoJuega = true;
        if (tipoFila === 'fija') {
          const newMensajes = [...mensajesError.value];
          newMensajes[index] = resultadoCorrido.mensaje;
          mensajesError.value = newMensajes;
        } else {
          const newMensajes = [...mensajesErrorExtra.value];
          if (newMensajes.length <= index) {
            newMensajes.length = index + 1;
          }
          newMensajes[index] = resultadoCorrido.mensaje;
          mensajesErrorExtra.value = newMensajes;
        }
      }
    }
  }
  actualizarEstadoNumerosNoJuega();
}

// NUEVA FUNCIÓN: Validar Parlet (solo cuando hay datos en cuadrado de fila 2 Y círculo solo)
const validarParlet = () => {
  const fila2 = filasFijas.value[2];
  const tieneCuadrado = !!fila2.cuadrado;
  const tieneCirculoSolo = !!fila2.circuloSolo;
  
  if (tieneCuadrado && tieneCirculoSolo) {
    // Solo validar para Parlet (circuloSolo)
    validarNumeroRestringido(fila2.cuadrado, 'circuloSolo', 2, 'fija');
  }
  actualizarEstadoNumerosNoJuega();
}

const revalidarTodosLosCampos = () => {
  // Revalidar filas fijas
  filasFijas.value.forEach((fila, index) => {
    if (fila.circulo1) validarCampo(fila.circulo1, 'circulo1', index);
    if (fila.circulo2) validarCampo(fila.circulo2, 'circulo2', index);
    validarFilaCompleta(index, 'fija');
  });
  
  // Revalidar filas extra
  filasExtra.value.forEach((fila, index) => {
    const globalIndex = filasFijas.value.length + index;
    if (fila.circulo1) validarCampo(fila.circulo1, 'circulo1', globalIndex);
    if (fila.circulo2) validarCampo(fila.circulo2, 'circulo2', globalIndex);
    validarFilaCompleta(index, 'extra');
  });
  
  // Revalidar círculo solo
  if (filasFijas.value[2].circuloSolo) {
    validarCampo(filasFijas.value[2].circuloSolo, 'circuloSolo');
    validarParlet();
  }

  revalidarTodosLosNumeros(filasFijas.value, filasExtra.value);
  actualizarEstadoNumerosNoJuega();
};

const actualizarEstadoNumerosNoJuega = () => {
  // Verificar si hay algún mensaje de error que indique número no jugable
  // SOLO los números "NoJuega" deben bloquear el botón
  const hayErroresNoJuega = 
    mensajesError.value.some(msg => 
      msg && (msg.includes('No se juega') || msg.includes('bloqueado') || msg.includes('NoJuega'))
    ) || 
    mensajesErrorExtra.value.some(msg => 
      msg && (msg.includes('No se juega') || msg.includes('bloqueado') || msg.includes('NoJuega'))
    );
  
  // Solo actualizar y emitir si el valor cambió
  if (hayNumerosNoJuega.value !== hayErroresNoJuega) {
    hayNumerosNoJuega.value = hayErroresNoJuega;
    emit('update:hayNumerosNoJuega', hayNumerosNoJuega.value);
    
    // También actualizar el estado de campos inválidos
    const hayErrores = hayErroresCriticos() || hayNumerosNoJuega.value;
    emit('update:hayCamposInvalidos', hayErrores);
  }
}

watch(horarioActual, (newHorario) => {
  revalidarTodosLosCampos();
});

watch(() => filasFijas.value, (newVal) => {
  revalidarTodosLosNumeros(newVal, filasExtra.value);
}, { deep: true });

watch(() => filasExtra.value, (newVal) => {
  // Solo ajustar la longitud del array de mensajes, no limpiarlos
  if (mensajesErrorExtra.value.length < newVal.length) {
    mensajesErrorExtra.value = [...mensajesErrorExtra.value, ...Array(newVal.length - mensajesErrorExtra.value.length).fill('')]
  }
  revalidarTodosLosNumeros(filasFijas.value, newVal);
}, { deep: true });

watchEffect(() => {
  const hayErrores = hayErroresCriticos() || hayNumerosNoJuega.value;
  emit('update:hayCamposInvalidos', hayErrores);
})

onMounted(() => {
  actualizarEstadoNumerosNoJuega();
})

onUnmounted(() => {
  window.removeEventListener('horarioCambiado', revalidarTodosLosCampos);
  resetEstadoCompleto();
});
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


.mensaje-error {
  font-size: 11px;
  color: #ff4d4f;
  padding: 6px 10px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  text-align: center;
  animation: fadeIn 0.3s ease-in;
  margin-top: 4px;
  font-weight: 500;
}

.mensaje-restringido {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  font-weight: bold;
}

.input-restringido {
  border: 2px solid #ff4d4f !important;
  background-color: #fff2f0 !important;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

.input-invalido {
  border: 2px solid #ff4d4f !important;
  background-color: #fff2f0 !important;
}

/* Posicionamiento específico para el mensaje del círculo solo */
.circulo-solo-fixed {
  margin-top: 113px;
  width: 70px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Asegurar que los mensajes no desborden */
.input-row-container {
  display: flex;
  flex-direction: column;
}

.mensaje-error {
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(-5px); 
    max-height: 0;
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
    max-height: 50px;
  }
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