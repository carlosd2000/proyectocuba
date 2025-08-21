<script setup>
const props = defineProps({
    DataPay: {
        type: Object,
        default: 'Home'
    }
})
</script>
<template>
    <div class="px-3 py-2 pt-3 d-flex flex-column justify-content-center align-items-center w-100" style="background-color: #fdfef2; gap: 12px;">
        <div v-if="DataPay.limitados.Fijo.numeros.length" class="d-flex flex-row justify-content-between align-items-start w-100">
            <div class="d-flex flex-column justify-content-center align-items-start w-50">
                <h5 class="input-label">
                    Fijo limitado
                </h5>
                <h5 class="label">
                    ${{ DataPay.limitados.Fijo.monto }}
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.limitados.Fijo.numeros" :key="index" class="circle-number">
                    <h5 class="small">
                        {{ numero }}
                    </h5>
                </div>
            </div>
        </div>
        <div v-if="DataPay.noJuega.Fijo.numeros.length" class="d-flex flex-row justify-content-between align-items-center w-100">
            <h5 class="input-label">
                No juega
            </h5>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.noJuega.Fijo.numeros" :key="index" class="circle-number">
                    <h5 class="small">
                        {{ numero }}
                    </h5>
                </div>
            </div>
        </div>
        <div v-if="DataPay.noJuega.Fijo.numeros.length && (DataPay.limitados.Corrido.numeros.length || DataPay.limitados.Parlet.numeros.length)" class="line"></div>
        <div v-if="DataPay.limitados.Corrido.numeros.length" class="d-flex flex-row justify-content-between align-items-start w-100">
            <div class="d-flex flex-column justify-content-center align-items-start w-50">
                <h5 class="input-label">
                    Corrido limitado
                </h5>
                <h5 class="label">
                    ${{ DataPay.limitados.Corrido.monto }}
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.limitados.Corrido.numeros" :key="index" class="circle-number">
                    <h5 class="small">
                        {{ numero }}
                    </h5>
                </div>
            </div>
        </div>
        <div v-if="DataPay.noJuega.Corrido.numeros.length" class="d-flex flex-row justify-content-between align-items-center w-100">
            <h5 class="input-label">
                No juega
            </h5>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.noJuega.Corrido.numeros" :key="index" class="circle-number">
                    <h5 class="small">
                        {{ numero }}
                    </h5>
                </div>
            </div>
        </div>
        <div v-if="DataPay.limitados.Parlet.numeros.length && (DataPay.limitados.Corrido.numeros.length || DataPay.noJuega.Parlet.numeros.length)" class="line"></div>
        <div v-if="DataPay.limitados.Parlet.numeros.length" class="d-flex flex-row justify-content-between align-items-start w-100">
            <div class="d-flex flex-column justify-content-center align-items-start w-50">
                <h5 class="input-label">
                    Parlet limitado
                </h5>
                <h5 class="label">
                    ${{ DataPay.limitados.Parlet.monto }}
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.limitados.Parlet.numeros" :key="index" class="circle-number-parlet">
                    <h5 class="small">
                        {{ numero[0] }} - {{ numero[1] }}
                    </h5>
                </div>
            </div>
        </div>
        <div v-if="DataPay.noJuega.Parlet.numeros.length" class="d-flex flex-row justify-content-between align-items-center w-100">
            <h5 class="input-label">
                No juega
            </h5>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.noJuega.Parlet.numeros" :key="index" class="circle-number-parlet">
                    <h5 class="small">
                        {{ numero[0] }} - {{ numero[1] }}
                    </h5>
                </div>
            </div>
        </div>
        <div v-if="DataPay.boteActivo" class="d-flex flex-column justify-content-center align-items-center w-100" style="gap: 12px;">
            <div class="line"></div>
            <div class="py-1 d-flex flex-row justify-content-between align-items-center w-100">
                <h5 class="body-bold">
                    Bote
                </h5>
                <h5 class="body-bold" :class="DataPay.boteActivo ? 'green' : 'red'">
                    {{ DataPay.boteActivo ? 'Activo' : 'Inactivo' }}
                </h5>
            </div>
            <div class="line"></div>
            <div class="d-flex flex-row justify-content-between align-items-center w-100">
                <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
                    <h5 class="body-bold">
                        ${{ DataPay.boteMonto.Fijo }}
                    </h5>
                    <h5 class="small small-gray">
                        Fijo
                    </h5>
                </div>
                <div class="line-horizontal"></div>
                <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
                    <h5 class="body-bold">
                        ${{ DataPay.boteMonto.Corrido }}
                    </h5>
                    <h5 class="small small-gray">
                        Corrido
                    </h5>
                </div>
                <div class="line-horizontal"></div>
                <div class="d-flex flex-column justify-content-center align-items-center gap-1 w-100">
                    <h5 class="body-bold">
                        ${{ DataPay.boteMonto.Parlet }}
                    </h5>
                    <h5 class="small small-gray">
                        Parlet
                    </h5>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.circle-number{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    gap: 10px;
    width: 36px;
    height: 36px;
    background: #F3F3F3;
    border: 1px solid #F3F3F3;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
}
.circle-number-parlet{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    gap: 10px;
    width: auto;
    height: 36px;
    background: #F3F3F3;
    border: 1px solid #F3F3F3;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
}
.line{
    width: 100%;
    height: 2px;
    border: 1px solid #F0F0FC;
    flex: none;
    flex-grow: 0;
}
.line-horizontal{
    width: 36px;
    height: 2px;
    border: 1px solid #F0F0FC;
    transform: rotate(90deg);
    flex: none;
    flex-grow: 0;
}
.green{
    color: #55B938;
}
.red{
    color: #FF0000;
}
.small-gray{
    color: #696974;
}
</style>