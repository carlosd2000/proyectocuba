<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Header from '../components/Header.vue'
import CardPrice from '../components/CardPrice.vue'
import Dailyplay from '../components/Dailyplay.vue'
import ToolsButton from '../components/ToolsButton.vue'
import Footer from '../components/Footer.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import CardPrice from '../components/CardPrice.vue'

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
    console.error("Error en Home:", e)
  } finally {
    isLoading.value = false
  }
})
onUnmounted(() => {
  if (unsubscribe.value) unsubscribe.value()
})
</script>

<template>
  <div class="container-login">
    <header>
      <Header/>
    </header>
    <main class="container">
      <CardPrice/>
      <dailyplay moneytime="20000000"/>
      <div class="line w-100"></div>
      <ToolsButton title="Herramientas" />
    </main>
    <footer>
      <Footer title="Home"/>
    </footer>
  </div>
</template>

<style scoped>
main{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  flex: none;
  order: 2;
  flex-grow: 1;
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
