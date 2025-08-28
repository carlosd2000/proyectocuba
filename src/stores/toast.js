import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    const showToast = (message, type = 'info', duration = 3000, icon = null, position = 'bottom') => {
        const toast = { 
            id: Date.now(),
            message, 
            type, 
            icon,
            position,
            visible: true,
        }
        toasts.value.push(toast)
        
        if (duration > 0) {
            setTimeout(() => {
                removeToast(toast.id)
            }, duration)
        }
        
        return toast.id
    }
    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }
    return { 
        toasts,
        showToast,
        removeToast
    }
})