<script setup>
import { useDailyPlay } from '../scripts/DailyPlay.js'
import SelectorHorario from './SelectorHorario.vue';
import Calendario from './Calendario.vue';

const {
    opciones,
    turnoSeleccionado,
    totalGlobal,
    totalFormateado,
    route,
    router
} = useDailyPlay()

defineProps({
    moneytime: {
        type: String,
        default: '0'
    }
})
</script>

<template>
    <div class="container m-0 p-0 d-flex flex-column align-items-start">
        <div class="d-flex justify-content-between align-items-center w-100" style="height: 36px;">
            <SelectorHorario @update:selected="handleSelect"/>
            <Calendario/>
        </div>
        <div class="m-0 p-0 d-flex justify-content-between align-items-center">
            <h2>
                Jugada Diaria
            </h2>
        </div>
        <div>
            <h5 class="label">
                ${{ moneytime }}
            </h5>
        </div>
        <div class="row p-0 m-0 d-flex justify-content-between w-100">
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=normal`)">
                <img src="../assets/icons/Jugada.svg" alt="" >
                <h5 class="navegation-label">
                    Jugada
                </h5>
            </div>
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=parlet`)">
                <img src="../assets/icons/Parlet.svg" alt="">
                <h5 class="navegation-label">
                    Parlet
                </h5>
            </div>
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=candado`)">
                <img src="../assets/icons/Candado.svg" alt="">
                <h5 class="navegation-label">
                    Candado
                </h5>
            </div>
            <div class="buttons-heith state-blue" @click="$router.push(`/anadirjugada/${$route.params.id}?tipo=centena`)">
                <img src="../assets/icons/Centena.svg" alt="">
                <h5 class="navegation-label">
                    Centena
                </h5>
            </div>
            <div class="buttons-heith black" @click="$router.push(`/lista/${$route.params.id}`)">
                <img src="../assets/icons/Lista.svg" alt="" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);" >
                <h5 class="navegation-label" style="color: #FDFEF2" >
                    Lista
                </h5>
            </div>
        </div>            
    </div>
</template>

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
    gap: 4px;
    width: 62px;
    height: 62px;
    border-radius: 12px;
    flex: none;
    order: 0;
    flex-grow: 0;
}
.label{
    color: #696974;
}
.black{
    background: #050517;
    color: #FFFFFF;
}
.state-blue{
    background: #F0F0FC;
}

</style>