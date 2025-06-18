<template>
  <div class="main-container">
    <!-- Sección de Totales -->
    <div class="totales-container">
      <div class="totales-header">Totales</div>
      <div class="totales-values">
        <div>${{ formatNumber(totales.col3) }}</div>
        <div>${{ formatNumber(totales.col4) }}</div>
        <div>${{ formatNumber(totales.col5) }}</div>
      </div>
    </div>
    
    <!-- Botón de Pagar -->
    <button class="pagar-button" @click="lanzarToast">
      <span class="button-label">Enviar</span>
      <span class="button-chevron"></span>
      <span class="button-amount">${{ formatNumber(totalGeneral) }}</span>
    </button>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Toast de Guardado -->
    <div v-if="mostrarToastSave" class="toast-container">
      <div class="toast show">
        <div class="toast-content">
          <i class="bi bi-check-circle-fill"></i>
          {{ isOnline ? 'Jugada enviada' : 'Jugada guardada (offline)' }}
        </div>
      </div>
    </div>

    <!-- Toast de Actualización -->
    <div v-if="mostrarToastUpdate" class="toast-container">
      <div class="toast show">
        <div class="toast-content">
          <i class="bi bi-check-circle-fill"></i>
          {{ isOnline ? 'Jugada actualizada' : 'Cambios guardados (offline)' }}
        </div>
      </div>
    </div>

    <!-- Toast de Error -->
    <div v-if="mostrarToastError" class="toast-container error">
      <div class="toast show">
        <div class="toast-content">
          <i class="bi bi-exclamation-triangle-fill"></i>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePagar } from '../scripts/Pagar.js'

const {
  mostrarToastSave,
  mostrarToastUpdate,
  mostrarToastError,
  errorMessage,
  isOnline,
  formatNumber,
  totales,
  totalGeneral,
  lanzarToast
} = usePagar()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@800&display=swap');

.main-container {
  max-width: 343px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  font-family: 'Manrope', sans-serif;
}

/* Estilo para la sección de totales */
.totales-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}

.totales-header {
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #000000;
}

.totales-values {
  display: flex;
  gap: 16px;
}

.totales-values div {
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #000000;
  min-width: 50px;
  text-align: center;
}

/* Estilo del botón de pagar */
.pagar-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px 8px 16px;
  gap: 10px;
  width: 100%;
  height: 48px;
  background: #6665DD;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  box-shadow: none;
  outline: none;
}

.button-label {
  width: 127px;
  height: 16px;
  font-family: 'Manrope', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  color: #F3F3F3;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.button-amount {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #F3F3F3;
  text-align: right;
  flex-grow: 1;
}

.button-chevron {
  width: 20px;
  height: 20px;
  position: relative;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.button-chevron::after {
  content: '';
  position: absolute;
  left: 38.54%;
  right: 38.54%;
  top: 30.21%;
  bottom: 30.21%;
  background: #F3F3F3;
  clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
}

/* Estilos para mensajes de error */
.error-message {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
  color: #DC3545;
  text-align: center;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(220, 53, 69, 0.1);
}

/* Estilos para toasts */
.toast-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1055;
  background-color: #EBEBEB;
  border: 1px solid rgba(0, 0, 0, 0.78);
  box-shadow: 1px -2px 1px rgba(0, 0, 0, 0.39);
  border-radius: 8px 8px 0 0;
}

.toast-container.error {
  background-color: #DC3545 !important;
  color: #FFFFFF;
}

.toast {
  width: 100%;
}

.toast-content {
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 14px;
  line-height: 16px;
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