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
            <div class="col-3 p-1 buttons-heith">
                <button class="w-100 p-0 px-0 pb-1 py-2 btn border-0 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-clock-history m-0 p-0"></i>
                    <span>Horario</span>
                </button>
            </div>
            <div class="col-3 p-1 buttons-heith">
                <button class="w-100 p-0 px-0 pb-1 py-2 btn border-0 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-cash-coin m-0 p-0"></i>
                    <span>Pagos</span>
                </button>
            </div>
            <div class="col-3 p-1 buttons-heith">
                <button class="w-100 p-0 px-0 pb-1 py-2 btn border-0 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-exclamation-triangle m-0 p-0"></i>
                    <span>Limitados</span>
                </button>
            </div>
            <div class="col-3 p-1 buttons-heith">
                <button class="w-100 p-0 px-0 pb-1 py-2 btn border-0 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-exclamation-triangle m-0 p-0"></i>
                    <span>Limites</span>
                </button>
            </div>
            <div class="col-3 p-1 buttons-heith">
                <button class="w-100 p-0 px-0 pb-1 py-2 btn border-0 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-8-circle-fill m-0 p-0"></i>
                    <span>Historico</span>
                </button>
            </div>
            <div class="col-3 p-1 buttons-heith">
                <button class="w-100 p-0 px-0 pb-1 py-2 btn border-0 d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-receipt-cutoff m-0 p-0"></i>
                    <span>Deuda</span>
                </button>
            </div>
        </div>
        <div class="col-12 row p-0 m-0 mt-0 mb-2 d-flex justify-content-center">
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
    margin: -2px 0px;
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
