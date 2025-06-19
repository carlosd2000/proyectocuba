<template>
  <div class="nombre-container">
    <span class="alias-prefix">Alias</span>
    <input
      type="text"
      class="nombre-input label"
      v-model="nombreUsuario"
    />
    <div class="icon-container">
      <img src="@/assets/icons/lapiz.svg" alt="Editar" class="lapiz-icon" />
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
  padding: 8px 8px 8px 16px;
  gap: 8px;

  /* Posición y tamaño */
  width: 215px;
  height: 48px;

  /* Estilos visuales */
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  background-color: #fdfef2;
  position: relative;
}

.alias-prefix {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
}

.nombre-input {
  /* Input estilo minimalista */
  flex: 1;
  border: none;
  background: transparent;
  padding-left: 5px;
  min-width: 50px; 
}

/* Estilos para el contenedor del ícono */
.icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lapiz-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>