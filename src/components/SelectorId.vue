<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUsuariosCreados } from '@/scripts/useUsuariosCreados'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:id']) // Emitirá los IDs seleccionados

const { usuariosCreados } = useUsuariosCreados()
const usuariosSeleccionadosIds = ref([]) // Array para múltiples selecciones
const mostrarModal = ref(false)
const busqueda = ref('')
const inputFocused = ref(false)

// Filtrar usuarios según la búsqueda
const usuariosFiltrados = computed(() => {
  if (!busqueda.value) return usuariosCreados.value
  return usuariosCreados.value.filter(usuario => 
    usuario.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

// Verificar si un usuario está seleccionado
const estaSeleccionado = (usuarioId) => {
  return usuariosSeleccionadosIds.value.includes(usuarioId)
}

// Alternar selección de usuario
const toggleSeleccionUsuario = (usuarioId) => {
  const index = usuariosSeleccionadosIds.value.indexOf(usuarioId)
  if (index === -1) {
    // Agregar a la selección
    usuariosSeleccionadosIds.value.push(usuarioId)
  } else {
    // Remover de la selección
    usuariosSeleccionadosIds.value.splice(index, 1)
  }
  
  // Emitir los usuarios seleccionados
  const usuariosSeleccionados = usuariosCreados.value.filter(u => 
    usuariosSeleccionadosIds.value.includes(u.uid)
  )
  emit('update:id', usuariosSeleccionados)
}

// Seleccionar usuario al hacer clic en el nombre (comportamiento original)
const seleccionarUsuario = (usuario) => {
  // Limpiar selecciones anteriores y seleccionar solo este usuario
  usuariosSeleccionadosIds.value = [usuario.uid]
  busqueda.value = usuario.nombre
  mostrarModal.value = false
  emit('update:id', [usuario])
}

const abrirModal = () => {
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

// Cerrar modal al presionar Escape
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (mostrarModal.value) {
      cerrarModal()
    } else if (inputFocused.value) {
      inputFocused.value = false
    }
  }
}

// Configurar event listener para tecla Escape
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

// Limpiar event listener
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div class="d-flex flex-column justify-content-between align-items-center gap-2 w-100">
        <h5 class="body">
            {{ props.text }}
        </h5>
        <div class="position-relative w-100">
            <!-- Selector visual - ahora con input -->
            <div class="container-selector d-flex flex-row justify-content-between align-items-center">
                <h5 class="input-label">
                    {{ props.type }}
                </h5>
                <div class="d-flex justify-content-between align-items-center w-100">
                    <input 
                        v-model="busqueda"
                        @focus="inputFocused = true"
                        @blur="inputFocused = false"
                        class="input-busqueda"
                        :placeholder="props.placeholder"
                        type="text"
                    >
                </div>
                <div class="icono-expand" @click="abrirModal">
                    <img src="../assets/icons/Expand.svg" alt="Expandir">
                </div>
            </div>

            <!-- Modal de selección -->
            <div v-if="mostrarModal" class="modal-backdrop" @click="cerrarModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h2 class="modal-title">Seleccionar {{ props.type }}</h2>
                        <button class="modal-close" @click="cerrarModal">
                            <img src="../assets/icons/Cerrar.svg" alt="Cerrar">
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Campo de búsqueda dentro del modal -->
                        <div class="busqueda-modal">
                            <input 
                                v-model="busqueda"
                                class="input-busqueda-modal"
                                placeholder="Buscar usuario..."
                                type="text"
                            >
                        </div>
                        <ul class="modal-list">
                            <li
                                v-for="usuario in usuariosFiltrados"
                                :key="usuario.uid"
                                class="modal-item"
                                :class="{ 'seleccionado': estaSeleccionado(usuario.uid) }"
                            >
                                <div class="d-flex align-items-center w-100">
                                    <!-- Checkbox para selección múltiple -->
                                    <input
                                        type="checkbox"
                                        :checked="estaSeleccionado(usuario.uid)"
                                        @click.stop="toggleSeleccionUsuario(usuario.uid)"
                                        class="me-2"
                                    >
                                    <!-- Nombre del usuario (comportamiento original) -->
                                    <span 
                                        @click="seleccionarUsuario(usuario)"
                                        class="flex-grow-1"
                                    >
                                        {{ usuario.nombre }} ({{ usuario.tipo }})
                                    </span>
                                </div>
                            </li>
                            <li v-if="usuariosFiltrados.length === 0" class="modal-item no-results">
                                No se encontraron resultados
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
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
  display: flex;
  align-items: center;
}

.input-label {
  margin: 0;
  white-space: nowrap;
  color: #666;
}

.input-busqueda {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 1rem;
  color: #333;
  cursor: text;
}

.input-busqueda::placeholder {
  color: #9B9BA2;
}

.icono-expand {
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icono-expand:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

/* Fondo del modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Contenido del modal */
.modal-content {
  box-sizing: border-box;
  background: rgb(255, 255, 255);
  border: 0.5px solid #FDFEF2;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Encabezado del modal */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

/* Campo de búsqueda en el modal */
.busqueda-modal {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.input-busqueda-modal {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #030310;
  background-color: transparent;
  border-radius: 20px;
  outline: none;
}

/* Cuerpo del modal */
.modal-body {
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
}

/* Lista del modal */
.modal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.modal-item {
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.modal-item:last-child {
  border-bottom: none;
}

.modal-item:hover {
  background-color: rgba(102, 101, 221, 0.1);
}

.modal-item.seleccionado {
  background-color: rgba(102, 101, 221, 0.2);
  font-weight: bold;
}

.no-results {
  color: #9B9BA2;
  text-align: center;
  cursor: default;
}

.no-results:hover {
  background-color: transparent;
}

/* Estilo para el checkbox */
.modal-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>