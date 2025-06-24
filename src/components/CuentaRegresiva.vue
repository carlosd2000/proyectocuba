<template>
  <div class="timer-display">
    <img src="../assets/icons/Tiempo.svg" alt="">
    <h5 class="small" style="color: #FDFEF2;">
      {{ cuentaRegresiva || 'hh:mm:ss' }}
    </h5>
  </div>
</template>

<script setup>
import { useHeader } from '../scripts/Header.js'

// Destructuramos solo cuentaRegresiva para mejor performance
const { cuentaRegresiva } = useHeader()
</script>

<style scoped>
.timer-display {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 16px;
  gap: 4px;
  width: 91px;
  height: 20px;
  background: #050517;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
  color: white;
  font-family: monospace;
  font-size: 12px;
  line-height: 1;
}
</style>