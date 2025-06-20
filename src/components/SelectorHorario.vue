<script setup>
import { ref, computed, watch, defineEmits } from 'vue'
import Dia from '../assets/icons/Dia.svg'
import Atardecer from '../assets/icons/Atardecer.svg'
import Noche from '../assets/icons/Luna.svg'

const emit = defineEmits(['update:selected'])

const dropdownOpen = ref(false)
const selectedValue = ref('1')
const selectedIcon = ref(Dia)

const options = [
  { value: '1', icon: Dia },
  { value: '2', icon: Atardecer },
  { value: '3', icon: Noche }
]

const filteredOptions = computed(() => {
  return options.filter(option => option.value !== selectedValue.value)
})

watch(selectedValue, (newVal) => {
  emit('update:selected', newVal)
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const selectOption = (option) => {
  selectedValue.value = option.value
  selectedIcon.value = option.icon
  dropdownOpen.value = false
}
// Clase dinámica según la selección
const selectClass = computed(() => {
  switch (selectedValue.value) {
    case '1': return 'bg-dia'
    case '2': return 'bg-atardecer'
    case '3': return 'bg-noche'
    default: return ''
  }
})

const isOpenClass = computed(() => dropdownOpen.value ? 'active' : '')
</script>

<template>
  <div class="custom-select" :class="[selectClass, isOpenClass]">
    <div class="selected-option" @click="toggleDropdown">
      <img :src="selectedIcon" alt="">
      <img src="../assets/icons/Expand.svg" alt="">
    </div>

    <div class="options" v-if="dropdownOpen">
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
.custom-select {
  position: relative;
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
padding: 0px 4px 0px 8px;
gap: 4px;
width: 56px;
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
  height: 20px;
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