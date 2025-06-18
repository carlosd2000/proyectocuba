<script setup>
import Header from '../components/Header.vue';
import Calendario from '../components/Calendario.vue';
import Results from '../components/results.vue';
import Pestañas from '../components/Pestañas.vue';
import Footer from '../components/Footer.vue';
import { ref } from 'vue'

const fechaSeleccionada = ref(new Date())
</script>

<template>
  <div class="container-login">
    <header>
      <Header />
    </header>
    <main class="container">
      <Results/>
      <Pestañas :fecha="fechaSeleccionada" />
    </main>
    <footer>
      <Footer title="Lista"/>
    </footer>
  </div>
</template>

<style scoped>
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
