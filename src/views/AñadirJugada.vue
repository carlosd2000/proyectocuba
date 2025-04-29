<script setup>
import Header from '../components/Header.vue';
import Inputs from '../components/Inputs.vue';
import Horario from '../components/Horario.vue';
import Pagar from '../components/Pagar.vue';
</script>

<template>
  <div class="col-12 m-0 p-0">
      <Header />
      <Horario/>
      
  </div>
  <Inputs/>
  <Pagar/>

</template>

<style scoped>
</style>
