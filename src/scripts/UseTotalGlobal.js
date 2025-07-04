    import { db } from '@/firebase/config'
    import { collection, getDocs, query, where } from 'firebase/firestore'
    import { useAuthStore } from '@/stores/authStore'
    import { ref } from 'vue'
    import { AuthService } from '../firebase/auth'

    export function useTotalGlobal() {
    const totalGlobal = ref(0)
    const isLoading = ref(true)
    const error = ref(null)

    // Suma apuestas del día actual, filtrando por horario si se pasa como parámetro
    const fetchTotalGlobal = async (horario = null) => {
        try {
        isLoading.value = true
        error.value = null
        const authStore = useAuthStore()
        const bancoId = authStore.profile?.bancoId || authStore.profile?.idBancoPadre || authStore.profile?.creadorId
        const listeroId = authStore.userId
        if (!bancoId || !listeroId) {
            totalGlobal.value = 0
            return
        }
        const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`)
        // Rango de hoy en milisegundos
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const startOfDay = now.getTime()
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000

        let q
        if (horario) {
            q = query(
            apuestasRef,
            where('id_listero', '==', listeroId),
            where('horario', '==', horario),
            where('timestampLocal', '>=', startOfDay),
            where('timestampLocal', '<', endOfDay)
            )
        } else {
            q = query(
            apuestasRef,
            where('id_listero', '==', listeroId),
            where('timestampLocal', '>=', startOfDay),
            where('timestampLocal', '<', endOfDay)
            )
        }

        const snapshot = await getDocs(q)
        console.log('UID buscado:', listeroId)
        console.log('BancoId:', bancoId)
        console.log('startOfDay:', startOfDay, 'endOfDay:', endOfDay)
        console.log('Apuestas encontradas:', snapshot.size)
        snapshot.forEach(doc => {
            console.log('Apuesta:', doc.data())
        })
        let total = 0
        snapshot.forEach(doc => {
            const data = doc.data()
            if (typeof data.totalGlobal === 'number') {
            total += data.totalGlobal
            }
        })
        totalGlobal.value = total
        const tipo = authStore.profile?.tipo
        await AuthService.updateUserfondo(listeroId, bancoId, tipo, total)
        } catch (e) {
        error.value = e
        totalGlobal.value = 0
        console.error('Error en fetchTotalGlobal:', e)
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