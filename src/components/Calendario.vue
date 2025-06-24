<template>
  <div
    class="bg-light d-flex align-items-center justify-content-between"
  >
    <button @click="diaAnterior">
      <img src="../assets/icons/Chevron_left.svg" alt="" style="width: 20px; height: 20px; cursor: pointer;" />
    </button>

    <!-- Imagen personalizada -->
    
    <div class="d-flex flex-row w-100" style="height: 20px; position: relative;">
      <!-- Visual: Hoy o fecha formateada -->
      <img src="../assets/icons/Calendario.svg" alt="Calendario" @click="abrirCalendario" style="cursor: pointer;" />
      <input
        type="text"
        :value="esMismoDia(fechaSeleccionada, hoy) ? 'Hoy' : fechaFormateadaCorta"
        @click="abrirCalendario"
        readonly
        class="border-0 bg-transparent text-center body"
        style="width: 100%; font-size: 1rem; cursor: pointer;"
      />

      <!-- Real: input tipo date oculto para usar el selector -->
      <input
        ref="inputCalendario"
        type="date"
        v-model="fechaSeleccionadaString"
        :max="hoyString"
        class="input-oculto-datepicker"
      />
    </div>

    <button @click="diaSiguiente" :disabled="esMismoDia(fechaSeleccionada, hoy)" :class="{ 'disabled-button': esMismoDia(fechaSeleccionada, hoy) }">
      <img src="../assets/icons/Chevron_right.svg" alt="" style="width: 20px; height: 20px; cursor: pointer;" />
    </button>
  </div>
</template>

<script setup>
import { defineEmits, ref, computed } from 'vue'
import { useCalendario } from '../scripts/calendario.js'

const emit = defineEmits(['cambiar-fecha'])

const {
  fecha,
  numeros,
  fechaSeleccionada,
  fechaSeleccionadaString,
  fechaFormateada,
  diaAnterior,
  diaSiguiente,
  esMismoDia
} = useCalendario(emit)

const hoy = ref(new Date())
const hoyString = ref(hoy.value.toISOString().slice(0, 10))

const inputCalendario = ref(null)

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const fechaFormateadaCorta = computed(() => {
  const fecha = new Date(fechaSeleccionada.value)
  const dia = fecha.getDate()
  const mesNombre = meses[fecha.getMonth()]
  return `${dia} ${mesNombre}`
})

const abrirCalendario = () => {
  const input = inputCalendario.value
  if (input?.showPicker) {
    input.showPicker()
  } else {
    input?.focus()
  }
}



</script>


<style scoped>
.bg-light {
  padding: 2px 8px;
  gap: 6px;
  margin: 0;
  max-width: 160px;
  height: 36px;
  background: #F3F3F3;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
}
button{
display: flex;
justify-content: center;
align-items: center;
width: 20px;
height: 20px;
margin: 0;
padding: 0;
background: #E0E0F8;
mix-blend-mode: multiply;
border: none;
border-radius: 30px;
flex: none;
flex-grow: 0;
}
img{
  margin: 0;
  padding: 0;
}
.disabled-button {
  background-color: #F3F3F3 !important;
  cursor: not-allowed;
}
.input-oculto-datepicker {
  position: absolute;
  margin: 0;
  padding: 0;
  border: none;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  height: 0;
}

/* Ocultar ícono de calendario nativo */
input[type="date"].no-calendar-icon::-webkit-calendar-picker-indicator {
  display: none;
}
input[type="date"].no-calendar-icon {
  cursor: default;
}
</style>

