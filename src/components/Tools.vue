<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'
import buttonTools from './buttonTools.vue';
import Modal from './Modal.vue';

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
    title: {
        type: String,
        default: 'Herramientas'
    }
});
const emit = defineEmits(['update:active', 'open-modal'])

const userType = authStore.userType

const Details = ref(false)

// Esta función se llama al hacer clic
function activarModal(tipo) {
  emit('update:active', true) // si aún quieres mantener el booleano
  emit('open-modal', tipo)    // nuevo evento con el tipo
}

function handleToolClick(title) {
    switch (title) {
        case 'Horario':
            activarModal('horario')
            break;
        case 'Pagos':
            router.push(`/payments/${authStore.userId}`);
            break;
        case 'Notificar':
            router.push(`/notificar/${authStore.userId}`);
            break;
        case 'Volumen':
            router.push(`/home/${authStore.userId}`);
            break;
        case 'Historico':
            router.push(`/home/${authStore.userId}`);
            break;
        case 'Usuario':
            router.push(`/usuario/${authStore.userId}`);
            break;
        default:
            console.log('Botón desconocido:', title);
    }
}

</script>
<template>
    <div class="container m-0 p-0 d-flex justify-content-center align-items-center w-100">
        <div class="container-tools d-flex flex-column justify-content-center align-items-center mb-3 w-100">
            <div class="d-flex justify-content-between align-items-center w-100" @click="Details = !Details">
                <h5 class="body2">
                    {{ title }}
                </h5>
                <div v-if="userType === 'bancos'">
                    <img v-if="Details === false" src="../assets/icons/Expand.svg" alt="">
                    <img v-else src="../assets/icons/Cotraer.svg" alt="">
                </div>
                <img v-else src="../assets/icons/Chevron_right.svg" alt="">
            </div>
            <div class="d-flex flex-column justify-content-center align-items-center gap-3 w-100" v-if="Details === true">
                <div class="d-flex flex-column justify-content-between align-items-center gap-2 w-100">
                    <div class="d-flex justify-content-between align-items-center gap-2 w-100">
                        <buttonTools title="Horario" :violet="false" @click="handleToolClick"/>
                        <buttonTools title="Pagos" :violet="false" @click="handleToolClick"/>
                        <buttonTools title="Notificar" :violet="false" @click="handleToolClick"/>
                    </div>
                    <div class="d-flex justify-content-between align-items-center gap-2 w-100">
                        <buttonTools title="Volumen" :violet="false" @click="handleToolClick"/>
                        <buttonTools title="Historico" :violet="false" @click="handleToolClick"/>
                        <buttonTools title="Usuario" :violet="true" @click="handleToolClick"/>
                    </div>
                </div>
                <div class="line"></div>
                <div v-if="userType === 'bancos' && Details === true" class="send-tiro d-flex justify-content-between align-items-center" @click="activarModal('tiro')">
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
    </div>
</template>
<style scoped>
p{
    margin: 0;
    padding: 0;
}
.container-tools {
    padding: 20px 16px;
    gap: 16px;
    background: #F0F0FC;
    border-radius: 12px;
    flex: none;
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
.line{
    width: 100%;
    height: 2px;
    border: 1px solid #C2C1F1;
    flex: none;
    align-self: stretch;
    flex-grow: 0;
}
</style>