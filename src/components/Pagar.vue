<template>
    <div class="container" style="max-width: 320px; margin-top: 12px;">
      
      <!-- Fila de Totales -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="celda"></div>
        <div class="celda text-center fw-bold">Totales</div>
        <div class="celda text-center">$10</div>
        <div class="celda text-center">$15</div>
        <div class="celda text-center">$00</div>
      </div>
  
      <!-- Botón de pago unificado -->
      <div class="text-start">
        <button class="btn btn-warning w-100 fw-bold d-flex justify-content-center align-items-center gap-2">
          <span>Enviar</span>
          <span>$25.00</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  // Sin lógica aún
  </script>
  
  <style scoped>
  .celda {
    width: 36px;
  }
  
  button {
    border: 2px solid black;
  }
  </style>
  