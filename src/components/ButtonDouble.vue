<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
    fistbutton: {
        type: String,
        default: ''
    },
    secondbutton: {
        type: String,
        default: ''
    },
    isEnabled: {
        type: Boolean,
        default: false
    }
})

const cancelarButton = () => {
    const path = route.path || '' // p. ej. "/transferir/ABC123"
    const id = route.params.id ?? ''

    // Opción simple: comprobar prefijo
    if (path.startsWith('/transferir')) {
        router.push(id ? `/fondo/${id}` : '/fondo')
    } else {
        router.push(id ? `/payments/${id}` : '/home')
    }
}
</script>
<template>
    <div class="container-buttons d-flex flex-row justify-content-between align-items-center w-100">
        <div class="button d-flex flex-row justify-content-center align-items-center" @click="cancelarButton()">
            <h5 class="label">
                {{ props.fistbutton }}
            </h5>
        </div>
        <div class="button d-flex flex-row justify-content-center align-items-center" :disabled="!isEnabled" :class="isEnabled ? 'enabled' : 'disabled'" @click="isEnabled && $emit('accionSegundoBoton')">
            <h5 class="label" :class="isEnabled ? 'enabled' : 'disabled'">
                {{ props.secondbutton }}
            </h5>
        </div>
    </div>
</template>
<style scoped>
.container-buttons{
    padding: 16px 16px 24px 16px;
    gap: 16px;
    width: 100%;
    background-color: #fdfef2;
}
.button {
    padding: 8px;
    gap: 10px;
    height: 48px;
    background: #C2C1F1;
    border-radius: 30px;
    flex: 1;
    flex-grow: 1;
}
.label{
    text-align: center;
}
.enabled {
    background: #6665DD;
    color: #FFFFFF;
    font-weight: 600;
}
.disabled {
    background: #E0E0F8;
    color: #C2C1F1;
    cursor: not-allowed;
}
</style>