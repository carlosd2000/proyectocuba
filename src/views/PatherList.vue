<template>
    <div class="container-login mt-3 d-flex flex-column align-items-center justify-content-center">
        <div class="col-10 col-sm-8 py-3 my-3 box-shadow">
            <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push('/')">
              <i class="bi bi-arrow-left" style="font-size: 1.4rem;"></i>
            </button>
            <h2>Lista de Bancos</h2>
            <div v-if="loading">Cargando...</div>
            <div v-else>
                <ul class="list-group" style="max-height: 300px; overflow-y: auto;">
                <li class="list-group-item" v-for="banco in bancos" :key="banco.id">
                    {{ banco.nombre }}
                </li>
                </ul>
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { collection, getDocs } from 'firebase/firestore'
  import { db } from '@/firebase/config' // Ajusta si tienes tu config de Firebase en otra ruta
  
  const bancos = ref([])
  const loading = ref(true)
  
  onMounted(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bancos")) // Aquí 'bancos' es tu colección en Firestore
      bancos.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error al obtener los bancos:', error)
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style scoped>
  /* Estilos si quieres */
  </style>
  