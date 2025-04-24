<template>
    <div class="m-0 p-0">
        <button class="m-1 p-0 border-0 bg-transparent" v-if="!firstPage" @click="$router.push('/')">
            <i class="bi bi-arrow-left"></i>
        </button>
    </div>
</template>
<script setup>
import { useRoute} from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Define reactividad para determinar si estamos en la página principal
const firstPage = computed(() => route.path === '/')
</script>