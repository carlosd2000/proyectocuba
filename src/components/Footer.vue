<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Home from '../assets/icons/Home.svg'
import Home_Active from '../assets/icons/Home_Active.svg'
import Lista from '../assets/icons/Lista.svg'
import Lista_Active from '../assets/icons/Lista_Active.svg'
import Wallet from '../assets/icons/Wallet.svg'
import User from '../assets/icons/User.svg'


const route = useRoute()

const mostrarJugada = computed(() => route.path.startsWith('/transacciones'))
const mostrarTransferencias = computed(() => route.path.startsWith('/monitoreolisteros'))

const props = defineProps({
    title: {
        type: String,
        default: 'Home'
    }
})
</script>

<template>  
    <div class="container d-flex flex-row justify-content-center align-items-center">
        <div class="buttons-heith d-flex flex-column justify-content-center align-items-center" @click="$router.push(`/listeros/${$route.params.id}`)">
            <img :src="props.title === 'Home' ? Home_Active : Home" alt="">
            <h5 v-if="props.title !== 'Home'" class="navegation-label">Home</h5>
            <div v-else class="punto"></div>
        </div>
        <div class="buttons-heith d-flex flex-column justify-content-center align-items-center" @click="$router.push(`/lista/${$route.params.id}`)">
            <img :src="props.title === 'Lista' ? Lista_Active : Lista" alt="">
            <h5 v-if="props.title !== 'Lista'" class="navegation-label">Lista</h5>
            <div v-else class="punto"></div>
        </div>
        <div class="button-center d-flex justify-content-center align-items-center" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=normal`)">
            <img src="../assets/icons/Plus.svg" alt="">
        </div>
        <div class="buttons-heith d-flex flex-column justify-content-center align-items-center" @click="$router.push(`/wallet/${$route.params.id}`)">
            <img :src="props.title === 'Fondo' ? Wallet : Wallet" alt="">
            <h5 v-if="props.title !== 'Fondo'" class="navegation-label">Fondo</h5>
            <div v-else class="punto"></div>
        </div>
        <div class="buttons-heith d-flex flex-column justify-content-center align-items-center">
            <img :src="props.title === 'Usuario' ? User : User" alt="">
            <h5 v-if="props.title !== 'Usuario'" class="navegation-label">Usuario</h5>
            <div v-else class="punto"></div>
        </div>
    </div>
</template>

<style scoped>
    .container {
        padding: 8px 40px;
        gap: 40px;
        height: 88px;
        background: #F0F0FC;
        flex: none;
        flex-grow: 0;
    }
    .buttons-heith {
        padding: 0px 4px;
        gap: 8px;
        width: 24px;
        flex: none;
        order: 0;
        flex-grow: 0;
    }
    .punto{
        width: 4px;
        height: 4px;
        background: #050517;
        flex: none;
        flex-grow: 0;
    }
    .button-center {
        padding: 0px;
        gap: 10px;
        width: 30px;
        height: 40px;
        background: #6665DD;
        border-radius: 20px;
        flex: none;
        flex-grow: 0;
    }
    p{
        font-size: 0.6rem;
        margin: 0px;
    }
</style>