<script setup>
import Header from '../components/Header.vue'
import Dailyplay from '../components/Dailyplay.vue'
import Tools from '../components/Tools.vue'
import Horario from '../components/Horario.vue'
</script>

<template>
  <div class="col-12 m-0 p-0">
    <header class="col-12 m-0 p-0">
      <Header/>
    </header>
    <main>
      <div class="col-12 mt-5 border border-dark border-3">
        <dailyplay />
      </div>
      <div class="col-12 border border-dark border-3">
        <tools />
      </div>
      <Horario/>  
    
    </main>
  </div>
</template>
<style scoped>

</style>
