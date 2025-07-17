<script setup>
const props = defineProps({
    title: {
        type: String,
        default: ''
    }
})
</script>
<template>
    <div class="button-black h-100" @click="$router.push(`/transferir/${$route.params.id}`)">
        <img src="../assets/icons/Transferir.svg" alt="" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);">
        <h5 class="navigation-label" style="color: #FDFEF2">
            {{ props.title }}
        </h5>
    </div>
</template>
<style scoped>
.button-black {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8px;
    gap: 4px;
    background: #050517;
    border-radius: 12px;
    flex: none;
    order: 0;
    flex-grow: 1;
}
</style>