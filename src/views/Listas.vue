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
  </div>



</template>

<style scoped>
header{
  height: 7%;
  width: 100%;
}
.layout {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Toma el 100% de la altura de la ventana */
    overflow: hidden;
}
.header-main {
  width: 100%;
  height: 20%;
  min-height: 140px;
}
.footer-main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-grow: 1; /* Aquí ocurre la magia: ocupa el espacio restante */
  overflow-y: auto;
}
</style>
