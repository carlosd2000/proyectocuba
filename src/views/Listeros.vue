<script setup>
import Header from '../components/Header.vue'
import Dailyplay from '../components/Dailyplay.vue'
import Tools from '../components/Tools.vue'
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
    <main class="m-0 p-0 d-flex flex-column justify-content-center align-items-center">
      <div class="col-12 row m-0 p-0 d-flex justify-content-center align-items-center">
        <div class="col-12 col-sm-8 m-0 p-0 row d-flex justify-content-center align-items-center">
          <div class="col-11 my-2 d-flex justify-content-center box-shadow">
            <dailyplay /> 
          </div>
        </div>    
        <div class="col-12 col-sm-8 m-0 p-0 row d-flex justify-content-center align-items-center">
          <div class="col-11 m-2 d-flex justify-content-center box-shadow">
            <tools />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<style scoped>
.box-shadow {
  border-radius: 6px;
  border: 2px solid #000000;
  box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.853);
}
header{
  height: 7%;
  width: 100%;
}
main {
  min-height: 93%;
  width: 100%;
}
</style>
