<script setup>
import Header from '../components/Header.vue';
import Calendario from '../components/Calendario.vue';
import Results from '../components/results.vue';
import Pestañas from '../components/Pestañas.vue';
</script>

<template>
  <div class="col-12 m-0 p-0">
    <div>
      <Header />
    </div>
    <div>
      <Calendario/>
    </div>
    <div class="m-3">
      <Results/>
    </div>
    <div>
      <Pestañas/>
    </div>
  </div>



</template>

<style scoped>
</style>
