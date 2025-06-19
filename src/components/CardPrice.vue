<template>
  <div class="card-price" :class="{ 'horizontal-layout': !isListerosRoute }">
    <!-- Valor/Precio -->
    <h1 class="price-value">
      {{ formattedPrice }}
    </h1>
    
    <!-- Cuenta Regresiva -->
    <CuentaRegresiva />
  </div>
</template>

<script>
import CuentaRegresiva from './CuentaRegresiva.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  components: {
    CuentaRegresiva
  },
  props: {
    price: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const route = useRoute();
    const isListerosRoute = computed(() => route.path.startsWith('/listeros'));
    
    return {
      isListerosRoute
    };
  },
  computed: {
    formattedPrice() {
      return `$${this.price.toLocaleString()}`;
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
  width: 343px;
  height: 124px;
  background: #EFF779;
  border-radius: 12px;
  flex: none;
  order: 0;
  flex-grow: 0;
  font-family: 'Inter', sans-serif;
}

.card-price.horizontal-layout {
  flex-direction: row;
  justify-content: space-between;
  width: auto; /* o un valor más pequeño según necesites */
  height: auto;
  padding: 15px 20px;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #000000;
}

/* Ajusta estos estilos según necesites para el diseño horizontal */
.horizontal-layout .price-value {
  font-size: 24px; /* Tamaño más pequeño para diseño horizontal */
  margin-right: 15px; /* Espacio entre el precio y el contador */
}
</style>