<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  img: Boolean, // true = mostrar imagen
  titles: {
    type: Array,
    default: () => []
  },
  width: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['update:seleccion']) // envia la opción seleccionada
const selectedOption = ref(getDisplayText(props.titles[0]))

function getDisplayText(titulo) {
  return titulo.includes('!!') ? titulo.split('!!')[0] : titulo
}
function getIconName(titulo) {
  return titulo.includes('!!') ? titulo.split('!!')[1] : titulo
}

function optionSelected(tituloRaw) {
  const titulo = getDisplayText(tituloRaw)
  selectedOption.value = titulo
  emit('update:seleccion', titulo)
}

// Función para obtener el ícono según el título
function getIcon(nombre) {
  return new URL(`../assets/icons/${nombre}.svg`, import.meta.url).href
}
</script>

<template>
  <div class="d-flex flex-row gap-2 w-100">
    <button
      v-for="tituloRaw in props.titles"
      :key="tituloRaw"
      class="tipo btn"
      @click="optionSelected(tituloRaw)"
      :class="{ activo: selectedOption === getDisplayText(tituloRaw) }"
    >
      <img v-if="props.img" :src="getIcon(getIconName(tituloRaw))" alt="" :width="props.width" />
      <h5 class="navigation-label">{{ getDisplayText(tituloRaw) }}</h5>
    </button>
  </div>
</template>

<style scoped>
button.tipo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  background-color: #F3F3F3;
  gap: 4px;
  width: 69.75px;
  border-radius: 12px;
  flex: 1; /* 👈 que todos los botones se expandan por igual */
  width: 100%;
}
.btn.activo {
  background: #6665dd;
}
.btn.activo h5 {
  color: #ffffff;
}
.btn.activo img {
  filter: brightness(0) invert(1);
}
h5.navigation-label {
  color: #696974;
}
</style>
