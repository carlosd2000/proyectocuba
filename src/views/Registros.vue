<script setup>
import Registro from '../components/Registro.vue';
import { onMounted, computed } from 'vue';
import editarfondocreador from '../components/editarfondocreador.vue';

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.profile) {
    await authStore.loadUserProfile();
  }
});
</script>

<template>
  <div class="col-12 m-0 p-0">
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