<template>
  <div class="container-login d-flex flex-column align-items-center justify-content-center">
    <div class="col-10 m-0 mt-2 p-3 d-flex flex-column align-items-center justify-content-center box-shadow">
      <h3>Vista de {{ vistaNombre }}</h3>
      <main class="p-0 pb-1">
        <div class="col-12 row m-0 p-3">
          <button
            class="col-12 btn my-1 p-0 btn-page"
            @click="$router.push(rutaRegistrar)"
          >
            {{ textoRegistrar }}
          </button>
          <button
            class="col-12 btn my-1 p-0 btn-page"
            @click="$router.push(`/patherlist/${userId}`)"
          >
            Ver Bancos
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userProfile = ref(null)
const userId = ref(null) // Nuevo ref para el ID de usuario

onMounted(() => {
  const saved = localStorage.getItem('userProfile')
  if (saved) {
    userProfile.value = JSON.parse(saved)
  }
  
  // Obtener el ID de usuario de la ruta
  userId.value = route.params.userId
  
  // Si no está en la ruta, intentar obtenerlo del perfil
  if (!userId.value && userProfile.value?.uid) {
    userId.value = userProfile.value.uid
  }
})

// Computed para nombre de la vista
const vistaNombre = computed(() => {
  const tipo = userProfile.value?.tipo
  if (tipo === 'admin') return 'Admin'
  if (tipo === 'bancos') return 'Banco'
  if (tipo === 'colectores') return 'Colector'
  return 'Usuario'
})

// Computed para texto del botón
const textoRegistrar = computed(() => {
  const tipo = userProfile.value?.tipo
  if (tipo === 'admin') return 'Registrar Banco'
  if (tipo === 'bancos') return 'Registrar Colector/Listero'
  if (tipo === 'colectores') return 'Registrar Listero'
  return 'Registrar'
})

// Computed para ruta de registro
const rutaRegistrar = computed(() => {
  const tipo = userProfile.value?.tipo
  if (tipo === 'admin') return `/admin/${userId.value}`
  if (tipo === 'bancos') return `/bancos/${userId.value}`
  if (tipo === 'colectores') return `/colectores/${userId.value}`
  return '/'
})
</script>

<style scoped>
.box-shadow {
  border-radius: 6px;
  border: 2px solid #000000;
  background-color: #f4f4f4;
  box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.853);
}
</style>