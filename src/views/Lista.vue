<script setup>
import Header from '../components/Header.vue';
import { ref } from 'vue'
import SelectorHorario from '../components/SelectorHorario.vue';
import Calendario from '../components/Calendario.vue';
import Results from '../components/results.vue';
import ListaComponent from '../components/ListaComponent.vue'
import Pestañas from '../components/Pestañas.vue';
import Footer from '../components/Footer.vue';

const fechaSeleccionada = ref(new Date())
const opcionSeleccionada = ref('Lista') 
</script>

<template>
  <div class="container-login">
    <header>
      <Header />
    </header>
    <div class="container-main">
      <main class="d-flex flex-column align-items-center w-100">
        <div class="d-flex flex-row align-items-center w-100">
          <Calendario @cambiar-fecha="fechaSeleccionada = $event" />
        </div>
        <Results/>
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
          <div class="candado">
            <img src="../assets/Candado open.svg" alt="">
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Lista' }" @click="opcionSeleccionada = 'Lista'">
            <img src="../assets/Lista icon.svg" alt="">
            <p>
              Lista
            </p>
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Bote' }" @click="opcionSeleccionada = 'Bote'">
            <img src="../assets/Lista icon.svg" alt="">
            <p>
              Bote
            </p>
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Resumen' }" @click="opcionSeleccionada = 'Resumen'">
            <img src="../assets/Lista icon.svg" alt="">
            <p>
              Resumen
            </p>
          </div>
        </div>
      </main>
      <aside class="w-100">
        <div v-if="opcionSeleccionada === 'Lista'">
          <ListaComponent :fecha="fechaSeleccionada" />
        </div>
      </aside>
    </div>
    <footer>
      <Footer title="Lista"/>
    </footer>
  </div>
</template>

<style scoped>
.container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px;
  gap: 16px;
  flex: none;
  align-self: stretch;
  flex-grow: 1;
}
main{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 500px;
  gap: 32px;
  flex: none;
  flex-grow: 0;
}
aside{
  max-width: 500px;
}
.candado{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  width: 32px;
  height: 32px;
  background: #E0E0F8;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
}
.button-list{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 16px 2px 8px;
  gap: 8px;
  height: 32px;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
}
.button-list.activo {
  background-color: #6665DD;
  font-weight: bold;
  color: #FDFEF2;
}
.button-list.activo img {
  filter: invert(1);
}
p{
  margin: 0;
  padding: 0;
}
</style>

