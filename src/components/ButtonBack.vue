<template>
    <div class="m-0 p-0">
      <button class="m-0 p-0 btn border-0 bg-transparent" @click="regresar">
        <i class="bi bi-arrow-left" style="font-size: 1.4rem;"></i>
      </button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const regresar = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'))
  
    if (userProfile && userProfile.uid && userProfile.tipo) {
      router.push(`/${userProfile.tipo}/${userProfile.uid}`)
    } else {
      // Si no hay sesión guardada, envíalo al login
      router.push('/')
    }
  }
  </script>
  