<script setup>
</script>

<template>
    <div class="col-12">
        <div class="col-12 p-0 mt-2 mb-2 d-flex flex-nowrap justify-content-between align-items-center border-bottom border-1 border-dark">
            <p class="title pt-1 pb-1 pe-2 text-truncate">Jugada diaria</p>
            <button class="btn btn-light m-0 p-0 flex-shrink-0">
                <i class="bi bi-chevron-down"></i>
            </button>
        </div>
        <div class="col-12 p-0 mt-2 mb-2 d-flex flex-nowrap align-items-center justify-content-between">
            <div class="col-5 m-0 p-0 d-flex flex-nowrap align-items-center">
                <p class="">Dia a dia</p>
                <button class="btn btn-light m-0 p-1 ml-1">
                    <i class="bi bi-chevron-down"></i>
                </button>
            </div>
            <div class="col-7 m-0 p-0 d-flex justify-content-end">
                <p class="pe-2 text-truncate">$20,000,000.00</p>
            </div>
        </div>
        <div class="col-12 row p-0 m-0 mt-1 mb-1">
            <div class="col-3 p-0">
                <button class="border-0 m-2">
                    <i class="bi bi-plus-lg"></i>
                    <p>Añadir Jugada</p>
                </button>
            </div>
            <div class="col-3 p-0">
                <button class="border-0 m-2">
                    <i class="bi bi-plus-lg"></i>
                    <p>Añadir Parlet</p>
                </button>
            </div>
            <div class="col-3 p-0">
                <button class="border-0 m-2">
                    <i class="bi bi-plus-lg"></i>
                    <p>Añadir Candado</p>
                </button>
            </div>
            <div class="col-3 p-0">
                <button class="border-0 m-2">
                    <img src="/plus.svg" alt="">
                    <p>Añadir Centena</p>
                </button>
            </div>
        </div>
        <div class="col-12 row p-0 m-0 d-flex justify-content-center">
            <button class="col-12 row d-flex justify-content-center">
                <p>lista</p>
                <i class="bi bi-card-list"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.title {
    font-weight: 700;
    color: #000000;
}
p{
    padding: 0px;
    margin: 1px;
}
</style>
