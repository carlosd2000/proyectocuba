<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { leerEstadosHorariosCache, actualizarCacheHorarios } from '../scripts/FunctionHorarioActivo.js'
import Header from '../components/Header.vue'
import ButtonSend from '../components/ButtonSend.vue'
import PayCardsContainer from '../components/PayCardsContainer.vue'

const router = useRouter()
const authStore = useAuthStore()
const mostrarBoton = ref(false)

const configPayments = () => {
    router.push(`/configpayments/${authStore.userId}`);
}

const verificarHorariosCompletos = async () => {
    try {
        // 1. Actualizar cache de horarios activos
        await actualizarCacheHorarios(authStore.bancoId)
        const cache = leerEstadosHorariosCache()
        
        // 2. Obtener configuraciones guardadas
        const configPagos = JSON.parse(localStorage.getItem('configPagos') || '{}')
        
        // 3. Definir horarios a verificar
        const horarios = [
            { firebaseKey: 'dia', nombre: 'Dia' },
            { firebaseKey: 'tarde', nombre: 'Tarde' },
            { firebaseKey: 'noche', nombre: 'Noche' }
        ]
        
        // 4. Verificar cada horario activo
        let todosCompletos = true
        let alMenosUnoActivo = false
        
        for (const h of horarios) {
            const estado = cache[h.firebaseKey]
            if (estado?.activo) {
                alMenosUnoActivo = true
                if (!configPagos[h.nombre]) {
                    todosCompletos = false
                    break
                }
            }
        }
        
        // Mostrar botón solo si hay al menos un horario activo y todos tienen datos
        mostrarBoton.value = alMenosUnoActivo && todosCompletos
    } 
    catch (error) {
        console.error('Error verificando horarios:', error)
        mostrarBoton.value = false
    }
}

onMounted(async () => {
    await verificarHorariosCompletos()
})
</script>
<template>
    <div class="container-login d-flex flex-column align-items-center gap-2">
        <header>
            <Header title="Pagos"/>
        </header>
        <main class="container-main">
            <ButtonSend v-if="!mostrarBoton && authStore.userType === 'bancos'" title="Configurar nuevo pago" :img="true" @click="configPayments()"/>
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