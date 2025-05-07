<script setup>
import Header from '../components/Header.vue';
import inputcentena from '../components/inputcentena.vue';
import Horario from '../components/Horario.vue';
import Pagar from '../components/Pagar.vue';
import Inputcentena from '../components/inputcentena.vue';
</script>

<template>
    <div class="col-12 m-0 p-0">
        <Header />
        <Horario/>
    </div>
    <Inputcentena/>
    <Pagar/>
</template>

<style scoped>
</style>
