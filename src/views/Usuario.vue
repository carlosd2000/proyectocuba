<script setup>
import { useRouter } from 'vue-router';
import { AuthService } from '@/firebase/auth';
import Footer from '../components/Footer.vue';

const router = useRouter();

const logout = async () => {
    try {
        await AuthService.logout();
        localStorage.removeItem('userProfile');
        localStorage.clear();
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
    <footer>
        <Footer title="Usuario" />
    </footer>
</template>