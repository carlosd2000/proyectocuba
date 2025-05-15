<template>
    <div class="container">
      <div class="d-flex justify-content-end">
        <div class="d-flex align-items-center justify-content-between border-0 p-1 bg-white" style="min-width: 200px;">
          <!-- Selector de Turno con ícono -->
          <div class="d-flex align-items-center gap-2">
            <i :class="iconoTurno"></i>
            <select v-model="turnoSeleccionado" class="form-select form-select-sm border-0 p-0 bg-transparent text-dark fw-semibold" style="width: auto;">
              <option v-for="opcion in opciones" :key="opcion" :value="opcion">{{ opcion }}</option>
            </select>
          </div>
  
          <!-- Precio -->
          <div class="ms-4 fw-bold text-dark">
            <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push(`/listas/${$route.params.id}`)">
              {{ totalFormateado }}
            </button>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'
  import { useRoute, useRouter } from 'vue-router'
  import { setHorario } from '../scripts/añadir.js' // Importa la función setHorario
  
  // Firebase
  const db = getFirestore()
  const apuestasRef = collection(db, 'apuestas')
  
  // Router
  const route = useRoute()
  const router = useRouter()
  
  const props = defineProps({
    horarioEdicion: String,
    modoEdicion: Boolean
  })

  // Turnos disponibles
  const opciones = ['Dia', 'Tarde', 'Noche']
  const turnoSeleccionado = ref('Dia')
  
  // Total sumado
  const totalGlobal = ref(0)

  // Mostrar total con formato
  const totalFormateado = computed(() => {
    return `$${totalGlobal.value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
  })
  
  // Ícono según turno
  const iconoTurno = computed(() => {
    if (turnoSeleccionado.value === 'Dia') return 'bi bi-sun-fill text-warning'
    if (turnoSeleccionado.value === 'Tarde') return 'bi bi-cloud-sun-fill text-secondary'
    return 'bi bi-moon-fill text-primary'
  })
  
  // Listener actual de Firebase
  let unsubscribe = null
  
  // Función para escuchar en tiempo real según turno
  const escucharCambios = () => {
    // Cancelar listener anterior si existe
    if (unsubscribe) {
      unsubscribe()
    }
  
    const q = query(apuestasRef, where('horario', '==', turnoSeleccionado.value))
    unsubscribe = onSnapshot(q, (snapshot) => {
      let suma = 0
      snapshot.forEach(doc => {
        const data = doc.data()
        if (typeof data.totalGlobal === 'number') {
          suma += data.totalGlobal
        }
      })
      totalGlobal.value = suma
    })
  }
  
  // Iniciar escucha al montar
  onMounted(() => {
    // Solo establecer 'Dia' como predeterminado si no estamos en modo edición
    if (!props.modoEdicion) {
      turnoSeleccionado.value = 'Dia'
      setHorario('Dia')
    }
    escucharCambios()
  })
  
  // Escuchar cambios de turno
  watch(turnoSeleccionado, (nuevoHorario) => {
    setHorario(nuevoHorario) // Actualiza el horario en añadir.js
    escucharCambios()
  })
  // Escuchar cambios en horarioEdicion
  watch(() => props.horarioEdicion, (nuevoHorario) => {
    if (props.modoEdicion && nuevoHorario) {
      turnoSeleccionado.value = nuevoHorario
      setHorario(nuevoHorario)
    }
  }, { immediate: true })
  
  // Cancelar listener al desmontar
  onBeforeUnmount(() => {
    if (unsubscribe) {
      unsubscribe()
    }})
  </script>
  
  
<style scoped>
  select:focus {
    box-shadow: none;
  }
  .bi {
    font-size: 1.2rem;
  }
</style>
