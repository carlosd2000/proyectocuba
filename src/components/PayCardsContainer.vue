<script setup>
import PayCard from './PayCard.vue';
import { ref, onMounted, onUnmounted } from 'vue';

const horarios = ['Dia', 'Tarde', 'Noche'];
const configPagos = ref({});
let intervalId = null;

const loadConfig = () => {
    const datosGuardados = localStorage.getItem('configPagos');
    if (datosGuardados) {
        configPagos.value = JSON.parse(datosGuardados);
    }
};

onMounted(() => {
    loadConfig();
    // Verificar cambios cada segundo
    intervalId = setInterval(loadConfig, 1000);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
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