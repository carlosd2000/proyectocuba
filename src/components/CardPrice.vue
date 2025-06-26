<template>
  <div class="card-price w-100" :class="{ 'horizontal-layout': !isListerosRoute }">
    <!-- Valor/Precio -->
    <h1 v-if="isListerosRoute" class="price-value">
      {{ formattedPrice }}
    </h1>
    <h3 v-else class="price-value">
      {{ formattedPrice }}
    </h3>
    <!-- Cuenta Regresiva -->
    <CuentaRegresiva />
  </div>
</template>

<script>
import CuentaRegresiva from './CuentaRegresiva.vue'
import { computed, onMounted } from 'vue'
import { useTotalGlobal } from '@/scripts/UseTotalGlobal.js'
import { useRoute } from 'vue-router'

export default {
  components: { CuentaRegresiva },
  setup() {
    const route = useRoute()
    const isListerosRoute = computed(() => route.path.startsWith('/listeros'))
    const { totalGlobal, isLoading, fetchTotalGlobal } = useTotalGlobal()

    onMounted(() => {
      fetchTotalGlobal()
    })

    const formattedPrice = computed(() => {
      return isLoading.value ? 'Cargando...' : `$${totalGlobal.value.toLocaleString()}`
    })

    return {
      isListerosRoute,
      formattedPrice
    }
  }
}
</script>

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

/* Ajusta estos estilos según necesites para el diseño horizontal /
.horizontal-layout .price-value {
  font-size: 24px; / Tamaño más pequeño para diseño horizontal */

</style>