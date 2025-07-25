<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const props = defineProps({
    title: {
        type: String,
        default: 'Herramientas'
    }
});
const emit = defineEmits(['update:active'])

const userType = authStore.userType

// Esta función se llama al hacer clic
function activarModal() {
  emit('update:active', true)  // o el valor que necesites emitir
}
</script>
<template>
    <div class="container m-0 p-0 d-flex justify-content-center align-items-center w-100">
        <div class="container-tools d-flex flex-column justify-content-center align-items-center w-100">
            <div class="d-flex justify-content-between align-items-center w-100">
                <h5 class="body2">
                    {{ title }}
                </h5>
                <img src="../assets/icons/Chevron_right.svg" alt="">
            </div>
            <div v-if="userType === 'bancos'" class="send-tiro d-flex justify-content-between align-items-center" @click="activarModal">
                <div class="d-flex justify-content-center align-items-center gap-3">
                    <img src="../assets/icons/Lista.svg" alt="" width="20" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);">
                    <h5 class="label text-white">
                        Enviar tiros
                    </h5>
                </div>
                <img src="../assets/icons/Chevron_right.svg" alt="" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);">
            </div>
        </div>
    </div>
</template>
<style scoped>
p{
    margin: 0;
    padding: 0;
}
.container-tools {
    padding: 10px 16px;
    gap: 8px;
    background: #F0F0FC;
    border-radius: 12px;
    flex: none;
    align-self: stretch;
    flex-grow: 0;
}
.send-tiro{
    padding: 10px 12px 10px 16px;
    gap: 16px;
    height: 62px;
    max-width: 400px;
    width: 100%;
    background: #050517;
    border-radius: 12px;
    flex: none;
    flex-grow: 0;
}
</style>