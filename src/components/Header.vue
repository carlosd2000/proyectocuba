<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
      <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
        <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="!back"/>
        <p class="col-8 m-0 p-1 ml-2">hh:mm:ss</p>
      </div>
      <div class="col-7 row p-1 m-0 d-flex justify-content-end align-items-center">
        <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push('/')">
          <p class="m-0 p-1">$20,000,000.00</p>
        </button>
        
        <div class="col-2 p-2 m-0 d-flex justify-content-end align-items-center" v-if="bell">
          <i class="bi bi-bell"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ButtonBack from '../components/ButtonBack.vue'

import { useRoute} from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Define reactividad para determinar si estamos en la página principal
const bell = computed(() => route.path === '/')
const back = computed(() => route.path === '/')
</script>

<style scoped>
.header-border {
  border-bottom: 3px solid #000;
}
p {
  font-weight: 450;
  color: #000000;
  font-size: 1.1rem;
}
</style>
