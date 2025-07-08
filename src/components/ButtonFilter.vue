<script setup>
import { ref } from 'vue'

const activeModal = ref(false)
const filterSelectedOption = ref("Todas")
const typeSelectedOption = ref("Todas")
const tiroSelectedOption = ref("Todas")
const isButtonDisabled = ref(true)

function handleClick() {
    console.log('click')
    activeModal.value = true
}
function filterSelected(option) {
    filterSelectedOption.value = option
}
function typeSelected(option) {
    typeSelectedOption.value = option
}
function tiroSelected(option) {
    tiroSelectedOption.value = option
}
</script>
<template>
    <div class="ButtonFilter d-flex flex-row justify-content-center align-items-center" @click="handleClick()">
        <img src="../assets/icons/Filtro.svg" alt="">
        <h5 class="body text-white">
            Filtrar
        </h5>
    </div>
    <div v-if="activeModal" class="container-modal w-100 h-100 bg-transparent">
        <div class="container-modal-content d-flex flex-column justify-content-center align-items-center w-100">
            <div class="d-flex flex-row justify-content-between align-items-center w-100">
                <h2>
                    Filtrar
                </h2>
                <img src="../assets/icons/Cerrar.svg" alt="" @click="activeModal = false">
            </div>
            <div class="d-flex flex-column gap-3">
                <div class="d-flex flex-row justify-content-start align-items-center gap-3">
                    <img src="../assets/icons/Calendario.svg" alt="">
                    <h3>
                        Fechas
                    </h3>
                </div>
                <div class="d-flex flex-row justify-content-start align-items-center">
                    <h5 class="body">
                        Selecciona o personaliza un rango de tiempo
                    </h5>
                </div>
                <div class="container p-0 d-flex flex-row gap-2">
                    <button class="fecha btn" @click="filterSelected('Todas')" :class="{ activo: filterSelectedOption === 'Todas' }">
                        <h5 class="body">
                            Todas
                        </h5>
                    </button>
                    <button class="fecha btn" @click="filterSelected('Hoy')" :class="{ activo: filterSelectedOption === 'Hoy' }">
                        <h5 class="body">
                            Hoy
                        </h5>
                    </button>
                    <button class="fecha btn" @click="filterSelected('7 dias')" :class="{ activo: filterSelectedOption === '7 dias' }">
                        <h5 class="body">
                            7 dias
                        </h5>
                    </button>
                    <button class="fecha btn" @click="filterSelected('30 dias')" :class="{ activo: filterSelectedOption === '30 dias' }">
                        <h5 class="body">
                            30 dias
                        </h5>
                    </button>
                </div>
                <div class="container-calendar d-flex flex-row justify-content-between align-items-center gap-3">
                    <img src="../assets/icons/Calendario.svg" alt="">
                    <div class="d-flex flex-column align-items-start w-100">
                        <h5 class="small">
                            Desde
                        </h5>
                        <input class="body bg-transparent border-0" type="date" ref="fechaDesde" @click="$refs.fechaDesde.showPicker()" style="max-width: 88px;"/>
                    </div>
                    <img src="../assets/icons/Chevron_right.svg" alt="">
                    <div class="d-flex flex-column align-items-start w-100">
                        <h5 class="small">
                            Hasta
                        </h5>
                        <input class="body bg-transparent border-0" type="date" ref="fechaHasta" @click="$refs.fechaHasta.showPicker()" style="max-width: 88px;"/>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column gap-3">
                <div class="d-flex flex-row justify-content-start align-items-center gap-3">
                    <img src="../assets/icons/Transferir.svg" alt="">
                    <h3>
                        Tipo de movimientos
                    </h3>
                </div>
                <div class="d-flex flex-row justify-content-start align-items-center">
                    <h5 class="body">
                        Filtra transacciones por movimientos
                    </h5>
                </div>
                <div class="container p-0 d-flex flex-row gap-2">
                    <button class="tipo btn" @click="typeSelected('Todas')" :class="{ activo: typeSelectedOption === 'Todas' }">
                        <img src="../assets/icons/Lista2.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Todas
                        </h5>
                    </button>
                    <button class="tipo btn" @click="typeSelected('Lista')" :class="{ activo: typeSelectedOption === 'Lista' }">
                        <img src="../assets/icons/Lista.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Lista
                        </h5>
                    </button>
                    <button class="tipo btn" @click="typeSelected('Ganancias')" :class="{ activo: typeSelectedOption === 'Ganancias' }">
                        <img src="../assets/icons/Ganancia.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Ganancias
                        </h5>
                    </button>
                    <button class="tipo btn" @click="typeSelected('Colector')" :class="{ activo: typeSelectedOption === 'Colector' }">
                        <img src="../assets/icons/Deposito.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Colector
                        </h5>
                    </button>
                </div>
            </div>
            <div class="d-flex flex-column gap-3">
                <div class="d-flex flex-row justify-content-start align-items-center gap-3">
                    <img src="../assets/icons/Coin.svg" alt="">
                    <h3>
                        Tiros
                    </h3>
                </div>
                <div class="d-flex flex-row justify-content-start align-items-center">
                    <h5 class="body">
                        Filtra transacciones por tiros
                    </h5>
                </div>
                <div class="container p-0 d-flex flex-row gap-2">
                    <button class="tipo btn" @click="tiroSelected('Todas')" :class="{ activo: tiroSelectedOption === 'Todas' }">
                        <img src="../assets/icons/Todos.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Todas
                        </h5>
                    </button>
                    <button class="tipo btn" @click="tiroSelected('Dia')" :class="{ activo: tiroSelectedOption === 'Dia' }">
                        <img src="../assets/icons/Dia.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Dia
                        </h5>
                    </button>
                    <button class="tipo btn" @click="tiroSelected('Tarde')" :class="{ activo: tiroSelectedOption === 'Tarde' }">
                        <img src="../assets/icons/Atardecer.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Tarde
                        </h5>
                    </button>
                    <button class="tipo btn" @click="tiroSelected('Noche')" :class="{ activo: tiroSelectedOption === 'Noche' }">
                        <img src="../assets/icons/Luna.svg" alt="" width="20px">
                        <h5 class="navigation-label">
                            Noche
                        </h5>
                    </button>
                </div>
            </div>
            <div class="button-aplicar" :class="{ 'disabled': isButtonDisabled }">
                <h5 class="label text-white">
                    Aplicar Filtros
                </h5>
            </div>
        </div>
    </div>
</template>
<style scoped>
.container-modal{
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}
.container-modal-content{
    padding: 24px 20px 32px;
    gap: 24px;
    top: 88px;
    background: #F8FBFE;
    box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    flex: none;
    order: 6;
    flex-grow: 0;
    z-index: 6;
}
button.fecha{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px 8px;
    gap: 12px;
    width: 69.75px;
    height: 48px;
    border-radius: 12px;
    flex: none;
    order: 0;
    flex-grow: 0;
}
button.tipo{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    gap: 4px;
    width: 69.75px;
    height: 48px;
    border-radius: 12px;
    flex: none;
    order: 0;
    flex-grow: 0;
}
.button-aplicar{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 8px 8px 16px;
    gap: 10px;
    height: 48px;
    border-radius: 30px;
    background: #6665DD;
    flex: none;
    order: 4;
    align-self: stretch;
    flex-grow: 0;
}
.button-aplicar.disabled{
    background: #C2C1F1;
    cursor: not-allowed;
}
.container-calendar{
    box-sizing: border-box;
    padding: 8px 12px 8px 16px;
    gap: 12px;
    height: 48px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    flex: none;
    order: 3;
    flex-grow: 0;
}
.ButtonFilter {
    padding: 2px 16px;
    gap: 8px;
    height: 36px;
    width: auto;
    background: #6665DD;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
    cursor: pointer;
}
.btn.activo{
    background: #6665DD;
}
.btn.activo h5{
    color: #FFFFFF;
}
.btn.activo img{
    filter: brightness(0) invert(1);
}
h5.small{
    color: #696974;
}
input.body{
    color: #CDCDD1;
}
input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0;
    cursor: pointer;
}

</style>
