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

    <div class="tabs-content m-0 px-3 py-2 ">
      <div v-if="activeTab === 'Lista'">
        <lista :fecha="fecha" />
      </div>
      <div v-else-if="activeTab === 'Bote'">
      </div>
      <div v-else-if="activeTab === 'Resumen'">
        <!--<lista :fecha="fecha" />-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRef } from 'vue'
import Calendario from './Calendario.vue'
import lista from './ListaComponent.vue'

const props = defineProps({
  fecha: {
    type: Date,
    required: true
  }
})

const tabs = ['Lista', 'Bote', 'Resumen']
const activeTab = ref('Lista')
</script>

<style scoped>
.tabs-container {
  height: 100%;
  max-height: 100%;
  max-width: 400px;
  width: 100%;
  font-family: Arial, sans-serif;
}

.tabs-nav {
  display: flex;
  height: 10%;
  border-bottom: 2px solid #ddd;
}

.tab-button {
  flex: 1;
  padding: 0px;
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
  height: 100%;
  max-height:90%;
  padding: 15px;
  border: 1px solid #ddd;
  border-top: none;
  background: white;
  overflow-y: auto;
}
</style>
