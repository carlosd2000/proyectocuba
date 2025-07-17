<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import mifondo from '../components/mifondo.vue';
import editarfondocreador from '../components/editarfondocreador.vue';
import Footer from '../components/Footer.vue';
import localforage from 'localforage';

const router = useRouter();
const authStore = useAuthStore();

// Usamos computed para reaccionar a cambios
const userId = computed(() => authStore.userId)
const userType = computed(() => authStore.userType)
const creatorId = computed(() => authStore.profile?.creadorDirectoId)
const creatorType = computed(() => authStore.profile?.creadorDirectoTipo)
const bancoId = computed(() => authStore.bancoId)
const rutaJerarquica = computed(() => authStore.rutaJerarquica)

const logout = async () => {
    try {
        await AuthService.logout();
        // ✅ Limpia todo lo posible
        localStorage.clear();
        sessionStorage.clear();
        await localforage.clear(); // indexDB
        
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // ✅ Redirige
        router.push('/');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};
</script>
<template>
    <div class="container d-flex flex-column justify-content-center gap-3">
        <h1>boton para cerrar seccion</h1>
        <button class="border-0 d-flex flex-column align-items-center justify-content-center"  @click="logout">
            <span>Cerrar</span>
        </button>
    </div>
    <button @click="$router.push(`/horario/${$route.params.id}`)" class="m-5">click para ir a horarios</button>
    <editarfondocreador class="m-3"/>
    <mifondo class="m-3"/>
    <button v-if="userType !== 'listeros'" @click="$router.push(`/registrar/${$route.params.id}`)" class="m-5">ir a registrar</button>
    <h5 class="body mx-3">usuario "{{ userId }}" con el tipo "{{ userType }}", creado por "{{ creatorId }}" con el tipo "{{ creatorType }}", pertenece al banco "{{ bancoId }}" y su ruta jerárquica es "{{ rutaJerarquica }}"</h5>
    <footer>
        <Footer title="Usuario" />
    </footer>
</template>