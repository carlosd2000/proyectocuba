<script setup>
import Header from '../components/Header.vue';
import Calendario from '../components/Calendario.vue';
import Results from '../components/results.vue';
import Pestañas from '../components/Pestañas.vue';
</script>

<template>
  <div class="m-0 p-0 h-100">
    <header>
      <Header />
    </header>
    <div class="header-main">
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
header{
  height: 7%;
  width: 100%;
}
.header-main {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 20%;
  min-height: 140px;
}
.footer-main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 73%;
  max-height:70%;
}
</style>
