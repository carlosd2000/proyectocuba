<script setup>
import ButtonBack from '../components/ButtonBack.vue'
</script>

<template>
  <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
    <ButtonBack/>
    <div class="col-3 m-0 p-0 d-flex justify-content-start align-items-center">
      <p class="m-0 p-1">hh:mm:ss</p>
    </div>
    <div class="col-7 row p-1 m-0 d-flex justify-content-end align-items-center">
      <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push('/')">
        <p class="m-0 p-1">$20,000,000.00</p>
      </button>
      
      <div class="col-2 p-2 m-0 d-flex justify-content-end align-items-center">
        <i class="bi bi-bell"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-border {
  border-bottom: 3px solid #000;
}
</style>
