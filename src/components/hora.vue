<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: String
});

const emit = defineEmits(['update:modelValue']);

const opciones = ['Día', 'Tarde', 'Noche'];
const turnoSeleccionado = ref(props.modelValue || 'Día');

watch(turnoSeleccionado, (newValue) => {
    emit('update:modelValue', newValue);
});
</script>
<template>
    <div class="col-5 m-0 p-0 d-flex flex-nowrap align-items-center">
        <select v-model="turnoSeleccionado" class="form-select form-select-sm text-small border-0 p-0 bg-transparent text-dark fw-semibold" style="width: auto;">
            <option v-for="opcion in opciones" :key="opcion" :value="opcion">{{ opcion }}</option>
        </select>
    </div>
</template>