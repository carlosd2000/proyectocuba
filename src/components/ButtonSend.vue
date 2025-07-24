<script setup>
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click'])

function handleClick() {
    if (!props.disabled) {
        emit('click')
    }
}
</script>
<template>
    <div class="button-send" :class="props.disabled ? 'disabled' : 'enabled'" @click="handleClick">
        <h5 class="label" :class="props.disabled ? 'disabled' : 'enabled'">
            {{ title }}
        </h5>
    </div>
</template>
<style scoped>
.button-send {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px;
    gap: 10px;
    width: 100%;
    height: 48px;
    border-radius: 30px;
    flex: none;
    align-self: stretch;
    flex-grow: 0;
}
.enabled {
    background: #6665DD;
    color: #FFFFFF;
}
.disabled {
    background: #E0E0F8;
    color: #C2C1F1;
    cursor: not-allowed;
}
</style>