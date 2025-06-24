<script setup>
import Header from '../components/Header.vue';
import Inputs from '../components/Inputs.vue';
import InputsCandado from '../components/InputCandado.vue';
import InputsCentena from '../components/InputCentena.vue';
import InputsParlet from '../components/InputParlet.vue';
import Horario from '../components/SelectorHorario.vue';
import Pagar from '../components/Pagar.vue';
import { useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { setModoEdicion, setHorario } from '../scripts/añadir.js';
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js';
import Nombre from '../components/Nombre.vue';
import CardPrice from '../components/CardPrice.vue';

async function ejemploUso() {
  const bancoId = await obtenerBancoPadre();
  console.log("Banco padre:", bancoId);
}
const onHorarioSeleccionado = (nuevoHorario) => {
  setHorario(nuevoHorario)
}

const route = useRoute();
const idEditar = computed(() => route.query.editar || null);
const datosEdicion = ref(null);
const horarioEdicion = ref('Dia');
const bancoId = ref(null);

const tipoJugada = computed(() => {
    return route.query.tipo || 'normal';
});

const horarioSeleccionado = ref('1') // valor por defecto

const horarioNombre = computed(() => {
  switch (horarioSeleccionado.value) {
    case '1': return 'Dia'
    case '2': return 'Tarde'
    case '3': return 'Noche'
    default: return 'Dia'
  }
})

onMounted(async () => {
  if (idEditar.value) {
    setModoEdicion(true, idEditar.value);
    
    if (route.query.esPendiente === 'true') {
      const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
      const apuestaPendiente = pendientes.find(p => p.uuid === idEditar.value);
      
      if (apuestaPendiente) {
        datosEdicion.value = {
          id: apuestaPendiente.uuid,
          ...apuestaPendiente,
          datos: apuestaPendiente.datos || [],
          circuloSolo: apuestaPendiente.circuloSolo || '',
          bancoId: apuestaPendiente.bancoId || null
        };
        horarioEdicion.value = apuestaPendiente.horario || 'Dia';
      }
    } else {
      try {
        bancoId.value = await obtenerBancoPadre();
        
        const docRef = doc(db, `bancos/${bancoId.value}/apuestas`, idEditar.value);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          datosEdicion.value = {
            id: docSnap.id,
            ...docSnap.data(),
            datos: docSnap.data().datos || [],
            circuloSolo: docSnap.data().circuloSolo || '',
            uuid: docSnap.data().uuid || docSnap.id,
            bancoId: bancoId.value
          };
          horarioEdicion.value = docSnap.data().horario || 'Dia';
        }
      } catch (error) {
        console.error('Error cargando datos para edición:', error);
      }
    }
  } else {
    setModoEdicion(false, null);
    horarioEdicion.value = 'Dia';
  }
});

const componenteActual = computed(() => {
    switch(tipoJugada.value) {
        case 'parlet': return InputsParlet;
        case 'candado': return InputsCandado;
        case 'centena': return InputsCentena;
        default: return Inputs;
    }
});
</script>

<template>
    <header>
        <Header title="Jugada"/>
    </header>
    <main class="container d-flex flex-column align-items-center w-100">
      <CardPrice/>
      <div class="components-container">
        <Horario :horarioEdicion="horarioEdicion" :modoEdicion="!!idEditar" @update:selected="horarioSeleccionado = $event"/>
        <div class="nombre-wrapper d-flex align-items-center justify-content-center">
          <Nombre/>
        </div>
        <div class="buttons-heith" @click="$router.push(`/lista/${$route.params.id}`)">
          <img src="../assets/icons/Lista.svg" alt="" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);" >
        </div>
      </div>
    
      <component 
        :is="componenteActual" 
        :datosEdicion="datosEdicion" 
        :modoEdicion="!!idEditar"
        :idEdicion="idEditar"
        :bancoId="bancoId"
      />
    </main>
    <footer>
      <Pagar :horario="horarioNombre"/>
    </footer>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: calc(100vh - 64px); /* Asume que el footer mide 64px */
  overflow-y: auto;
  padding-bottom: 80px; /* Previene que el contenido se oculte detrás del footer */
}
footer{
  background-color: #fdfef2;
  border: none;
}
.buttons-heith {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 4px;
  gap: 4px;
  width: 48px;
  height: 48px;
  background: #050517;
  border-radius: 60px;
  flex: none;
  flex-grow: 0;
}
.components-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  gap: 8px;
}
.nombre-wrapper {
  flex: 1; /* Ocupa el espacio restante */
  min-width: 0; /* Permite que se ajuste correctamente */
}
</style>