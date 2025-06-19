<template>
  <div class="nombre-container">
    <input
      type="text"
      class="nombre-input"
      placeholder="Nombre (opcional)"
      v-model="nombreUsuario"
    />
    <!-- Espacio para icono derecho (opcional) -->
    <div class="icon-container">
      <!-- Aquí iría tu ícono si lo necesitas -->
    </div>
  </div>
</template>

<script setup>
import { useInputs } from '../scripts/Inputs.js'

const { nombreUsuario } = useInputs()
</script>

<style scoped>
.nombre-container {
  /* Layout */
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px 8px 16px;
  gap: 10px;

  /* Posición y tamaño */
  position: absolute;
  width: 300px;
  height: 48px;
  left: 25px;
  top: 20px;

  /* Estilos visuales */
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  background-color: #fdfef2; /* Manteniendo tu color de fondo */
}

.nombre-input {
  /* Input estilo minimalista */
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}

.nombre-input::placeholder {
  color: #999;
}

/* Estilos para el contenedor del ícono (opcional) */
.icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>