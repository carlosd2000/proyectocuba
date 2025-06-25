<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Header from '../components/Header.vue'
import CardPrice from '../components/CardPrice.vue'
import Dailyplay from '../components/Dailyplay.vue'
import ToolsButton from '../components/ToolsButton.vue'
import Footer from '../components/Footer.vue'
import { obtenerBancoPadre } from '@/scripts/FunctionBancoPadre.js'

const authStore = useAuthStore()
const isLoading = ref(true)
const error = ref(null)

// IDs reactivos
const idBancoPadre = ref(null)
const idListero = ref(null)

onMounted(async () => {
  try {
    if (authStore.isAuthenticated && !authStore.profile) {
      await authStore.loadUserProfile()
    }
    // Obtener el banco padre
    idBancoPadre.value = await obtenerBancoPadre()
    // El id del listero es el UID del usuario autenticado
    idListero.value = authStore.userId
  } catch (e) {
    error.value = "Error cargando datos"
    console.error("Error en Home:", e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container-login">
    <header>
      <Header/>
    </header>
    <main class="container">
      <CardPrice v-if="idBancoPadre && idListero"
        :id-banco-padre="idBancoPadre" :id-listero="idListero"/>
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
