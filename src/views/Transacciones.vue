<script setup>
import Header from '../components/Header.vue';
import Valores from '../components/Valores.vue';
import ListaMovimientos from '../components/ListaMovimientos.vue';
import Footer from '../components/Footer.vue';
</script>
<template>
        <header>
            <Header/>
        </header>

        <main class="m-0 p-0">
            <div class="m-0 p-0 header-main">
                <Valores/>
            </div>
            <div class="m-0 p-0">
                <div class="row p-0 px-2 container-botones justify-content-between align-items-center">
                    <div></div>
                    <p>Movimiento</p>
                    <p>Monto</p>
                    <i class="bi bi-filter"></i>
                </div>
            </div>
            <div class="continer-lista p-0 px-2">
                <ListaMovimientos/>
            </div>
        </main>
        <div class="p-0 footer">
            <Footer/>
        </div>
</template>
<style scoped>
    .layout {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }
    header{
        height: 7%;
        width: 100%;
        
    }
    main{
        background-color: #f1f1f1;
    }
    h5{
        margin: 0;
        padding: 0;
        font-size: 0.7rem;
    }
    p{
        margin: 0;
        padding: 0;
        font-size: 0.6rem;
    }
    i{
        margin: 0px;
        font-size: 1.2rem;
        text-shadow: 0 0 1.0px #000;
    }
    .continer-lista {
        padding: 0.5rem;
        overflow-y: auto; /* Permite scroll si hay contenido que sobrepasa */
        height: calc(100vh - 102px); /* Ajusta la altura para que no se superponga con el header y footer */
    }
    .container-botones {
        max-width: 400px;
        margin: auto;
    }
    .header-main {
        max-height: 102px;
        position: relative; /* Agregado */
        z-index: 10; 
    }
    .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        background-color: #f8f9fa;
        border-top: 1px solid #dee2e6;
    }
</style>