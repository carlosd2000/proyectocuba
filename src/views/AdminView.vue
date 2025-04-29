<template>
  <div class="container-login d-flex flex-column align-items-center justify-content-center">
    <div class="col-10 m-0 mt-2 p-3 d-flex flex-column align-items-center justify-content-center box-shadow">
      <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push('/')">
        <i class="bi bi-arrow-left" style="font-size: 1.4rem;"></i>
      </button>
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
            @click="$router.push(rutaColaboradores)"
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
const userId = route.params.id

const userProfile = ref(null)

onMounted(() => {
  const saved = localStorage.getItem('userProfile')
  if (saved) {
    userProfile.value = JSON.parse(saved)
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

// Computed para texto del botÃ³n
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
  if (tipo === 'admin') return `/admin/${userId}`
  if (tipo === 'bancos') return `/bancos/${userId}`
  if (tipo === 'colectores') return `/colectores/${userId}`
  return '/'
})
const rutaColaboradores = computed(() => {
  const tipo = userProfile.value?.tipo
  if (tipo === 'admin') return `/patherlist/${userId}`
  //if (tipo === 'bancos') return `/bancos/${userId}`
  //if (tipo === 'colectores') return `/colectores/${userId}`
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
