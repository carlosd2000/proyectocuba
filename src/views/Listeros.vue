<script setup>
import Header from '../components/Header.vue'
import Dailyplay from '../components/Dailyplay.vue'
import ToolsButton from '../components/ToolsButton.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    if (authStore.isAuthenticated && !authStore.profile) {
      await authStore.loadUserProfile()
    }
    // Aquí puedes cargar datos específicos de Listeros si es necesario
  } catch (e) {
    error.value = "Error cargando datos"
    console.error("Error en Listeros:", e)
  } finally {
    isLoading.value = false
  }
})
</script>


<template>
  <div class="container-login">
    <header class="col-12 m-0 p-0">
      <Header/>
    </header>
    <main class="container h-100">
      <dailyplay />
      <div class="line"></div>
      <ToolsButton title="Herramientas" />
    </main>
  </div>
</template>
<style scoped>
main{
  gap: 10px;

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
