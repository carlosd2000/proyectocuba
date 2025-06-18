<template>
  <div class="card-price">
    <!-- Valor/Precio -->
    <div class="price-value">
      {{ formattedPrice }}
    </div>
    
    <!-- Cuenta Regresiva -->
    <CuentaRegresiva />
  </div>
</template>

<script>
import CuentaRegresiva from './CuentaRegresiva.vue';

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
  font-family: 'Inter', sans-serif; /* Ejemplo de fuente */
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #000000;
}
</style>