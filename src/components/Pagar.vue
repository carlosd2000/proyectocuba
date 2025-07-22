<script setup>
import { ref, computed  } from 'vue'
import { usePagar } from '../scripts/Pagar.js'
import { useAuthStore } from '@/stores/authStore'
import { hayHorariosDisponibles, horarioSeleccionado } from '../scripts/añadir.js'
import { verificarHorarioActivo } from '../scripts/FunctionHorarioActivo.js'
import { useToastStore } from '../stores/toast'
import ErrorIcon from '../assets/icons/Error.svg'
const {
  errorMessage,
  isOnline,
  formatNumber,
  totales,
  totalGeneral,
  lanzarToast
} = usePagar()

const props = defineProps({
  hayHorariosDisponibles: { type: Boolean, default: true },
  hayCamposInvalidos: { type: Boolean, default: false },
})

const emit = defineEmits(['update:mostrar-enviando']);
const isLoading = ref(false)
const authStore = useAuthStore()

const isButtonDisabled = computed(() => !props.hayHorariosDisponibles || props.hayCamposInvalidos)
const toastStore = useToastStore()
// Modifica la función lanzarToast para emitir el evento
const customLanzarToast = async () => {
  if (isButtonDisabled.value) return

  isLoading.value = true
  emit('update:mostrar-enviando', true)
  try {
    const bancoId = authStore.bancoId
    let horarioKey = null
    switch (horarioSeleccionado.value) {
      case 'Dia': horarioKey = 'dia'; break
      case 'Tarde': horarioKey = 'tarde'; break
      case 'Noche': horarioKey = 'noche'; break
      default: horarioKey = 'dia'
    }

    if (!navigator.onLine) {
      // OFFLINE: revisa el cache local
      const cache = JSON.parse(localStorage.getItem('horariosCache') || '{}')
      const estado = cache[horarioKey]
      if (!estado || estado.sobrepasado) {
        toastStore.showToast(
          'La apuesta está fuera de tiempo para este horario',
          'warning',
          4000,
          ErrorIcon
        )
        isLoading.value = false
        emit('update:mostrar-enviando', false)
        return
      }
    } else {
      // ONLINE: consulta en tiempo real
      const horarioDisponible = await verificarHorarioActivo(bancoId, horarioKey)
      if (!horarioDisponible) {
        toastStore.showToast(
          'La apuesta está fuera de tiempo para este horario',
          'warning',
          4000,
          ErrorIcon
        )
        isLoading.value = false
        emit('update:mostrar-enviando', false)
        return
      }
    }

    // Si pasa la validación, continúa
    const resultado = await lanzarToast()
    if (resultado?.code === "NO_HORARIOS") {
      toastStore.showToast(
        resultado.message,
        'error',
        3000,
        ErrorIcon
      )
    }
    if (resultado?.success && resultado.totalGlobal) {
      // Aquí podrías mostrar un mensaje adicional si lo deseas
      console.log(`Fondo ajustado por apuesta de $${resultado.totalGlobal}`)
    }
  } catch (error) {
    console.error('Error en lanzarToast:', error)
  } finally {
    isLoading.value = false
    emit('update:mostrar-enviando', false)
  }
}
</script>
<template>
  <div class="main-container">
    <!-- Sección de Totales ajustada al mismo ancho que pagar-button -->
    <div class="totales-container bg-transparent">
      
      <div class="totales-values px-3">
        <div class="totales-header">Totales</div>
        <div class="division-line"></div>
        <div class="total-item">${{ formatNumber(totales.col3) }}</div>
        <div class="division-line"></div>
        <div class="total-item">${{ formatNumber(totales.col4) }}</div>
        <div class="division-line"></div>
        <div class="total-item">${{ formatNumber(totales.col5) }}</div>
      </div>
    </div>
    
    <!-- Botón de Pagar (343px de ancho) -->
    <div class="pagar-button-container" :disabled="isButtonDisabled"
        :class="{ 'disabled': isButtonDisabled }">
      <button 
        class="pagar-button" 
        @click="customLanzarToast"
        :disabled="isButtonDisabled"
        :class="{ 'disabled': isButtonDisabled }"
      >
        <h5 class="label">Enviar</h5>
        <h5 class="label">${{ formatNumber(totalGeneral) }}</h5>
        <img v-if="!isLoading" src="../assets/icons/Chevron_right.svg" alt="" style="filter: invert(100%);">
        <img v-else src="../assets/icons/Loading.svg" alt="">
      </button>
    </div>
    <div v-if="!hayHorariosDisponibles" class="error-message">
      No hay horarios disponibles para enviar apuestas
    </div>
  </div>
</template>
<style scoped>
.pagar-button:disabled {
  background-color: #C2C1F1 !important;
  cursor: not-allowed !important;
  opacity: 0.7 !important;
}
.label{
  color: #F3F3F3;
}
/* Contenedor principal */
.main-container {
  border: none;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 16px 16px 24px 16px;
  gap: 16px;
  font-family: 'Manrope', sans-serif;
}

/* SECCIÓN DE TOTALES AJUSTADA */
.totales-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 343px;
  height: 36px;
  box-sizing: border-box;
  background: #FFFFFF;
}

.totales-header {
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #000000;
  white-space: nowrap;
  flex-shrink: 0;
}

.totales-values {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
  gap: 8px;
}

.total-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 58px;
  height: 18px;
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #000000;
  white-space: nowrap;
}

.division-line {
  width: 20px;
  height: 2px;
  border: 1px solid #F0F0FC;
  transform: rotate(90deg);
  flex-shrink: 0;
}
.pagar-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%; /* Ancho fijo para el botón */
}
/* BOTÓN DE PAGAR */
.pagar-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 48px;
  padding: 8px 16px;
  box-sizing: border-box;
  background: #6665DD;
  border-radius: 30px;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
}

.button-label {
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #F3F3F3;
  flex-grow: 1;
  text-align: left;
}

.button-symbol {
  font-weight: 800;
  font-size: 16px;
  color: #F3F3F3;
  margin-left: 8px;
}

.button-amount {
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #F3F3F3;
  text-align: right;
  min-width: 80px;
}

/* MENSAJES DE ERROR */
.error-message {
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #DC3545;
  text-align: center;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(220, 53, 69, 0.1);
  width: 343px;
  box-sizing: border-box;
}

/* TOASTS */
.toast-container {
  position: fixed;
  bottom: 80px;
  left: 0;
  width: 100%;
  padding: 12px;
  z-index: 1055;
}
.toast {
  height: 100%;
  width: 100%;
  border: none;
  background-color: transparent;
  border-radius: 12px;
}
.toast-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 9px 16px;
  gap: 24px;
  width: 100%;
  height: 56px;
  background: #E0E0F8;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  z-index: 4;
}

.toast-content i {
  font-size: 16px;
}

.bi-check-circle-fill {
  color: #28A745;
}

.error .bi-exclamation-triangle-fill {
  color: #FFFFFF;
}
</style>