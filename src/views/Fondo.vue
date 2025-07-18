<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import CardPrice from '../components/CardPrice.vue'
import ButtonFilter from '../components/ButtonFilter.vue';
import ListaMovimientos from '../components/ListaMovimientos.vue';
import { UserDataService } from '@/scripts/userDataService';
import { useAuthStore } from '@/stores/authStore'
import WalletService from '@/firebase/walletService';

const authStore = useAuthStore()
const isLoading = ref(true)
const error = ref(null)
const userfondo = ref(0)
const walletData = ref(null)
const showDetails = ref(false)
const typeViewOption = ref('movimientos')
const movimientos = ref([])

const unsubscribe = ref(null)

function handleShowDetails(newValue) {
  showDetails.value = newValue
}

function typeView(option) {
  typeViewOption.value = option
  
}

onMounted(async () => {
  try {
    if (authStore.isAuthenticated && !authStore.profile) {
      await authStore.loadUserProfile()
    }
    
    // Función para actualizar los datos
    const updateUserData = async (userData) => {
      if (userData && authStore.profile) {
        // Obtener datos de la wallet
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
        }
      } else {
        console.log("Usuario cerró sesión");
        userfondo.value = 0
        walletData.value = null
        movimientos.value = []
      }
    };
    
    // Cargar datos iniciales
    await updateUserData(authStore.profile)
    
    // Escuchar cambios
    unsubscribe.value = UserDataService.onAuthStateChanged(updateUserData);

    
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
    <div v-if="showDetails" class="degradado-overlay"></div>
    <main class="container-main">
      <CardPrice :price="userfondo" @update:showDetails="handleShowDetails"/>
      <div class="pb-2 border-bottom">
        <div v-if="authStore.userType !== 'listeros'" class="p-2 d-flex flex-row justify-content-center align-items-center gap-3 w-100">
          <div class="d-flex align-items-center gap-2" @click="typeView('movimientos')">
            <img src="../assets/icons/Transferir.svg" alt="" width="20" :class="typeViewOption === 'movimientos' ? 'active' : 'inactive'">
            <h5 class="body2" :class="typeViewOption === 'movimientos' ? 'active' : 'inactive'">
              Movimientos
            </h5>
          </div>
          <div class="line"></div>
          <div class="d-flex align-items-center gap-2" @click="typeView('colaboradores')">
            <img src="../assets/icons/User.svg" alt="" width="20" :class="typeViewOption === 'colaboradores' ? 'active' : 'inactive'">
            <h5 class="body2" :class="typeViewOption === 'colaboradores' ? 'active' : 'inactive'">
              Colaboradores
            </h5>
          </div>
        </div>
      </div>
      <div class="row" style="max-width: 400px; width: 100%;">
        <ButtonFilter/>
      </div>
      <div class="d-flex flex-column align-items-center w-100 h-100 overflow-y-auto">
        <ListaMovimientos :movimientos="movimientos"/>
      </div>
    </main>
    <footer>
      <Footer title="Fondo"/>
    </footer>
  </div>
</template>

<style scoped>
.container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px 24px 16px;
  gap: 16px;
  width: 100%;
  height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
}
.degradado-overlay {
  position: absolute;
  bottom: 88px; /* altura de tu header, ajústalo si es diferente */
  left: 0;
  width: 100%;
  height: calc(100vh - 7% - 88px); /* 60px si tu footer mide eso, ajusta según sea necesario */
  background: rgba(253, 254, 242, 0.4);
  backdrop-filter: blur(10px);
  z-index: 5;
  pointer-events: none; /* Permite clics en elementos detrás */
}
.line{
  width: 36px;
  height: 2px;
  border: 1px solid #F0F0FC;
  transform: rotate(90deg);
  flex: none;
  flex-grow: 0;
}
img.inactive {
  filter: brightness(0) saturate(100%) invert(52%) sepia(5%) saturate(107%) hue-rotate(202deg) brightness(95%) contrast(86%);
}
h5.active {
  color: #050517;
  font-size: 800;
}
h5.inactive {
  color: #9B9BA2;
  font-size: 300;
}
</style>