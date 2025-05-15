<script setup>
import Header from '../components/Header.vue';
import Inputs from '../components/Inputs.vue';
import InputsCandado from '../components/InputCandado.vue';
import InputsCentena from '../components/InputCentena.vue';
import InputsParlet from '../components/InputParlet.vue';
import Horario from '../components/Horario.vue';
import Pagar from '../components/Pagar.vue';
import { useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { setModoEdicion } from '../scripts/añadir.js';

const db = getFirestore();
const route = useRoute();

const idEditar = computed(() => route.query.editar || null);
const datosEdicion = ref(null);
const horarioEdicion = ref('Dia'); // Valor por defecto

const tipoJugada = computed(() => {
    return route.query.tipo || 'normal';
});

// Cargar datos para edición
onMounted(async () => {
  if (idEditar.value) {
    setModoEdicion(true, idEditar.value);
    const docRef = doc(db, 'apuestas', idEditar.value);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      datosEdicion.value = {
        id: docSnap.id,
        ...docSnap.data(),
                // Asegurar estructura básica si falta
        datos: docSnap.data().datos || [],
        circuloSolo: docSnap.data().circuloSolo || ''
      };
      horarioEdicion.value = docSnap.data().horario || 'Dia';
    }
  } else {
    setModoEdicion(false, null);
    horarioEdicion.value = 'Dia'; // Resetear a valor por defecto
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
    <div class="col-12 m-0 p-0">
        <Horario :horarioEdicion="horarioEdicion" :modoEdicion="!!idEditar"/>
    </div>
    <component 
      :is="componenteActual" 
      :datosEdicion="datosEdicion" 
      :modoEdicion="!!idEditar"
      :idEdicion="idEditar"
    />
    <Pagar/>
</template>

<style scoped>
header{
  height: 7%;
  width: 100%;
}
main {
  min-height: 93%;
  width: 100%;
}
</style>
