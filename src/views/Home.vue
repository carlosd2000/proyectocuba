<script setup>
import Header from '../components/Header.vue'
import Dailyplay from '../components/Dailyplay.vue'
import ToolsButton from '../components/ToolsButton.vue'
import Footer from '../components/Footer.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { UserDataService } from '@/scripts/userDataService';
import { useAuthStore } from '@/stores/authStore'
import CardPrice from '../components/CardPrice.vue'

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
      <Header/>
    </header>
    <main class="container-main">
      <CardPrice :price="userfondo"/>
      <dailyplay moneytime="999"/>
      <div class="line w-100"></div>
      <ToolsButton title="Herramientas" />
    </main>
    <footer>
      <Footer title="Home"/>
    </footer>
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
.line{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  height: 4px;
  flex: none;
  order: 2;
  flex-grow: 0;
  border-top: 1px solid #CDCDD1;
}

</style>