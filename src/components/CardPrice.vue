<script setup>
import CuentaRegresiva from './CuentaRegresiva.vue'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFondo } from '../scripts/useFondo.js'

const route = useRoute()
const isListerosRoute = computed(() => route.path.startsWith('/home') || route.path.startsWith('/fondo'))
const isFondoRoute = route.path.startsWith('/fondo')

const { fondoActual } = useFondo()
</script>

<template>
  <div class="card-price w-100" :class="{ 'horizontal-layout': !isListerosRoute }">
    <!-- Valor/Precio -->
    <h1 v-if="isListerosRoute" class="price-value">
      {{ fondoActual  }}
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
      <img src="../assets/icons/Chevron_right.svg" alt="">
    </div>
  </div>
</template>

<style scoped>
.card-price {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 8px;
  width: 100%;
  max-width: 400px;
  height: 124px;
  background: #EFF779;
  border-radius: 12px;
  flex: none;
  order: 0;
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
</style>