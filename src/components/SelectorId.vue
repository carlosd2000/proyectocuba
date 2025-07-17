<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsuariosCreados } from '@/scripts/useUsuariosCreados'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:id']) // Emitirá el ID seleccionado

const { usuariosCreados } = useUsuariosCreados()
const usuarioSeleccionadoId = ref('')
const mostrarLista = ref(false)

const usuarioSeleccionado = computed(() =>
  usuariosCreados.value.find(u => u.uid === usuarioSeleccionadoId.value)
)

const seleccionar = (id) => {
  usuarioSeleccionadoId.value = id
  mostrarLista.value = false
  const usuario = usuariosCreados.value.find(u => u.uid === id)
  emit('update:id', usuario)
}

const toggleLista = () => {
  mostrarLista.value = !mostrarLista.value
}
</script>

<template>
    <div class="d-flex flex-column justify-content-between align-items-center gap-2 w-100">
        <h5 class="body">
            {{ props.text }}
        </h5>
        <div class="position-relative w-100">
            <!-- Selector visual -->
            <div class="container-selector d-flex flex-row justify-content-between align-items-center" @click="toggleLista">
                <h5 class="input-label">
                    {{ props.type }}
                </h5>
                <div class="d-flex justify-content-between align-items-center w-100">
                    <h5 class="label">
                        {{ usuarioSeleccionado?.nombre }}
                    </h5>
                </div>
                <img src="../assets/icons/Expand.svg" alt="">
            </div>

            <!-- Lista desplegable -->
            <ul v-if="mostrarLista" class="dropdown-list">
                <li
                    v-for="usuario in usuariosCreados"
                    :key="usuario.uid"
                    @click="seleccionar(usuario.uid)"
                    class="dropdown-item"
                >
                    {{ usuario.nombre }} ({{ usuario.tipo }})
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.container-selector {
  box-sizing: border-box;
  padding: 8px 12px 8px 16px;
  gap: 10px;
  width: 100%;
  height: 48px;
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
  cursor: pointer;
  background-color: transparent;
}

.dropdown-list {
  list-style: none;
  margin: 4px 0 0 0;
  padding: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  max-height: 200px;
  overflow-y: auto;
  position: absolute; /* flota */
  top: 100%;           /* justo debajo del selector */
  left: 0;
  z-index: 10;         /* asegúrate que esté por encima */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>
