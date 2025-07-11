<script setup>
import { useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/Header.vue';
import Nombre from '../components/Nombre.vue';
import CardPrice from '../components/CardPrice.vue';
import Inputs from '../components/Inputs.vue';
import InputsCandado from '../components/InputCandado.vue';
import InputsCentena from '../components/InputCentena.vue';
import InputsParlet from '../components/InputParlet.vue';
import Horario from '../components/SelectorHorario.vue';
import Pagar from '../components/Pagar.vue';
import { setModoEdicion, setHorario, tomarUUID } from '../scripts/añadir.js';
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js';

const onHorarioSeleccionado = (nuevoHorario) => {
  if (nuevoHorario === null) {
    hayHorariosDisponibles.value = false
    return
  }
  
  hayHorariosDisponibles.value = true
  const horarioSeleccionado = (() => {
    switch (nuevoHorario) {
      case '1': return 'Dia'
      case '2': return 'Tarde'
      case '3': return 'Noche'
      default: return null
    }
  })();
  setHorario(horarioSeleccionado);
}

const route = useRoute();
const idEditar = computed(() => route.query.editar || null);
const datosEdicion = ref(null);
const horarioEdicion = ref('Dia');
const bancoId = ref(null);
const mostrarEnviando = ref(false);
const hayHorariosDisponibles = ref(true)
const hayCamposInvalidos = ref(false)

const tipoJugada = computed(() => {
    return route.query.tipo || 'normal';
});

const setMostrarEnviando = (valor) => {
  mostrarEnviando.value = valor;
};

const componenteActual = computed(() => {
    switch(tipoJugada.value) {
        case 'parlet': return InputsParlet;
        case 'candado': return InputsCandado;
        case 'centena': return InputsCentena;
        default: return Inputs;
    }
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
    tomarUUID();
    setModoEdicion(false, null);
    horarioEdicion.value = 'Dia';
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
        <Horario :horarioEdicion="horarioEdicion" :modoEdicion="!!idEditar" @update:selected="onHorarioSeleccionado" @no-horarios-disponibles="hayHorariosDisponibles = false"/>
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
        @update:hayCamposInvalidos="hayCamposInvalidos = $event"
      />
      <div v-if="mostrarEnviando" class="modal-overlay gap-2">
        <img src="../assets/icons/Logo.svg" alt="Logo" />
        <h5 class="body">Enviando Jugada</h5>
      </div>
    </main>
    <footer>
      <Pagar @update:mostrar-enviando="setMostrarEnviando" :hay-horarios-disponibles="hayHorariosDisponibles" :hay-campos-invalidos="hayCamposInvalidos"/>
    </footer>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  width: 100%;
  height: calc(100% - 140px); /* Asume que el footer mide 64px */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(253, 254, 242, 0.4);
  /* Accent/Mindaro 10 */
  border: 0.5px solid #FDFEF2;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  z-index: 3;
}


.modal-content {
  background: #fff;
  padding: 24px 32px;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

.loader {
  width: 32px;
  height: 32px;
  border: 4px solid #ccc;
  border-top: 4px solid #6665DD;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: calc(100vh - 140px); /* Asume que el footer mide 64px */
  overflow-y: auto;
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