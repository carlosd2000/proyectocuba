<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PayDetails from './PayDetails.vue';
import Dia from '../assets/icons/Dia.svg'
import Tarde from '../assets/icons/Tarde.svg'
import Noche from '../assets/icons/Noche.svg'
import Expand from '../assets/icons/Expand.svg'
import Cotraer from '../assets/icons/Cotraer.svg'

const props = defineProps({
    horario: {
        type: String,
        default: 'Dia'
    },
    DataPay: {
        type: Object,
        default: 'Home'
    }
})

const router = useRouter();
const route = useRoute();
const isExpanded = ref(false)

const IconoPayCard = computed(() => {
    return {
        Dia: Dia,
        Tarde: Tarde,
        Noche: Noche,
    }[props.horario];
});

const ShowDetails = () => {
    isExpanded.value = !isExpanded.value
}

const editarConfiguracion = () => {
  router.push({
    path: `/configpayments/${route.params.id}`,
    query: {
      horario: props.horario,
      edit: true
    }
  });
};

const formatoHora = computed(() => {
  if (!props.DataPay?.hora) return '--:--'; // Manejo de casos nulos
  
  // Convierte a Date si es string (para ambos formatos)
  const fecha = new Date(props.DataPay.hora.includes(',') ? 
               props.DataPay.hora.replace(' a.m.', ' AM').replace(' p.m.', ' PM') : 
               props.DataPay.hora);
  
  if (isNaN(fecha.getTime())) return props.DataPay.hora; // Si falla, muestra el original

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[fecha.getMonth()]} ${fecha.getDate().toString().padStart(2, '0')} | ${
         fecha.getHours().toString().padStart(2, '0')}:${
         fecha.getMinutes().toString().padStart(2, '0')}`;
});
</script>
<template>
    <div class="paycard-container">
        <div class="d-flex flex-column justify-content-center align-items-center gap-2 w-100" style="padding: 16px 16px 8px 16px;">
            <div class="d-flex flex-row justify-content-between align-items-center gap-2 w-100">
                <img :src="IconoPayCard" alt="" width="20">
                <div class="d-flex flex-row justify-content-start align-items-center gap-2 w-100">
                    <h5 class="body-bold">
                        Pago {{ horario }}
                    </h5>
                    <h5 class="small">
                        {{ formatoHora }}
                    </h5>
                </div>
                <img src="../assets/icons/Editar.svg" alt="Editar" @click="editarConfiguracion" style="cursor: pointer;">
            </div>
            <div class="d-flex flex-row justify-content-between align-items-center w-100">
                <h5 class="small">
                    Limite por jugada
                </h5>
                <h5 class="body-bold">
                    ${{ DataPay.inputPrincipal }}
                </h5>
            </div>
        </div>
        <div class="px-3 py-2 d-flex flex-row justify-content-center align-items-center border-top gap-2 w-100">
            <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
                <h5 class="label">
                    ${{ DataPay.montos.Fijo }}
                </h5>
                <h5 class="small">
                    Fijo
                </h5>
            </div>
            <div class="line"></div>
            <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
                <h5 class="label">
                    ${{ DataPay.montos.Corrido }}
                </h5>
                <h5 class="small">
                    Corrido
                </h5>
            </div>
            <div class="line"></div>
            <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
                <h5 class="label">
                    ${{ DataPay.montos.Parlet }}
                </h5>
                <h5 class="small">
                    Parlet
                </h5>
            </div>
        </div>
        <PayDetails v-if="isExpanded" :DataPay="DataPay"/>
        <div class="p-2 d-flex justify-content-center align-items-center border-top w-100" @click="ShowDetails()">
            <img :src="isExpanded ? Cotraer : Expand" alt="" width="20">
        </div>
    </div>
</template>
<style scoped>
.paycard-container{
    background-color: #F3F3F3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0px;
    flex: none;
    flex-grow: 0;
    box-sizing: border-box;
    border: 1px solid #F3F3F3;
    border-radius: 12px;
}
.line{
    width: 36px;
    height: 2px;
    border: 1px solid #E0E0F8;
    transform: rotate(90deg);
    flex: none;
    flex-grow: 0;
}
.small{
    color: #696974;
}
</style>