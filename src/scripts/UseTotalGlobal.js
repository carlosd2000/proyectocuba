    import { db } from '@/firebase/config'
    import { collection, getDocs, query, where } from 'firebase/firestore'
    import { useAuthStore } from '@/stores/authStore'
    import { ref } from 'vue'

    export function useTotalGlobal() {
    const totalGlobal = ref(0)
    const isLoading = ref(true)
    const error = ref(null)

    const fetchTotalGlobal = async () => {
        try {
        isLoading.value = true
        error.value = null
        const authStore = useAuthStore()
        const bancoId = authStore.profile?.bancoId || authStore.profile?.idBancoPadre || authStore.profile?.creadorId
        const listeroId = authStore.userId // UID del usuario autenticado
        if (!bancoId || !listeroId) {
            totalGlobal.value = 0
            return
        }
        // Consulta solo las apuestas de este listero
        const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`)
        const q = query(apuestasRef, where('id_listero', '==', listeroId))
        const snapshot = await getDocs(q)

        let total = 0
        snapshot.forEach(doc => {
            const data = doc.data()
            if (typeof data.totalGlobal === 'number') {
            total += data.totalGlobal
            }
        })
        totalGlobal.value = total
        } catch (e) {
        error.value = e
        totalGlobal.value = 0
        } finally {
        isLoading.value = false
        }
    }

    return {
        totalGlobal,
        isLoading,
        error,
        fetchTotalGlobal
    }
} 