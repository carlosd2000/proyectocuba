<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const userProfile = JSON.parse(localStorage.getItem('userProfile'))
  
  // Redirige solo si hay perfil y está en la raíz
  if (userProfile && window.location.pathname === '/') {
    router.push(`/${userProfile.tipo}/${userProfile.uid}`)
  }
})
</script>

<template>
  <RouterView />
</template>