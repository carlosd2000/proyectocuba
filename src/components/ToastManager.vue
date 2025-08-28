<script setup>
import { computed } from 'vue'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()

const wrapperPosition = computed(() => {
  return toastStore.toasts[0]?.position || 'bottom'
})

const toastClasses = (type) => {
  return {
    'toast-container': true,
    'error': type === 'error',
    'success': type === 'success',
    'info': type === 'info'
  }
}
const handleClose = (id) => {
  console.log('Cerrando toast:', id)
  toastStore.removeToast(id)
}
</script>

<template>
  <div class="toast-wrapper d-flex justify-content-center" :class="wrapperPosition">
    <div 
      v-for="(toast, index) in toastStore.toasts" 
      :key="index"
      :class="toastClasses(toast.type)"
    >
      <div class="toast show d-flex justify-content-center">
        <div class="toast-content" :style="{ height: toast.type === 'double-message' ? 'auto' : '56px' }">
          <img 
            :src="toast.icon" 
            alt=""
            v-if="toast.icon"
          />
          <div v-if="!toast.type === 'double-message'">
            <h5 class="body-bold">
              {{ toast.message }}
            </h5>
          </div>
          <div v-else class="d-flex flex-column align-items-start gap-1">
            <h5 class="body-bold">{{ toast.message.split('!!')[0] }}</h5>
            <h5 class="small">{{ toast.message.split('!!')[1] }}</h5>
          </div>
          <button type="button" class="btn btn-close-black" @click.stop="handleClose(toast.id)">
            <img src="../assets/icons/Cerrar.svg" alt="">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-wrapper {
  position: fixed;
  left: 270;

  width: 100%;
  z-index: 9999;
  pointer-events: none;
}
.toast-wrapper.top{
  bottom: 170px;
}
.toast-wrapper.bottom{
  bottom: 80px;
}

.toast-container {
  max-width: 500px;
  width: 100%;
  padding: 12px;
  transition: all 0.3s ease;
}

.toast {
  height: 100%;
  width: 100%;
  border: none;
  background-color: transparent;
  border-radius: 12px;
}

.toast-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  gap: 24px;
  width: 100%;
  background: #E0E0F8;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  z-index: 4;
  pointer-events: auto;
}
</style>