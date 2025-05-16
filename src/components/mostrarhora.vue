<template>
    <div class="hora-cuba">
        <div class="reloj">
            {{ horaActual }}
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

import { useHoraCuba } from '../scripts/horacuba.js';
const { horaActual } = useHoraCuba();
</script>


<style scoped>

</style>