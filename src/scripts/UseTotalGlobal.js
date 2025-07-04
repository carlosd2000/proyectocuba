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

            // Consulta para la suma filtrada (por horario si aplica)
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
            let total = 0
            snapshot.forEach(doc => {
                const data = doc.data()
                if (typeof data.totalGlobal === 'number') {
                    total += data.totalGlobal
                }
            })
            totalGlobal.value = total

            // --- NUEVO: Actualiza el fondo SOLO con el total del día (sin filtro de horario) ---
            if (horario !== null) {
                // Solo si el filtro es por horario, actualiza el fondo con el total del día completo
                let qDia = query(
                    apuestasRef,
                    where('id_listero', '==', listeroId),
                    where('timestampLocal', '>=', startOfDay),
                    where('timestampLocal', '<', endOfDay)
                )
                const snapshotDia = await getDocs(qDia)
                let totalDia = 0
                snapshotDia.forEach(doc => {
                    const data = doc.data()
                    if (typeof data.totalGlobal === 'number') {
                        totalDia += data.totalGlobal
                    }
                })
                const tipo = authStore.profile?.tipo
                await AuthService.updateUserfondo(listeroId, bancoId, tipo, totalDia)
            } else {
                // Si no hay filtro, actualiza con el total calculado
                const tipo = authStore.profile?.tipo
                await AuthService.updateUserfondo(listeroId, bancoId, tipo, total)
            }
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