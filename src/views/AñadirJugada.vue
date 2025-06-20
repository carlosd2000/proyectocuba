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
import { setModoEdicion } from '../scripts/añadir.js';
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js';
import Nombre from '../components/Nombre.vue';
import CardPrice from '../components/CardPrice.vue';

async function ejemploUso() {
  const bancoId = await obtenerBancoPadre();
  console.log("Banco padre:", bancoId);
}

const route = useRoute();
const idEditar = computed(() => route.query.editar || null);
const datosEdicion = ref(null);
const horarioEdicion = ref('Dia');
const bancoId = ref(null);

const tipoJugada = computed(() => {
    return route.query.tipo || 'normal';
});

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
        <Header/>
    </header>
    <main class="container">
      <CardPrice/>
      <div class="components-container">
        <div class="horario-wrapper">
          <Horario :horarioEdicion="horarioEdicion" :modoEdicion="!!idEditar"/>
        </div>
        <div class="nombre-wrapper">
          <Nombre/>
        </div>
      </div>
    
      <component 
        :is="componenteActual" 
        :datosEdicion="datosEdicion" 
        :modoEdicion="!!idEditar"
        :idEdicion="idEditar"
        :bancoId="bancoId"
      />
      <Pagar/>
    </main>
</template>

<style scoped>
main {
  min-height: 93%;
  width: 100%;
}

.components-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.horario-wrapper {
  flex: 0 0 auto; /* No crece, no se encoge, tamaño automático */
  margin-right: 7px; /* Espacio entre componentes */
}

.nombre-wrapper {
  flex: 1; /* Ocupa el espacio restante */
  min-width: 0; /* Permite que se ajuste correctamente */
}

/* Estilos específicos para preservar la forma del Horario */
.horario-wrapper >>> .selector-horario {
  width: auto !important;
  display: inline-flex !important;
}

.horario-wrapper >>> button {
  width: auto !important;
  padding: 8px 12px !important; /* Ajusta según necesites */
}
</style>