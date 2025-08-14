<script setup>
const props = defineProps({
    DataPay: {
        type: Object,
        default: 'Home'
    }
})
</script>
<template>
    <div class="px-3 py-2 d-flex flex-column justify-content-center align-items-center gap-2 w-100" style="background-color: #fdfef2;">
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
            <div class="d-flex flex-column justify-content-center align-items-start w-50">
                <h5 class="input-label">
                    Fijo limitado
                </h5>
                <h5 class="label">
                    ${{ DataPay.montos.Fijo }}
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-end align-items-center gap-1 flex-wrap w-50">
                <div v-for="(numero, index) in DataPay.limitados.Fijo.numeros" :key="index" class="circle-number">
                    {{ numero }}
                </div>
            </div>
        </div>
        <div class="d-flex flex-row justify-content-between align-items-center w-100">
            <h5 class="input-label">
                No juega
            </h5>
        </div>
        <div>

        </div>
        <div>

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
</style>