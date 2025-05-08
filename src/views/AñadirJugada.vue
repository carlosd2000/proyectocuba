<script setup>
import Header from '../components/Header.vue';
import Inputs from '../components/Inputs.vue';
import Horario from '../components/Horario.vue';
import Pagar from '../components/Pagar.vue';
</script>

<template>
    <header>
        <Header/>
    </header>
    <div class="col-12 m-0 p-0">
        <Horario/>
    </div>
    <Inputs/>
    <Pagar/>
</template>

<style scoped>
header{
  height: 7%;
  width: 100%;
}
main {
  min-height: 93%;
  width: 100%;
}
</style>
