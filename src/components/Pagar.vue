<template>
  <div class="main-container">
    <!-- Sección de Totales ajustada al mismo ancho que pagar-button -->
    <div class="totales-container">
      <div class="totales-header">Totales</div>
      <div class="totales-values">
        <div class="total-item">${{ formatNumber(totales.col3) }}</div>
        <div class="division-line"></div>
        <div class="total-item">${{ formatNumber(totales.col4) }}</div>
        <div class="division-line"></div>
        <div class="total-item">${{ formatNumber(totales.col5) }}</div>
      </div>
    </div>
    
    <!-- Botón de Pagar (343px de ancho) -->
    <button class="pagar-button" @click="lanzarToast">
      <span class="button-label">Enviar</span>
      <span class="button-amount">${{ formatNumber(totalGeneral) }}</span>
      <span class="button-symbol">></span>
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

/* Contenedor principal */
.main-container {
  max-width: 343px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
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
  padding: 0 16px;
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
  margin-left: 12px;
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

/* BOTÓN DE PAGAR */
.pagar-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 343px;
  height: 48px;
  padding: 8px 16px;
  box-sizing: border-box;
  background: #6665DD;
  border-radius: 30px;
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
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1055;
  background-color: #EBEBEB;
  border: 1px solid rgba(0, 0, 0, 0.78);
  box-shadow: 1px -2px 1px rgba(0, 0, 0, 0.39);
  border-radius: 8px 8px 0 0;
  font-family: 'Manrope', sans-serif;
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