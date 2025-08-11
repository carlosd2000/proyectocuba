<script setup>
import Hora from '../assets/icons/Hora.svg'
import Ganancia from '../assets/icons/ganancia.svg'
import Notificar from '../assets/icons/Notificar.svg'
import Volumen from '../assets/icons/Volumen.svg'
import Todos from '../assets/icons/Todos.svg'
import User from '../assets/icons/User.svg'
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    violet: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['click'])

function filterImg(valor) {
    switch (valor) {
        case 'Horario':
            return Hora
        case 'Pagos':
            return Ganancia
        case 'Notificar':
            return Notificar
        case 'Volumen':
            return Volumen
        case 'Historico':
            return Todos
        case 'Usuario':
            return User
        default:
            return ''
    }
}
</script>
<template>
    <div class="button-filter" :class="{'violet': violet}" @click="$emit('click', title)">
        <img :src="filterImg(title)" alt="" width="24" height="24" :style="{ filter: violet ? 'invert(1)' : '' }">
        <h5 class="navigation-label" :class="{'violet': violet}">
            {{ title }}
        </h5>
    </div>
</template>
<style scoped>
.button-filter {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
    gap: 8px;
    height: 62px;
    width: 30%;
    background: #F0F0FC;
    border: 1px solid #A3A3EB;
    border-radius: 12px;
    flex: none;
    flex-grow: 1;
}
.navigation-label {
    color: #373745;
    line-height: 10px;
}
.violet {
    background: #6665DD;
    color: #F3F3F3;
}
</style>