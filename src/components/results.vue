<template>
    <div class="tabs-container d-flex flex-row justify-content-center align-items-center w-100">
        <div class="d-flex flex-column justify-content-center align-items-center w-100">
            <p>999999</p>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/Coin.svg" alt="">
                <p>Bruto</p>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100">
            <p>000</p>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/Star.svg" alt="">
                <p>Premios</p>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100">
            <p>000</p>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/Ganancia.svg" alt="">
                <p>Neto</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
p{
    padding: 0px;
    margin: 1px;
    font-size: 0.9rem;
}
.tabs-container {
    padding: 8px;
    gap: 12px;
    width: 343px;
    flex: none;
    flex-grow: 0;
}
.line{
    width: 36px;
    height: 2px;
    border: 1px solid #F0F0FC;
    transform: rotate(90deg);
    flex: none;
    flex-grow: 0;
}
</style>    