<template>
  <div class="card-price w-100" :class="{ 'horizontal-layout': !isListerosRoute }">
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
import CuentaRegresiva from './CuentaRegresiva.vue';
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRegistro } from '@/scripts/Registro.js';

export default {
  components: { CuentaRegresiva },
  props: {
    price: { type: Number, default: 0 },
    idBancoPadre: { type: String, required: true },
    idListero: { type: String, required: true }
  },
  setup(props) {
    const route = useRoute();
    const isListerosRoute = computed(() => route.path.startsWith('/listeros'));
    const { buscarBancoYDatosListero } = useRegistro();
    const datos = ref(null);
    const dynamicPrice = ref(props.price);

    onMounted(async () => {
      datos.value = await buscarBancoYDatosListero(props.idBancoPadre, props.idListero);
      // Solo mostrar el wallet del listero
      if (datos.value && datos.value.listero && typeof datos.value.listero.wallet === 'number') {
        dynamicPrice.value = datos.value.listero.wallet;
      } else {
        dynamicPrice.value = 0; // Si no existe, muestra 0
      }
    });

    const formattedPrice = computed(() => {
      return `$${dynamicPrice.value.toLocaleString()}`;
    });

    return {
      isListerosRoute,
      formattedPrice
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

/* Ajusta estos estilos según necesites para el diseño horizontal */
.horizontal-layout .price-value {
  font-size: 24px; /* Tamaño más pequeño para diseño horizontal */
}
</style>

