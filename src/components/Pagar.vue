<template>
  <div class="container" style="max-width: 280px; margin-top: 0px;">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-top border-dark">
      <div class="celda text-center fw-bold">Totales</div>
      <div class="celda"></div>
      <div class="celda text-center">${{ formatNumber(totales.col3) }}</div>
      <div class="celda text-center">${{ formatNumber(totales.col4) }}</div>
      <div class="celda text-center">${{ formatNumber(totales.col5) }}</div>
    </div>
    <div class="text-start">
      <button
        class="btn btn-warning w-100 fw-bold d-flex justify-content-center align-items-center gap-2 btn-page"
        @click="lanzarToast"
      >
        <span>Enviar</span>
        <span>${{ formatNumber(totalGeneral) }}</span>
      </button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger mt-2">
      {{ errorMessage }}
    </div>
  </div>
  <div v-if="mostrarToastSave" class="toast-container">
    <div
      class="toast show w-100 rounded-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="p-3 d-flex justify-content-center">
        <i class="mx-2 bi bi-check-circle-fill text-success"></i>
        {{ isOnline ? 'Jugada enviada' : 'Jugada guardada (offline)' }}
      </div>
    </div>
  </div>
  <div v-if="mostrarToastUpdate" class="toast-container">
    <div
      class="toast show w-100 rounded-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="p-3 d-flex justify-content-center">
        <i class="mx-2 bi bi-check-circle-fill text-success"></i>
        {{ isOnline ? 'Jugada actualizada' : 'Cambios guardados (offline)' }}
      </div>
    </div>
  </div>
  <div v-if="mostrarToastError" class="toast-container bg-danger">
    <div
      class="toast show w-100 rounded-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="p-3 d-flex justify-content-center text-white">
        <i class="mx-2 bi bi-exclamation-triangle-fill"></i>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  filasFijas,
  filasExtra,
  calcularTotales,
  limpiarCampos,
  validarFilas
} from '../scripts/operaciones.js'
import { guardarDatos, setNombre, modoEdicion } from '../scripts/añadir.js'

const router = useRouter()
const route = useRoute()

const mostrarToastSave = ref(false)
const mostrarToastUpdate = ref(false)
const mostrarToastError = ref(false)
const errorMessage = ref('')
const isOnline = ref(navigator.onLine)

// Función para formatear números y manejar NaN/undefined
const formatNumber = (value) => {
  const num = Number(value || 0);
  return isNaN(num) ? 0 : num;
}

// Calculamos los totales con protección contra NaN
const totales = computed(() => {
  const calculos = calcularTotales(filasFijas, filasExtra);
  return {
    col3: formatNumber(calculos.col3),
    col4: formatNumber(calculos.col4),
    col5: formatNumber(calculos.col5)
  };
});

// Total general protegido
const totalGeneral = computed(() => {
  return formatNumber(totales.value.col3) + 
         formatNumber(totales.value.col4) + 
         formatNumber(totales.value.col5);
});

const enviando = ref(false)

const validarAntesDeEnviar = () => {
  const { esValido, circulosInvalidos, circuloSoloInvalido } = validarFilas(filasFijas, filasExtra);
  
  if (circulosInvalidos) {
    errorMessage.value = 'Cada círculo normal debe tener su cuadrado correspondiente';
    return false;
  }
  
  if (circuloSoloInvalido) {
    errorMessage.value = 'El círculo especial requiere al menos 1 cuadrado con dato';
    return false;
  }
  
  if (!esValido) {
    errorMessage.value = 'Ingrese al menos un par válido (cuadrado + círculo)';
    return false;
  }
  
  errorMessage.value = '';
  return true;
}

const lanzarToast = async () => {
  if (!validarAntesDeEnviar()) {
    mostrarToastError.value = true;
    setTimeout(() => mostrarToastError.value = false, 2000);
    return;
  }
  if (enviando.value) return; // Evitar múltiples ejecuciones
  if (!validarAntesDeEnviar()) return;

  const resultado = await guardarDatos();
  enviando.value = true; // Comienza el proceso
  errorMessage.value = ''; // Limpiar mensajes de error previos

  try{
    const resultado = await guardarDatos()

    if (resultado.success) {
      if (modoEdicion.value) {
        mostrarToastUpdate.value = true
        setTimeout(() => {
          mostrarToastUpdate.value = false
          limpiarCampos()
          setNombre('')
          router.push(`/listas/${route.params.id}`)
        }, 1000)
      }
      else{
        limpiarCampos()
        setNombre('')  
        mostrarToastSave.value = true
        setTimeout(() => {
          mostrarToastSave.value = false  
        }, 2000)
      }
    }
  }
  catch (error) {
    errorMessage.value = 'Error al guardar: ' + error.message
  } 
  finally {
    enviando.value = false // Finaliza el proceso (éxito o error)
  }
}
</script>

<style scoped>
.celda {
  width: 50px;
  font-size: 16px;
}

.btn-page {
  border: #000000 solid 2px;
  box-shadow: #000000 2px 2px 2px;
  border-radius: 6px;
  background-color: #ffc107;
  color: #000000;
}

.toast-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1055;
  border: 1px solid #000000c6;
  box-shadow: 1px -2px 1px #00000064;
  border-radius: 8px;
  background-color: rgb(235, 235, 235);
}

.bg-danger {
  background-color: #dc3545 !important;
}
</style>