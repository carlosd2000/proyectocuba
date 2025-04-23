<script setup>

</script>

<template>
    <div class="col-12 mt-2 mb-3">
        <div class="col-12 p-0 mt-2 mb-2 d-flex flex-nowrap justify-content-between align-items-center border-bottom border-1 border-dark">
            <p class="title pt-1 pb-1 pe-2 text-truncate">Jugada diaria</p>
            <button class="btn btn-light m-0 p-0 flex-shrink-0 bg-transparent">
                <i class="bi bi-chevron-down"></i>
            </button>
        </div>
        <div class="col-12 p-0 mt-2 d-flex flex-nowrap align-items-center justify-content-between">
            <div class="col-5 m-0 p-0 d-flex flex-nowrap align-items-center">
                <p class="">Dia</p>
                <button class="btn btn-light m-0 p-1 ml-1 bg-transparent">
                    <i class="bi bi-chevron-down"></i>
                </button>
            </div>
            <div class="col-7 m-0 p-0 d-flex justify-content-end">
                <p class="pe-2 text-truncate">$20,000,000.00</p>
            </div>
        </div>
        <div class="col-12 row p-0 m-0 d-flex justify-content-around align-items-center">
            <div class="col-3 buttons-heith">
                <button class="w-100 btn border-0 d-flex flex-column align-items-center justify-content-center py-1" @click="$router.push('/anadirjugada')">
                    <i class="bi bi-plus-lg"></i>
                    <span class="text-center">Añadir<br>Jugada</span>
                </button>
            </div>
            <div class="col-3 buttons-heith">
                <button class="w-100 btn border-0 d-flex flex-column align-items-center justify-content-center py-1" @click="$router.push('/parlet')">
                    <i class="bi bi-plus-lg"></i>
                    <span class="text-center">Añadir<br>Parlet</span>
                </button>
            </div>
            <div class="col-3 buttons-heith">
                <button class="w-100 btn border-0 d-flex flex-column align-items-center justify-content-center py-1">
                    <i class="bi bi-plus-lg"></i>
                    <span class="text-center">Añadir<br>Candado</span>
                </button>
            </div>
            <div class="col-3 buttons-heith">
                <button class="w-100 btn border-0 d-flex flex-column align-items-center justify-content-center py-1">
                    <i class="bi bi-plus-lg"></i>
                    <span class="text-center">Añadir<br>Centena</span>
                </button>
            </div>
        </div>
        <div class="col-12 p-0 m-0 mt-1 mb-2 d-flex justify-content-center">
            <button class="col-12 row p-1 bg-warning btn-list" @click="$router.push('/listas')">
                <p class="m-1">Lista</p>
                <i class="bi bi-card-list m-1"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.title {
    font-weight: 700;
    color: #000000;
}
.buttons-heith {
    margin: 0px;
    padding: 0px;
    height: 100%;
    width: 100px;
    transform: scale(0.9);
}
.btn-list{
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
    background-color: #ffc107; /* Color original */
    color: #000000; /* Texto negro */
}

.btn-list:active {
    background-color: #ffffff; /* Fondo blanco */
    color: #000000; /* Texto negro */
}
p{
    padding: 0px;
    margin: 1px;
}
span {
    font-size: 0.8rem;
}
i{
    font-size: 1.5rem;
}
button {
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
