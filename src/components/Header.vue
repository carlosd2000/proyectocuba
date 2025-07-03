<script setup>
import { ref } from 'vue'
import ButtonBack from '../components/ButtonBack.vue'
import { useHeader } from '../scripts/Header.js'

const { back, bell} = useHeader()

const props = defineProps({
  title: {
    type: String,
    default: undefined
  }
})
</script>
<template>
  <div class="container h-100">
    <div class="container d-flex flex-row justify-content-between align-items-center w-100 h-100">
      <div class="d-flex justify-content-center align-items-center">
        <ButtonBack v-if="!back" />
        <img v-else src="../assets/icons/Logo.svg" alt="Logo" />
      </div>
      <div class="d-flex justify-content-center align-items-center">
        <h5 class="subtitle">
          {{  title }}
        </h5>
      </div>
      <div v-if="bell" class="d-flex justify-content-center align-items-center">
        <img src="../assets/icons/Notificacion.svg" alt="">
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>