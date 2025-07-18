<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import CardPrice from '../components/CardPrice.vue'
import SelectorHorario from '../components/SelectorHorario.vue'
import WinerNumber from '../components/WinerNumber.vue'
import Calendario from '../components/Calendario.vue'
import Results from '../components/results.vue'
import ListaComponent from '../components/ListaComponent.vue'
import Footer from '../components/Footer.vue'
import { useCandadoHorario } from '../scripts/useCandadoHorario.js'
import useLista from '../scripts/Lista.js'
import CandadoAbierto from '../assets/icons/Candado open.svg'
import CandadoCerrado from '../assets/icons/Candado_locked.svg'

const router = useRouter()
const route = useRoute()

const fechaSeleccionada = ref(new Date())
const opcionSeleccionada = ref('Lista') 
const horarioSeleccionado = ref('Dia')
const valorBote = computed(() => Number(localStorage.getItem('valorBote')) || 100)

const { candadoAbierto } = useCandadoHorario(fechaSeleccionada, horarioSeleccionado)
const listaLogic = useLista(fechaSeleccionada, router, route)

// Función para verificar si supera el bote (se mantiene igual)
const superaBote = (apuesta) => {
  if (apuesta.circuloSolo && Number(apuesta.circuloSolo) > valorBote.value) return true
  if (apuesta.datos) {
    return apuesta.datos.some(d => {
      const c1 = d.circulo1 ? Number(d.circulo1) : 0
      const c2 = d.circulo2 ? Number(d.circulo2) : 0
      return c1 > valorBote.value || c2 > valorBote.value
    })
  }
  return false
}

// Filtrado completo que funciona con ListaComponent
const apuestasFiltradas = computed(() => {
  return listaLogic.apuestasCombinadas.value.filter(apuesta => {
    const horarioMatch = apuesta.horario?.toLowerCase() === horarioSeleccionado.value.toLowerCase()
    if (!horarioMatch) return false
    
    if (opcionSeleccionada.value === 'Bote') return superaBote(apuesta)
    if (opcionSeleccionada.value === 'Lista') return !superaBote(apuesta)
    return true
  })
})

function handleSelect(valor) {
  switch (valor) {
    case '1': horarioSeleccionado.value = 'Dia'; break
    case '2': horarioSeleccionado.value = 'Tarde'; break
    case '3': horarioSeleccionado.value = 'Noche'; break
    default: horarioSeleccionado.value = 'Dia'
  }
}
</script>

<template>
  <div class="container-login">
    <header>
      <Header title="Lista"/>
    </header>
    <div class="container-main">
      <CardPrice/>
      <main class="d-flex flex-column align-items-center w-100">
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
          <div class="horario-winner d-flex flex-row align-items-center h-100">
            <SelectorHorario @update:selected="handleSelect"/>
            <WinerNumber />
          </div>
          <Calendario @cambiar-fecha="fechaSeleccionada = $event" />
        </div>
        <Results/>
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Lista' }" @click="opcionSeleccionada = 'Lista'">
            <img src="../assets/icons/Lista icon.svg" alt="">
            <h5 class="body2">Lista</h5>
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Bote' }" @click="opcionSeleccionada = 'Bote'">
            <img src="../assets/icons/Lista icon.svg" alt="">
            <h5 class="body2">Bote</h5>
          </div>
          <div class="button-list" :class="{ activo: opcionSeleccionada === 'Resumen' }" @click="opcionSeleccionada = 'Resumen'">
            <img src="../assets/icons/Lista icon.svg" alt="">
            <h5 class="body2">Resumen</h5>
          </div>
          <div class="candado">
            <img :src="candadoAbierto ? CandadoAbierto : CandadoCerrado" alt="Candado">
          </div>
        </div>
      </main>
      
      <aside class="w-100 h-100 overflow-auto">
        <ListaComponent 
          :fecha="fechaSeleccionada" 
          :horario="horarioSeleccionado" 
          :candadoAbierto="candadoAbierto"
          :opcionSeleccionada="opcionSeleccionada"
          :apuestas="apuestasFiltradas"
        />
      </aside>
    </div>
    <footer>
      <Footer title="Lista"/>
    </footer>
  </div>
</template>

<style scoped>
/* Tus estilos se mantienen exactamente igual */
.container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px 24px 16px;
  gap: 16px;
  width: 100%;
  height: calc(100vh - 7% - 88px);
  overflow-y: auto;
}
.horario-winner {
  padding: 2px 16px 2px 2px;
  gap: 8px;
  background: #F3F3F3;
  border-radius: 30px;
  flex: none;
  order: 0;
  flex-grow: 0;
}
main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 500px;
  gap: 32px;
  flex: none;
  flex-grow: 0;
}
aside {
  max-width: 500px;
}
.candado {
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
.button-list {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 12px 2px 8px;
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
p {
  margin: 0;
  padding: 0;
}
</style>