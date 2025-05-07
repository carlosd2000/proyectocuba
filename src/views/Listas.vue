<script setup>
import Header from '../components/Header.vue';
import Calendario from '../components/Calendario.vue';
import Results from '../components/results.vue';
import Pestañas from '../components/Pestañas.vue';
</script>

<template>
  <div class="m-0 p-0 h-100">
    <div class="header-main">
      <div>
        <Header />
      </div>
      <div>
        <Calendario/>
      </div>
      <div>
        <Results/>
      </div>
    </div>
    <div class="footer-main">
      <Pestañas/>
    </div>
  </div>



</template>

<style scoped>
.header-main {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 50%;
}
.footer-main {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 50%;
}
</style>
