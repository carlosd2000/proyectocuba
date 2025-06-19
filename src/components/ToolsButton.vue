<script setup>
const props = defineProps({
    title: {
        type: String,
        default: 'Herramientas'
    }
});
</script>
<template>
    <div class="container-tools d-flex justify-content-center align-items-center">
        <div class="d-flex justify-content-between align-items-center w-100">
            <h5 class="small">
                {{ title }}
            </h5>
            <img src="../assets/Chevron_right.svg" alt="">
        </div>
    </div>
</template>
<style scoped>
p{
    margin: 0;
    padding: 0;
}
.container-tools {
    padding: 10px 16px;
    gap: 8px;
    height: 64px;
    background: #F0F0FC;
    border-radius: 12px;
    flex: none;
    order: 3;
    align-self: stretch;
    flex-grow: 0;
}
</style>