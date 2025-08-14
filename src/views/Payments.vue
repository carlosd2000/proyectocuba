<script setup>
import Header from '../components/Header.vue'
import ButtonSend from '../components/ButtonSend.vue'
import PayCardsContainer from '../components/PayCardsContainer.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const configPayments = () => {
    router.push(`/configpayments/${authStore.userId}`);
}
</script>
<template>
    <div class="container-login d-flex flex-column align-items-center gap-2">
        <header>
            <Header title="Pagos"/>
        </header>
        <main class="container-main">
            <ButtonSend title="Configurar nuevo pago" :img="true" @click="configPayments()"/>
            <PayCardsContainer/>
        </main>
    </div>
</template>
<style scoped>
.container-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 16px;
    gap: 24px;
    width: 100%;
    height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
    overflow-y: auto;
}
</style>