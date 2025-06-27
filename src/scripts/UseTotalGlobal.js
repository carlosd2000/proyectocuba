    import { db } from '@/firebase/config'
    import { collection, getDocs } from 'firebase/firestore'
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
        // Asegúrate de obtener el bancoId correcto (puede estar en el perfil)
        const bancoId = authStore.profile?.bancoId || authStore.profile?.idBancoPadre || authStore.profile?.creadorId
        if (!bancoId) {
            totalGlobal.value = 0
            return
        }
        // Busca todas las apuestas en la subcolección del banco
        const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`)
        const snapshot = await getDocs(apuestasRef)

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