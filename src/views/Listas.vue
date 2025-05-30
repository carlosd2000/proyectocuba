<script setup>
import Header from '../components/Header.vue';
import Calendario from '../components/Calendario.vue';
import Results from '../components/results.vue';
import Pestañas from '../components/Pestañas.vue';
import { ref } from 'vue'

const fechaSeleccionada = ref(new Date())
</script>

<template>
  <div class="layout m-0 p-0">
    <header>
      <Header />
    </header>
    <main class="main-content m-0 p-0">
      <div class="header-main m-0 p-0">
        <div>
          <Calendario @cambiar-fecha="fechaSeleccionada = $event" />
        </div>
        <div>
          <Results/>
        </div>
      </div>
      <div class="footer-main m-0 p-0">
        <Pestañas :fecha="fechaSeleccionada" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
header {
  height: 7%;
  width: 100%;
}
.main-content {
  height: 93%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.header-main {
  width: 100%;
  min-height: 140px;
}
.footer-main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-grow: 1; /* Ocupa el espacio restante dentro de main-content */
  overflow-y: auto;
}
</style>
