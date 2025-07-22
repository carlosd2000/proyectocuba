<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import CuentaRegresiva from './CuentaRegresiva.vue'
import BtnTransferir from './BtnTransferir.vue'
import { useRoute, useRouter } from 'vue-router'
import { useFondo } from '../scripts/useFondo.js'
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()
const isListerosRoute = computed(() => route.path.startsWith('/home') || route.path.startsWith('/fondo') || route.path.startsWith('/transferir'))
const isFondoRoute = route.path.startsWith('/fondo')

const emit = defineEmits(['update:showDetails'])

const { fondoActual } = useFondo()

const showDetails = ref(false)

watch(showDetails, (newValue) => {
  emit('update:showDetails', newValue)
})
const toggleDetails = () => {
  router.push(`/fondo/${route.params.id}`)
  if (authStore.userType !== 'listeros') {
    showDetails.value = !showDetails.value
  }
}
</script>

<template>
  <div class="card-price-container d-flex flex-column justify-content-start align-items-center gap-2 w-100">
    <div class="d-flex flex-row justify-content-between gap-2 w-100" style="max-width: 400px;">
      <div @click="toggleDetails" class="card-price flex-grow-1" :class="{ 'horizontal-layout': !isListerosRoute }">
        <!-- Valor/Precio -->
        <h1 v-if="isListerosRoute" class="price-value">
          ${{ fondoActual  }}
        </h1>
        <h3 v-else class="price-value">
          {{ fondoActual  }}
        </h3>
        <!-- Cuenta Regresiva -->
        <div v-if="!isFondoRoute">
          <CuentaRegresiva />
        </div>
        <div v-else class="container-text-fondo d-flex flex-row justify-content-center">
          <img src="../assets/icons/Ganancia.svg" alt="">
          <h5 class="small">
            Fondo recaudado
          </h5>
          <img v-if="authStore.userType === 'listeros'" src="../assets/icons/Chevron_right.svg" alt="">
        </div>
        <div v-if="authStore.userType !== 'listeros' && isFondoRoute">
          <img v-if="!showDetails" src="../assets/icons/Chevron_down_alt.svg" alt="">
          <img v-else src="../assets/icons/Chevron_up_alt.svg" alt="">
        </div>
      </div>
      <div v-if="authStore.userType !== 'listeros' && isFondoRoute" class="d-flex justify-content-center align-items-center">
        <BtnTransferir title="Transferir"/>
      </div>
    </div>
    <div v-if="authStore.userType !== 'listeros' && isFondoRoute" class="d-flex justify-content-center align-items-center w-100">
      <div v-if="showDetails" class="details-section d-flex flex-column justify-content-center align-items-center w-100">
        <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
          <h3 class="fondo">
            $16500
          </h3>
          <h5 class="body">
            Recaudacion pendiente
          </h5>
        </div>
        <div class="p-2 d-flex justify-content-between border-top gap-1 w-100">
          <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
            <h5 class="body-bold">
              $16500
            </h5>
            <h5 class="body">
              Fondo
            </h5>
          </div>
          <div class="line"></div>
          <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
            <h5 class="body-bold">
              $1500
            </h5>
            <h5 class="body">
              Ganancia
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-price-container {
  width: 100%;
  max-width: 400px;
  max-height: 124px;
  position: relative; /* Agregado */
  z-index: 10; 
}
.card-price {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 8px;
  height: 124px;
  background: #EFF779;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  font-family: 'Inter', sans-serif;
}

.card-price.horizontal-layout {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 56px;
  padding: 15px 20px;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #000000;
}

.container-text-fondo {
  padding: 0px;
  gap: 8px;
  width: 165px;
  flex: none;
  flex-grow: 0;
}

.container-text-fondo img,
.container-text-fondo h5 {
  color: #373745;
}
.details-section{
  padding: 20px;
  gap: 16px;
  width: 343px;
  top: 220px;
  background: #F8FBFE;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  z-index: 6;
}
.body{
  color: #696974;
}
h3.fondo{
  font-size: 16px;
  line-height: 18px;
}
.line{
  width: 38px;
  height: 2px;
  border: 1px solid #F0F0FC;
  transform: rotate(90deg);
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}
</style>