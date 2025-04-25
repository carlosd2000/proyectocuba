<template>
    <div class="hora-cuba">
        <div class="reloj">
            {{ horaActual }}
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const horaActual = ref('--:--:--');
  // Zona horaria de Cuba (puede ser 'America/Havana' o 'Cuba')
const zonaHorariaCuba = 'America/Havana';
const actualizarHora = () => {
    const ahora = new Date();
    horaActual.value = ahora.toLocaleTimeString('es-ES', {
        timeZone: zonaHorariaCuba,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};
let intervalo;
onMounted(() => {
    // Actualizar inmediatamente al montar el componente
    actualizarHora();
    // Actualizar cada segundo
    intervalo = setInterval(actualizarHora, 1000);
});
onUnmounted(() => {
    // Limpiar el intervalo cuando el componente se desmonte
    clearInterval(intervalo);
});
</script>

<style scoped>

</style>