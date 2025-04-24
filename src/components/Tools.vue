<script setup>
</script>

<template>
    <div class="col-12 mt-2 mb-3 p-0">
        <div class="col-12 p-0 mt-2 mb-2 d-flex flex-nowrap justify-content-between align-items-center border-bottom border-1 border-dark">
            <p class="title pt-1 pb-1 pe-2 text-truncate">Herramientas</p>
            <button class="btn btn-light m-0 p-0 flex-shrink-0 bg-transparent">
                <i class="bi bi-chevron-down"></i>
            </button>
        </div>
        <div class="col-12 row p-0 m-0">
            <button class="col-3 justify-content-center buttons-heith">
                <i class="bi bi-clock-history"></i>
                <p>Horario</p>
            </button>
            <button class="col-3 justify-content-center buttons-heith">
                <i class="bi bi-cash-coin"></i>
                <p>Pagos</p>
            </button>
            <button class="col-3 justify-content-center buttons-heith">
                <i class="bi bi-exclamation-triangle"></i>
                <p>Limitados</p>
            </button>
            <button class="col-3 justify-content-center buttons-heith">
                <i class="bi bi-exclamation-triangle"></i>
                <p>Limites</p>
            </button>
            <button class="col-3 justify-content-center buttons-heith">
                <i class="bi bi-8-circle-fill"></i>
                <p>Historico</p>
            </button>
            <button class="col-3 justify-content-center buttons-heith">
                <i class="bi bi-receipt-cutoff"></i>
                <p>Deuda</p>
            </button>
        </div>
        <div class="col-12 row p-0 m-0 mt-2 mb-2 d-flex justify-content-center">
            <button class="col-12 row p-2 d-flex justify-content-center bg-warning btn-colab">
                <p>Colaboradores</p>
                <i class="bi bi-people-fill"></i>
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
.btn-colab{
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
}
p{
    padding: 0px;
    margin: 1px;
    font-size: 0.9rem;
}
button {
    border: none;
    cursor: pointer;
}
</style>
