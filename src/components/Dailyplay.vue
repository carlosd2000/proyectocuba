<template>
    <div class="container m-0 p-0 d-flex flex-column align-items-start">
        <div class="m-0 p-0 d-flex justify-content-between align-items-center">
            <p class="title">
                Jugada diaria
            </p>
        </div>
        <div>
            <label class="title">
                {{ wallet }}1100
            </label>
        </div>
        <div class="row p-0 m-0 d-flex justify-content-between w-100">
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=normal`)">
                <img src="../assets/Jugada.svg" alt="" >
                <h5 class="navegation-label">
                    Jugada
                </h5>
            </div>
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=parlet`)">
                <img src="../assets/Parlet.svg" alt="">
                <h5 class="navegation-label">
                    Parlet
                </h5>
            </div>
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=candado`)">
                <img src="../assets/Candado.svg" alt="">
                <h5 class="navegation-label">
                    Candado
                </h5>
            </div>
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=centena`)">
                <img src="../assets/Centena.svg" alt="">
                <h5 class="navegation-label">
                    Centena
                </h5>
            </div>
            <div class="buttons-heith black" @click="$router.push(`/lista/${$route.params.id}`)">
                <img src="../assets/Lista.svg" alt="" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);" >
                <h5 class="navegation-label" style="color: #FDFEF2" >
                    Lista
                </h5>
            </div>
        </div>            
    </div>
</template>

<script setup>
import { useDailyPlay } from '../scripts/DailyPlay.js'

const {
    opciones,
    turnoSeleccionado,
    totalGlobal,
    totalFormateado,
    route,
    router
} = useDailyPlay()
</script>

<style scoped>
.container{
    gap: 16px;
    flex: none;
    order: 1;
    flex-grow: 0;
}
.buttons-heith {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
    gap: 8px;
    width: 62px;
    height: 62px;
    border-radius: 12px;
    flex: none;
    order: 0;
    flex-grow: 0;
}
.black{
    background: #050517;
    color: #FFFFFF;
}
.state-blue{
    background: #F0F0FC;
}

</style>