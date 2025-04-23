<template>
    <div class="container py-3" style="max-width: 320px;">
      
      <!-- Fila 1: Nombre -->
      <div class="mb-2">
        <input type="text" class="form-control" placeholder="Nombre (opcional)" />
      </div>
  
      <!-- Filas fijas -->
      <div v-for="fila in 5" :key="'fija-' + fila" class="d-flex justify-content-between align-items-center mb-2">
        <!-- Columna 1: vacía -->
        <div class="celda"></div>
  
        <!-- Columna 2: cuadrado -->
        <input type="number" class="form-input cuadrado celda" min="0" step="1" @keypress="soloEnteros($event)" />
  
        <!-- Columnas 3 y 4: vacías -->
        <div class="celda"></div>
        <div class="celda"></div>
  
        <!-- Columna 5: círculo solo en fila 3 -->
        <div class="position-relative celda">
          <template v-if="fila === 3">
            <input
            type="number"
            placeholder="$"
            class="form-input circular mx-auto d-block"
            min="0"
            step="1"
            @keypress="soloEnteros($event)"
          />
          </template>
        </div>
      </div>
  
      <!-- Filas dinámicas -->
      <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="d-flex justify-content-between align-items-center mb-2">
        <div class="celda"></div>
        <input type="number" class="form-input cuadrado celda" min="0" step="1" @keypress="soloEnteros($event)" />
        <div class="celda"></div>
        <div class="celda"></div>
        <div class="celda"></div>
      </div>
  
      <!-- Botón + -->
      <div class="d-flex justify-content-start mt-2">
        <button
          class="btn btn-dark rounded-circle p-0 d-flex justify-content-center align-items-center"
          style="width: 36px; height: 36px;"
          @click="agregarFila"
        >
          <i class="bi bi-plus-lg text-white"></i>
        </button>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const filasExtra = ref([])
  
  const agregarFila = () => {
    filasExtra.value.push({})
  }
  
  const soloEnteros = (e) => {
    const charCode = e.which ? e.which : e.keyCode
    if (charCode < 48 || charCode > 57) {
      e.preventDefault()
    }
  }
  </script>
  
  <style scoped>
  .form-input {
    width: 36px;
    height: 36px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    outline: none;
    text-align: center;
    font-size: 14px;
  }
  
  .cuadrado {
    border-radius: 4px;
  }
  
  .circular {
    border-radius: 50%;
  }
  
  .simbolo {
    position: absolute;
    left: 6px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #555;
    pointer-events: none;
  }
  
  .celda {
    width: 36px;
  }
  /* Para navegadores WebKit (Chrome, Safari) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {    
  -webkit-appearance: none;    
  margin: 0;}
  /* Para Firefox */
input[type="number"] {    
  -moz-appearance: textfield;}
  </style>
  