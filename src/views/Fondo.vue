<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { UserDataService } from '@/scripts/userDataService';
import { useAuthStore } from '@/stores/authStore'
import CardPrice from '../components/CardPrice.vue'
import ButtonFilter from '../components/ButtonFilter.vue';
import ListaMovimientos from '../components/ListaMovimientos.vue';

const authStore = useAuthStore()
const isLoading = ref(true)
const error = ref(null)
const userfondo = ref(null)

const unsubscribe = ref(null)

onMounted(async () => {
  try {
    if (authStore.isAuthenticated && !authStore.profile) {
      await authStore.loadUserProfile()
    }
    
    // Función para actualizar la fondo
    const updateUserData = (userData) => {
      if (userData) {
        userfondo.value = userData.fondo || 0; // Asigna 0 si no hay fondo
      } else {
        console.log("Usuario cerró sesión");
        userfondo.value = 0;
      }
    };
    
    // Cargar datos iniciales
    const initialData = await UserDataService.getCurrentUserData();
    updateUserData(initialData);
    
    // Escuchar cambios
    const unsubscribe = UserDataService.onAuthStateChanged(updateUserData);
    
  } catch (e) {
    error.value = "Error cargando datos"
    console.error("Error en Listeros:", e)
  } finally {
    isLoading.value = false
  }
})
onUnmounted(() => {
  if (unsubscribe.value) unsubscribe.value()
})
</script>

<template>
  <div class="container-login d-flex flex-column align-items-center">
    <header>
      <Header title="Fondo"/>
    </header>
    <main class="container-main">
      <CardPrice :price="userfondo"/>
      <div class="row" style="max-width: 400px; width: 100%;">
        <ButtonFilter/>
      </div>
      <div class="d-flex flex-column align-items-center w-100 h-100 overflow-y-auto">
        <ListaMovimientos/>
      </div>
    </main>
    <footer>
      <Footer title="Fondo"/>
    </footer>
  </div>
</template>

<style scoped>
.container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px 24px 16px;
  gap: 16px;
  width: 100%;
  height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
}
</style>