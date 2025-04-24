<script setup>
import Header from '../components/Header.vue'
import Dailyplay from '../components/Dailyplay.vue'
import Tools from '../components/Tools.vue'
</script>

<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <header class="col-12 m-0 p-0 row">
      <Header/>
    </header>
    <main class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
      <div class="col-11 m-3 d-flex justify-content-center box-shadow">
        <dailyplay />
      </div>
      <div class="col-11 m-0 d-flex justify-content-center box-shadow">
        <tools />
      </div>
    </main>
  </div>
</template>
<style scoped>
.box-shadow {
  border-radius: 6px;
  border: 2px solid #000000;
  box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.853);
}
</style>
