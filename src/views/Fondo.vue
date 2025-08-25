<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { UserDataService } from '@/scripts/userDataService'
import { useAuthStore } from '@/stores/authStore'
import CardPrice from '../components/CardPrice.vue'
import ButtonFilter from '../components/ButtonFilter.vue'
import ListaMovimientos from '../components/ListaMovimientos.vue'
import WalletService from '@/firebase/walletService'
import { GananciasService } from '@/firebase/gananciasService' // Importa el servicio

const authStore = useAuthStore()
const isLoading = ref(true)
const error = ref(null)
const userfondo = ref(0)
const walletData = ref(null)
const movimientos = ref([])
const ganancias = ref([]) // Nuevo ref para ganancias
const unsubscribe = ref(null)

onMounted(async () => {
  try {
    if (authStore.isAuthenticated && !authStore.profile) {
      await authStore.loadUserProfile()
    }
    
    const updateUserData = async () => {
      if (authStore.profile) {
        try {
          const wallet = await WalletService.obtenerWallet(
            authStore.userId, 
            authStore.bancoId
          )
          
          if (wallet) {
            walletData.value = wallet
            userfondo.value = wallet.fondo_recaudado || 0
            
            // Obtener movimientos
            movimientos.value = await WalletService.obtenerMovimientos(
              authStore.userId,
              authStore.bancoId
            )
            
            // Obtener ganancias (nuevo)
            ganancias.value = await GananciasService.obtenerGananciasDiarias(
              authStore.userId,
              authStore.bancoId
            )
          }
        } catch (e) {
          console.log("Error obteniendo datos de wallet:", e)
          movimientos.value = []
          ganancias.value = []
        }
      } else {
        console.log("Usuario cerró sesión")
        userfondo.value = 0
        walletData.value = null
        movimientos.value = []
        ganancias.value = []
      }
    }
    
    await updateUserData()
    unsubscribe.value = UserDataService.onAuthStateChanged(updateUserData)
    
  } catch (e) {
    error.value = "Error cargando datos"
    console.error("Error en Fondo:", e)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (unsubscribe.value) unsubscribe.value()
})
</script>

<template>
  <div class="container-login d-flex flex-column align-items-center">
    <header>
      <Header title="Fondo"/>
    </header>
    <main class="container-main">
      <CardPrice :price="userfondo"/>
      <div class="row" style="max-width: 400px; width: 100%;">
        <ButtonFilter/>
      </div>
      <div class="d-flex flex-column align-items-center w-100 h-100 overflow-y-auto">
        <ListaMovimientos 
          :movimientos="movimientos"
          :ganancias="ganancias"
        />
      </div>
    </main>
    <footer>
      <Footer title="Fondo"/>
    </footer>
  </div>
</template>

<style scoped>
/* Tus estilos se mantienen igual */
.container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px 24px 16px;
  gap: 16px;
  width: 100%;
  height: calc(100vh - 7% - 88px);
}
</style>