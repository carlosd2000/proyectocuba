<script setup>
import PayCard from './PayCard.vue';
import { ref, onMounted } from 'vue';

// Definimos los horarios posibles
const horarios = ['Dia', 'Tarde', 'Noche'];
const configPagos = ref({});

// Cargamos los datos al montar el componente
onMounted(() => {
    const datosGuardados = localStorage.getItem('configPagos');
    if (datosGuardados) {
        configPagos.value = JSON.parse(datosGuardados);
        console.log('Datos cargados desde localStorage:', configPagos.value);
    } else {
        console.log('No hay datos de configuración guardados');
    }
});
</script>
<template>
    <div class="d-flex flex-column gap-2 w-100">
        <template v-for="horario in horarios" :key="horario">
            <PayCard 
                v-if="configPagos[horario]"
                :horario="horario"
                :DataPay="configPagos[horario]"
            />
        </template>
    </div>
</template>
<style scoped>
</style>