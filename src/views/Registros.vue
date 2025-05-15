<script setup>
import Registro from '../components/Registro.vue';
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.profile) {
    await authStore.loadUserProfile();
  }
});
</script>

<template>
  <div class="col-12 m-0 p-0">
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