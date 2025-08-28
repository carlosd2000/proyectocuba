<script setup>
import { computed } from 'vue'

const props = defineProps({
    fecha: {
        type: String,
        default: ''
    },
    mensaje: {
        type: String,
        default: ''
    },
    seleccion: {
        type: Array,
        default: ''
    },
})

const emit = defineEmits(['click'])

const displaySeleccion = computed(() => {
    if (!props.seleccion) return []
    if (props.seleccion.length <= 3) return props.seleccion

    // Tomamos los dos primeros y el resto se muestra como "+N"
    return [
        props.seleccion[0],
        props.seleccion[1],
        `+${props.seleccion.length - 2}`
    ]
})

const handleClick = () => {
    emit('click')
}
</script>
<template>
    <div class="d-flex flex-row justify-content-between align-items-start gap-3 w-100">
        <div class="d-flex justify-content-center align-items-center">
            <img src="../assets/icons/Notificar.svg" alt="">
        </div>
        <div class="pt-1 d-flex flex-column justify-content-center align-items-start gap-1 w-100 content-wrap">
            <h5 class="small small-gray">
                {{ fecha }}
            </h5>
            <div class="body">
                {{ mensaje }}
            </div>
            <div class="d-flex flex-row justify-content-start align-items-center flex-wrap gap-1">
                <div v-for="(value, index) in displaySeleccion" :key="index" class="seleccion" :class="{'purple': index === 0, 'gray': index !== 0}">
                    <h5 class="small" :class="{'purple': index === 0, 'gray': index !== 0}">
                        {{ value }}
                    </h5>
                </div>
            </div>
        </div>
        <div>
            <img src="../assets/icons/Chevron_right.svg" alt="" @click.self="$emit('click')">
        </div>
    </div>
</template>
<style scoped>
.seleccion{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 2px 12px;
    gap: 4px;
    height: 24px;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
}
.purple{
    background: #6665DD;
    color: #F3F3F3;
}
.gray{
    background: #E0E0F8;
    color: #373745;
}
.small-gray{
    color: #9B9BA2;
}
.content-wrap { 
    min-width: 0;
}
.body{
    width: 100%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 3;
    white-space: pre-wrap;
    text-overflow: ellipsis; 
}
</style>