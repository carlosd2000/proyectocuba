<template>
    <div class="tabs-container d-flex flex-row justify-content-center align-items-center w-100">
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">$999999</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Coin.svg" alt="">
                <h5 class="small">Bruto</h5>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">$000</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Star.svg" alt="">
                <h5 class="small">Premios</h5>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">$000</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Ganancia.svg" alt="">
                <h5 class="small">Neto</h5>
            </div>
        </div>
    </div>
</template>
<style scoped>
.small{
    color: #696974;
}
p{
    padding: 0px;
    margin: 1px;
    font-size: 0.9rem;
}
.tabs-container {
    padding: 8px 0px;
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