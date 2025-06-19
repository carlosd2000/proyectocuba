<template>
  <div class="m-0 p-0">
    <button class="m-0 p-0 btn border-0 bg-transparent" @click="regresar">
      <img src="../assets/icons/Chevron_left_alt.svg" alt="">
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const regresar = () => {
  if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
    router.push(`/${authStore.userType}/${authStore.userId}`)
  } else {
    router.push('/')
  }
}
</script>