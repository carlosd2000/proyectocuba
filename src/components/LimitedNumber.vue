<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['accionPimerBoton', 'accionSegundoBoton', 'update:value'])

const monto = ref('')

// Emitir cambios cuando el monto cambie
watch(monto, (newValue) => {
    emit('update:value', {
        title: props.title,
        monto: newValue
    })
})
</script>
<template>
    <div class="d-flex flex-column align-items-start gap-2 w-100">
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
            <h5 class="label">
                {{ title }}
            </h5>
            <div v-if="title === 'Fijo'" class="d-flex flex-row justify-content-center align-items-center gap-3" style="width: 100px;">
                <h5 class="navigation-label">
                    Limitados
                </h5>
                <h5 class="navigation-label">
                    No juegan
                </h5>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center gap-1 w-100">
            <div class="input d-flex flex-row align-items-center gap-1 w-50">
                <h5 class="input-label">
                    $
                </h5>
                <input v-model="monto" class="border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
            </div>
            <div class="button-circle" @click="$emit('accionPimerBoton', title)">
                <img src="../assets/icons/Fecha.svg" alt="">
            </div>
            <div class="button-circle" @click="$emit('accionSegundoBoton', title)">
                <img src="../assets/icons/Bloquear.svg" alt="">
            </div>
        </div>
    </div>
</template>
<style scoped>
.button-circle{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 2px 12px;
    gap: 4px;
    width: 48px;
    height: 48px;
    background: #E0E0F8;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
}
.input{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 12px 8px 16px;
    gap: 10px;
    height: 48px;
    width: 100%;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    flex-grow: 1;
}
</style>