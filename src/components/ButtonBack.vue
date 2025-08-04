<template>
  <div @click="regresar" class="px-1">
    <img src="../assets/icons/Chevron_left_alt.svg" alt="">
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const regresar = () => {
  if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
    router.push(`/home/${authStore.userId}`)
  } else {
    router.push('/')
  }
}
</script>