<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Header from '../components/Header.vue'
import Dailyplay from '../components/Dailyplay.vue'
import Tools from '../components/Tools.vue'
import Footer from '../components/Footer.vue'
import CardPrice from '../components/CardPrice.vue'
import Modal from '../components/Modal.vue'

const modalType = ref(null) 
const authStore = useAuthStore()

const userType = authStore.userType
</script>

<template>
  <div class="container-login d-flex flex-column align-items-center">
    <header>
      <Header/>
    </header>
    <main class="container-main">
      <CardPrice/>
      <dailyplay moneytime="999"/>
      <div class="line w-100"></div>
      <Tools title="Herramientas" @open-modal="modalType = $event"/>
      <Modal v-if="userType === 'bancos' && modalType" :type="modalType" @cerrar="modalType = null"/>
    </main>
    <footer>
      <Footer title="Home"/>
    </footer>
  </div>
</template>

<style scoped>
.container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px;
  gap: 24px;
  width: 100%;
  height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
  overflow-y: auto;
}
.line{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  height: 4px;
  flex: none;
  flex-grow: 0;
  border-top: 1px solid #CDCDD1;
}
</style>