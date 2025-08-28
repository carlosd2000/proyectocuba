<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Header from '../components/Header.vue'
import NotificacionComponent from '../components/NotificacionComponent.vue';
import ButtonSend from '../components/ButtonSend.vue';

const router = useRouter()

const authStore = useAuthStore()
const viewnotification = ref(false)
const selectedNotification = ref(null)

const source = [
    {
        fecha: 'Hoy',
        mensaje: 'Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir. Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir. Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir. Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir. Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir. Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir. Hoy es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir.',
        seleccion: [
            'Todos',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ]
    },
    {
        fecha: 'Mañana',
        mensaje: 'Mañana es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir.',
        seleccion: [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ]
    },
    {
        fecha: 'Mañana',
        mensaje: 'Mañana es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir.',
        seleccion: [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ]
    },
    {
        fecha: 'Mañana',
        mensaje: 'Mañana es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir.',
        seleccion: [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ]
    },
    {
        fecha: 'Mañana',
        mensaje: 'Mañana es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir.',
        seleccion: [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ]
    },
    {
        fecha: 'Mañana',
        mensaje: 'Mañana es el día de la semana, un día más para disfrutar de la vida. Un día más para hacer algo nuevo, para experimentar algo nuevo, para conocer a alguien nuevo. Un día más para hacer algo que te haga sentir bien contigo mismo. Un día más para sonreir, para reir, para disfrutar. Un día más para vivir.',
        seleccion: [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ]
    },
]

const handleSeleccion = (value) => {
    viewnotification.value = true
    selectedNotification.value = value
}

const displaySeleccion = computed(() => {
    if (!selectedNotification.value?.seleccion) return []
    const seleccion = selectedNotification.value.seleccion
    if (seleccion.length <= 3) return seleccion
    return [seleccion[0], seleccion[1], `+${seleccion.length - 2}`]
})

const newNotification = () => {
    router.push(`/newnotification/${authStore.userId}`);
}
</script>
<template>
    <div class="container-login d-flex flex-column">
        <header>
            <Header title="Notificacion"/>
        </header>
        <div v-if="viewnotification === false" class="d-flex flex-column align-items-center w-100 h-100 overflow-y-auto">
            <main class="container-main">
                <div v-for="value in source" class="w-100" style="max-width: 500px;">
                    <NotificacionComponent :fecha="value.fecha" :mensaje="value.mensaje" :seleccion="value.seleccion" @click="handleSeleccion(value)"/>
                </div>
            </main>
            <footer >
                <ButtonSend title="Nueva notificación" :img="true" @click="newNotification()"/>
            </footer>
        </div>
        <div v-else class="d-flex flex-column align-items-center w-100 h-100 overflow-y-auto">
            <div class="d-flex flex-column justify-content-start align-items-center gap-3" style="max-width: 500px; padding: 16px 16px 24px 16px;">
                <div class="d-flex flex-row justify-content-between align-items-stretch flex-wrap gap-1 w-100">
                    <div class="d-flex flex-row justify-content-start align-items-stretch flex-wrap gap-1 h-100">
                        <div v-for="(value, index) in displaySeleccion" :key="index" class="seleccion" :class="{'purple': index === 0, 'gray': index !== 0}">
                            <img v-if="value === 'Todos'" src="../assets/icons/Colectores Principales.svg" alt="">
                            <h5 class="small" :class="{'purple': index === 0, 'gray': index !== 0}">
                                {{ value }}
                            </h5>
                        </div>
                    </div>
                    <div class="d-flex flex-row justify-content-end align-items-center flex-wrap gap-3">
                        <h5 class="small small-gray">
                            {{ selectedNotification?.fecha }}
                        </h5>
                        <img src="../assets/icons/Eliminar.svg" alt="">
                    </div>
                </div>
                <div class="mensaje-container">
                    {{ selectedNotification?.mensaje }}
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.container-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    gap: 16px;
    width: 100%;
    height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
    overflow-y: auto;
}
.mensaje-container{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
    gap: 10px;
    background: #F3F3F3;
    flex: none;
    flex-grow: 0;
    box-sizing: border-box;
    border: 1px solid #CDCDD1;
    border-radius: 12px;
    overflow-y: auto;
}
.seleccion{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    gap: 4px;
    height: auto;
    background: #6665DD;
    border-radius: 30px;
    flex: 1;
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
footer{
    padding: 16px 16px 24px 16px;
}
</style>