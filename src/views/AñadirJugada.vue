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
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { setModoEdicion } from '../scripts/añadir.js';
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js';

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

/*async function obtenerBancoPadre() {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuario no autenticado");

    const bancosSnapshot = await getDocs(collection(db, 'bancos'));
    
    for (const bancoDoc of bancosSnapshot.docs) {
      const currentBancoId = bancoDoc.id;
      
      // 1. Buscar en listeros directos del banco
      const listeroRef = doc(db, `bancos/${currentBancoId}/listeros/${userId}`);
      const listeroSnap = await getDoc(listeroRef);
      if (listeroSnap.exists()) {
        return currentBancoId;
      }

      // 2. Buscar en listeros de colectores del banco
      const colectoresSnapshot = await getDocs(collection(db, `bancos/${currentBancoId}/colectores`));
      
      for (const colectorDoc of colectoresSnapshot.docs) {
        const listeroRef = doc(db, `bancos/${currentBancoId}/colectores/${colectorDoc.id}/listeros/${userId}`);
        const listeroSnap = await getDoc(listeroRef);
        if (listeroSnap.exists()) {
          return currentBancoId;
        }
      }
    }

    throw new Error("No se encontró el banco padre para este usuario");
  } catch (error) {
    console.error("Error obteniendo banco padre:", error);
    throw error;
  }
}*/

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
    <div class="col-12 m-0 p-0">
        <Horario :horarioEdicion="horarioEdicion" :modoEdicion="!!idEditar"/>
    </div>
    <component 
      :is="componenteActual" 
      :datosEdicion="datosEdicion" 
      :modoEdicion="!!idEditar"
      :idEdicion="idEditar"
      :bancoId="bancoId"
    />
    <Pagar/>
</template>

<style scoped>
main {
  min-height: 93%;
  width: 100%;
}
</style>