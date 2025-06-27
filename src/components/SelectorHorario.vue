<script setup>
import { ref, computed, watch, defineEmits, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre'
import { verificarHorarioActivo, verificarHorarioBasico } from '../scripts/FunctionHorarioActivo.js'

import Dia from '../assets/icons/Dia.svg'
import Atardecer from '../assets/icons/Atardecer.svg'
import Noche from '../assets/icons/Luna.svg'

const props = defineProps({
  horarioEdicion: { type: String, default: 'Dia' },
  modoEdicion: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selected', 'no-horarios-disponibles'])
const route = useRoute()

const dropdownOpen = ref(false)
const selectedValue = ref('1')
const selectedIcon = ref(Dia)

const allOptions = [
  { value: '1', icon: Dia, nombre: 'Dia' },
  { value: '2', icon: Atardecer, nombre: 'Tarde' },
  { value: '3', icon: Noche, nombre: 'Noche' }
]

const options = ref([])

function horarioToValue(nombre) {
  switch (nombre) {
    case 'Dia': return '1'
    case 'Tarde': return '2'
    case 'Noche': return '3'
    default: return '1'
  }
}

function valueToIcon(value) {
  switch (value) {
    case '1': return Dia
    case '2': return Atardecer
    case '3': return Noche
    default: return Dia
  }
}

onMounted(async () => {
  const bancoId = await obtenerBancoPadre()
  if (!bancoId) return

  const horarios = [
    { firebaseKey: 'dia', nombre: 'Dia' },
    { firebaseKey: 'tarde', nombre: 'Tarde' },
    { firebaseKey: 'noche', nombre: 'Noche' }
  ]
  
  const activos = []
  const esRutaAñadirJugada = route.path.startsWith('/anadirjugada')

  for (const h of horarios) {
    const estaActivo = esRutaAñadirJugada 
      ? await verificarHorarioActivo(bancoId, h.firebaseKey)
      : await verificarHorarioBasico(bancoId, h.firebaseKey)
    
    if (estaActivo) {
      const op = allOptions.find(o => o.nombre === h.nombre)
      if (op) activos.push(op)
    }
  }

  options.value = activos

  if (activos.length === 0) {
    selectedValue.value = null
    selectedIcon.value = null
    emit('no-horarios-disponibles')
    return
  }

  // Asegura que el valor inicial también sea válido
  const val = horarioToValue(props.horarioEdicion)
  const exists = activos.find(o => o.value === val)
  if (exists) {
    selectedValue.value = val
    selectedIcon.value = exists.icon
  } else if (activos.length > 0) {
    selectedValue.value = activos[0].value
    selectedIcon.value = activos[0].icon
  }
  emit('update:selected', selectedValue.value)
})


watch(selectedValue, (newVal) => {
  selectedIcon.value = valueToIcon(newVal)
  emit('update:selected', newVal)
})

const filteredOptions = computed(() => {
  return options.value.filter(option => option.value !== selectedValue.value)
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const selectOption = (option) => {
  selectedValue.value = option.value
  selectedIcon.value = option.icon
  dropdownOpen.value = false
}

const selectClass = computed(() => {
  switch (selectedValue.value) {
    case '1': return 'bg-dia'
    case '2': return 'bg-atardecer'
    case '3': return 'bg-noche'
    default: return ''
  }
})

const isOpenClass = computed(() => dropdownOpen.value ? 'active' : '')
const isDisabled = computed(() => options.value.length === 0)
</script>

<template>
  <div class="custom-select h-100" :class="[selectClass, isOpenClass, { 'disabled': isDisabled }]">
    <div class="selected-option" @click="!isDisabled && toggleDropdown()">
      <img v-if="selectedIcon" :src="selectedIcon" alt="">
      <img v-else src="../assets/icons/Error.svg" alt="Sin horarios">
      <img src="../assets/icons/Expand.svg" alt="" :class="{ 'disabled': isDisabled }">
    </div>

    <div class="options" v-if="dropdownOpen && !isDisabled">
      <div
        class="d-flex flex-column justify-content-center align-items-center"
        v-for="option in filteredOptions"
        :key="option.value"
        @click="selectOption(option)"
      >
        <img :src="option.icon" alt="">
      </div>
    </div>

    <select v-model="selectedValue" style="display: none;">
      <option v-for="option in options" :key="option.value" :value="option.value"></option>
    </select>
  </div>
</template>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.custom-select.disabled .selected-option {
  cursor: not-allowed;
}

.custom-select.disabled .selected-option img:last-child {
  filter: grayscale(100%);
}
.custom-select {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 4px 0px 8px;
  gap: 4px;
  width: 64px;
  height: 32px;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}
.selected-option {
  display: flex;
  align-items: center;
  border-radius: 60px;
  cursor: pointer;
}

.selected-option img {
  width: 20px;
  height: 100%;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 36px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  z-index: 1000;
  box-shadow: 0px 17px 7px rgba(0, 0, 0, 0.01), 0px 9px 6px rgba(0, 0, 0, 0.05), 0px 4px 4px rgba(0, 0, 0, 0.09), 0px 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  flex: none;
  order: 2;
  flex-grow: 0;
  z-index: 2;

}

.options div {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.options div:hover {
  background: #f0f0f0;
}

.options img {
  width: 20px;
  height: 20px;
}
.bg-dia { background-color: #F9FCC9; }
.bg-atardecer { background-color: #F9FCC9; }
.bg-noche { background-color: #C2C1F1; }

.bg-dia.active { background-color: #EFF779; }
.bg-atardecer.active { background-color: #EFF779; }
.bg-noche.active { background-color: #8584E4; }

</style>