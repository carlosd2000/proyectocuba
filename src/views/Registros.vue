<script setup>
import Registro from '../components/Registro.vue';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, computed } from 'vue';
import editarfondocreador from '../components/editarfondocreador.vue';

const authStore = useAuthStore();

// Usamos computed para reaccionar a cambios
const userId = computed(() => authStore.userId)
const userType = computed(() => authStore.userType)
const creatorId = computed(() => authStore.profile?.creadorDirectoId)
const creatorType = computed(() => authStore.profile?.creadorDirectoTipo)
const bancoId = computed(() => authStore.bancoId)
const rutaJerarquica = computed(() => authStore.rutaJerarquica)

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.profile) {
    await authStore.loadUserProfile();
  }
});
</script>

<template>
  <div class="col-12 m-0 p-0">
    <h5>usuario {{ userId }} con el tipo {{ userType }}, creado por {{ creatorId }} con el tipo {{ creatorType }}, pertenece al banco {{ bancoId }} y su ruta jerárquica es {{ rutaJerarquica }}</h5>
    <editarfondocreador/>
    <div v-if="authStore.profile">
      <Registro/>
    </div>
    <div v-else class="loading-placeholder">
      Cargando...
    </div>
  </div>
</template>

<style scoped>
.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>