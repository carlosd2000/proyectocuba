<template>
  <div class="head d-flex flex-column justify-content-center align-items-center w-100">
    <!-- ✅ Mostrar solo si NO estás en anadirjugada -->
    <div
      v-if="routeName !== 'anadirjugada'"
      class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border"
    >
      <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
        <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="showBack" />
        <img v-else src="../assets/icons/Logo.svg" class="ms-5" style="margin-left: 35px; width:32px; height:32px;" alt="Logo" />
      </div>

      <div class="col-7 row p-0 m-0 d-flex justify-content-end align-items-center">
        <button class="btn btn-light border-0 mx-1 p-0 bg-transparent" @click="$router.push(`/wallet/${$route.params.id}`)">
        </button>
        <div class="px-1 m-0 mr-2 d-flex justify-content-end align-items-center" v-if="showBell">
          <i class="bi bi-bell" style="font-size: 24px; width: 24px; height: 24px;"></i>
        </div>
      </div>
    </div>
    <!-- ✅ Encabezado alternativo para anadirjugada -->
    <div
      v-else
      class="col-12 d-flex justify-content-between align-items-center mt-3 px-3"
      style="min-height: 50px"
    >
      <!-- Botón de regreso bien clickeable -->
      <button class="btn btn-link p-0 m-0" style="font-size: 24px;" @click="$router.back()">
        <i class="bi bi-arrow-left"></i>
      </button>
      <!-- Título -->
      <h5 class="fw-bold text-dark m-0">Jugada</h5>
      <!-- Campana -->
      <div class="d-flex align-items-center">
      <img src="../assets/icons/Notification.svg" class="ms-2" style="width:32px; height:32px;" alt="Logo" />  
        <i class="bi bi-bell" style="font-size: 24px;"></i>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ButtonBack from '../components/ButtonBack.vue'
import { useHeader } from '../scripts/Header.js'

const { back } = useHeader()

const route = useRoute()
const routeName = ref('')

watchEffect(() => {
  routeName.value = route.name || ''
})

const showBack = computed(() => {
  return !['home', 'dashboard', 'listeros'].includes(routeName.value)
})

const showBell = computed(() =>
  ['home', 'dashboard', 'wallet', 'anadirjugada', 'listeros'].includes(routeName.value)
)
</script>


<style scoped>

.head{
  height: 100%;
}
p {
  font-weight: 450;
  color: #000000;
  font-size: 1.1rem;
}
.ms-2 {
  margin-left: 0.5rem;
}
i{
  color: #000000;
}
</style>