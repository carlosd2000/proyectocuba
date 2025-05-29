<script setup>
import Valores from '../components/Valores.vue';
import Footer from '../components/Footer.vue';
</script>
<template>
    <div class="col-12 m-0 p-0">
        <Valores/>
    </div>
    <div>

    </div>
    <div class="col-12 m-0 p-0 footer">
        <Footer/>
    </div>
</template>

<style scoped>
.col-12 {
    padding: 0;
    margin: 0;
}
.footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
}
</style>