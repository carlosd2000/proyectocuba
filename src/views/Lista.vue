<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue';
import CardPrice from '../components/CardPrice.vue';
import SelectorHorario from '../components/SelectorHorario.vue';
import WinerNumber from '../components/WinerNumber.vue';
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
      <Header title="Lista"/>
    </header>
    <div class="container-main">
      <CardPrice/>
      <main class="d-flex flex-column align-items-center w-100">
        <div class="d-flex flex-row  justify-content-between align-items-center w-100">
          <div class="horario-winner d-flex flex-row align-items-center">
            <SelectorHorario />
            <WinerNumber />
          </div>
          <Calendario @cambiar-fecha="fechaSeleccionada = $event" />
        </div>
        <Results/>
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
          <div class="candado">
            <img src="../assets/icons/Candado open.svg" alt="">
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Lista' }" @click="opcionSeleccionada = 'Lista'">
            <img src="../assets/icons/Lista icon.svg" alt="">
            <h5 class="body2">
              Lista
            </h5>
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Bote' }" @click="opcionSeleccionada = 'Bote'">
            <img src="../assets/icons/Lista icon.svg" alt="">
            <h5 class="body2">
              Bote
            </h5>
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Resumen' }" @click="opcionSeleccionada = 'Resumen'">
            <img src="../assets/icons/Lista icon.svg" alt="">
            <h5 class="body2">
              Resumen
            </h5>
          </div>
        </div>
      </main>
      <aside class="w-100 h-100 overflow-auto">
        <div v-if="opcionSeleccionada === 'Lista'" class="h-100">
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
  padding: 16px 16px 24px 16px;
  gap: 16px;
  width: 100%;
  height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
  overflow-y: auto;
}
.horario-winner {
padding: 2px 16px 2px 2px;
gap: 12px;
background: #F3F3F3;
border-radius: 30px;
flex: none;
order: 0;
flex-grow: 0;
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
  color: #FDFEF2;
}
.button-list.activo img {
  filter: invert(1);
}
.button-list.activo h5 {
  color: #FFFFFF;
}
p{
  margin: 0;
  padding: 0;
}
</style>

