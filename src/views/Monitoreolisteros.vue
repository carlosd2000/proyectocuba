<script setup>
import { ref } from 'vue';
import Header from '../components/Header.vue';
import Valores from '../components/Valores.vue';
import listacolaboradores from '../components/listacolaboradores.vue';
import ListaMovimientos from '../components/ListaMovimientos.vue';
import Footer from '../components/Footer.vue';

const seleccion = ref('colaboradores') 

const banco = ref(
    { id: 1, nombre: 'Banco Central', fondo: 1000000, fondo: 1000000, fondorecaudado: 1000000 }
);

const seleccionar = (opcion) => {
    seleccion.value = opcion
}

// Datos simulados
const listeros = ref([
  { id: 1, nombre: 'Listero A', fondoCobrado: 5000, fondo: 5000 },
  { id: 2, nombre: 'Listero B', fondoCobrado: 7000, fondo: 8000 },
  { id: 3, nombre: 'Listero C', fondoCobrado: -10000, fondo: -10000 },
  { id: 4, nombre: 'Listero D', fondoCobrado: 2000, fondo: 3000 },
  { id: 5, nombre: 'Listero E', fondoCobrado: -1500, fondo: -1500 },
  { id: 6, nombre: 'Listero F', fondoCobrado: 6000, fondo: 6000 },
  { id: 7, nombre: 'Listero G', fondoCobrado: 20000, fondo: 20000 },
  { id: 8, nombre: 'Listero H', fondoCobrado: 0, fondo: 0 },
  { id: 9, nombre: 'Listero I', fondoCobrado: -2000, fondo: -2000 },
  { id: 10, nombre: 'Listero J', fondoCobrado: 10000, fondo: 10000 },
  { id: 11, nombre: 'Listero K', fondoCobrado: 20000, fondo: 20000 },
  { id: 12, nombre: 'Listero L', fondoCobrado: -3000, fondo: -3000 },
  { id: 13, nombre: 'Listero M', fondoCobrado: 4000, fondo: 4000 },
  { id: 14, nombre: 'Listero N', fondoCobrado: 5000, fondo: 5000 },
  { id: 15, nombre: 'Listero O', fondoCobrado: 6000, fondo: 6000 },
  { id: 16, nombre: 'Listero P', fondoCobrado: 7000, fondo: 7000 },
  { id: 17, nombre: 'Listero Q', fondoCobrado: 8000, fondo: 8000 },
  { id: 18, nombre: 'Listero R', fondoCobrado: 9000, fondo: 9000 },
  { id: 19, nombre: 'Listero S', fondoCobrado: 10000, fondo: 10000 },
  { id: 20, nombre: 'Listero T', fondoCobrado: 11000, fondo: 11000 }
])
</script>
<template>
        <header>
            <Header/>
        </header>
        <main class="m-0 p-0">
            <div class="m-0 p-0 header-main">
                <Valores :fondorecaudado="banco.fondorecaudado" :fondo="banco.fondo"/>
            </div>
            <div class="m-0 p-0">
                <div class="col-12 row p-0 container-botones bg-white">
                    <div @click="seleccionar('colaboradores')" :class="{ activo: seleccion === 'colaboradores' }" class="col-6 row m-0 p-0 border justify-content-center align-items-center">
                        <h5 class="text-center">Colaboradores</h5>
                        <i class="bi bi-people-fill mx-2 my-1"></i>
                    </div>
                    <div  @click="seleccionar('movimientos')" :class="{ activo: seleccion === 'movimientos' }" class="col-6 row m-0 p-0 border justify-content-center align-items-center">
                        <h5 class="text-center">Movimientos</h5>
                        <i class="bi bi-arrow-left-right mx-2 my-1"></i>
                    </div>
                </div>
                <div class="row p-0 px-2 container-botones justify-content-between align-items-center">
                    <div></div>
                    <p>Movimiento</p>
                    <p>Monto</p>
                    <i class="bi bi-filter"></i>
                </div>
            </div>
            <div class="continer-lista p-0 px-2">
                <listacolaboradores v-if="seleccion === 'colaboradores'" :listeros="listeros"/>
                <ListaMovimientos v-if="seleccion === 'movimientos'"/>
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
        max-width: 600px;
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
    .activo {
        background-color: #F6F6F6;
    }
</style>