<template>
    <div class="tabs-container">
      <!-- Navegación de pestañas -->
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-button', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
  
      <!-- Contenido de las pestañas -->
      <div class="tabs-content mt-3">
        <div v-if="activeTab === 'Lista'">
          <lista/>
        </div>
        <div v-else-if="activeTab === 'Bote'">
          <lista/>
        </div>
        <div v-else-if="activeTab === 'Resumen'">
          <lista/>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import lista from './lista.vue'
  import { ref } from 'vue'
  
  const tabs = ['Lista', 'Bote', 'Resumen']
  const activeTab = ref('Lista')
  </script>
  
  <style scoped>
  .tabs-container {
    max-width: 400px;
    margin: auto;
    font-family: Arial, sans-serif;
  }
  
  .tabs-nav {
    display: flex;
    border-bottom: 2px solid #ddd;
  }
  
  .tab-button {
    flex: 1;
    padding: 10px;
    text-align: center;
    background: #f8f8f8;
    border: none;
    border-right: 1px solid #ddd;
    cursor: pointer;
    font-weight: bold;
  }
  
  .tab-button:last-child {
    border-right: none;
  }
  
  .tab-button.active {
    background: white;
    border-bottom: 2px solid black;
  }
  
  .tabs-content {
    padding: 15px;
    border: 1px solid #ddd;
    border-top: none;
    background: white;
  }
  </style>
  