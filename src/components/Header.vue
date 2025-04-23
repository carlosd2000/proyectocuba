<script setup>
import ButtonBack from '../components/ButtonBack.vue'
</script>

<template>
  <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
    <ButtonBack class=""/>
    <div class="col-4 d-flex justify-content-start align-items-center">
      <p class="m-0 p-1">hh:mm:ss</p>
    </div>
    <div class="col-6 row p-1 m-0 d-flex justify-content-end align-items-center">
      <p class="m-0 p-1">$20,000,000.00</p>
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
