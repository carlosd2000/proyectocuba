<template>
  <div @click="regresar" class="px-1">
    <img src="../assets/icons/Chevron_left_alt.svg" alt="">
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute() 
const authStore = useAuthStore()

const regresar = () => {
  if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
    if (route.path.startsWith('/configpayments')) { // Usar route.path en lugar de path
      router.push(`/payments/${authStore.userId}`)
    } else {
      router.push(`/home/${authStore.userId}`)
    }
  } else {
    router.push('/')
  }
}
</script>