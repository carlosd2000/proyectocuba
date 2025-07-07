import { db } from '@/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted } from 'vue'
import { AuthService } from '../firebase/auth'

export function useTotalGlobal() {
    const totalGlobal = ref(0)
    const isLoading = ref(true)
    const error = ref(null)

    const getCachedApuestas = () => {
        try {
            const cacheStr = localStorage.getItem('apuestasFirebaseCache')
            if (!cacheStr) return []
            
            const cache = JSON.parse(cacheStr)
            const hoy = new Date().toISOString().split('T')[0]
            
            if (cache.cacheDate === hoy) {
                return cache.data || []
            }
            return []
        } catch (error) {
            console.error('Error leyendo caché de apuestas:', error)
            return []
        }
    }

    const calculateLocalTotal = (listeroId) => {
        try {
            // Solo sumar apuestas pendientes (las cacheadas ya están en Firebase)
            const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
                .filter(a => a.id_listero === listeroId)
                .map(a => Number(a.totalGlobal) || 0)
            
            return pendientes.reduce((sum, val) => sum + val, 0)
        } catch (error) {
            console.error('Error calculando total local:', error)
            return 0
        }
    }

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

            // Obtener apuestas de Firebase
            const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`)
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
            let firebaseTotal = 0
            snapshot.forEach(doc => {
                const data = doc.data()
                if (typeof data.totalGlobal === 'number') {
                    firebaseTotal += data.totalGlobal
                }
            })

            // Solo sumar apuestas pendientes locales (no cacheadas)
            const localTotal = calculateLocalTotal(listeroId)
            totalGlobal.value = firebaseTotal + localTotal

            // Guardar en caché
            const cacheKey = `totalGlobal_${listeroId}_${bancoId}_${new Date().toISOString().split('T')[0]}`
            localStorage.setItem(cacheKey, JSON.stringify({
                total: totalGlobal.value,
                timestamp: Date.now()
            }))

            const tipo = authStore.profile?.tipo
            await AuthService.updateUserfondo(listeroId, bancoId, tipo, totalGlobal.value)
        } catch (e) {
            error.value = e
            console.error('Error en fetchTotalGlobal:', e)
            
            // Fallback a caché
            const authStore = useAuthStore()
            const bancoId = authStore.profile?.bancoId || authStore.profile?.idBancoPadre || authStore.profile?.creadorId
            const listeroId = authStore.userId
            
            if (bancoId && listeroId) {
                const cacheKey = `totalGlobal_${listeroId}_${bancoId}_${new Date().toISOString().split('T')[0]}`
                const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}')
                
                if (cachedData.total) {
                    totalGlobal.value = cachedData.total
                } else {
                    // Calcular total basado solo en pendientes si no hay caché
                    totalGlobal.value = calculateLocalTotal(listeroId)
                }
            } else {
                totalGlobal.value = 0
            }
        } finally {
            isLoading.value = false
        }
    }

    onMounted(() => {
        const authStore = useAuthStore()
        const bancoId = authStore.profile?.bancoId || authStore.profile?.idBancoPadre || authStore.profile?.creadorId
        const listeroId = authStore.userId
        
        if (bancoId && listeroId) {
            const cacheKey = `totalGlobal_${listeroId}_${bancoId}_${new Date().toISOString().split('T')[0]}`
            const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}')
            
            if (cachedData.total) {
                totalGlobal.value = cachedData.total
                isLoading.value = false
            } else {
                totalGlobal.value = calculateLocalTotal(listeroId)
                isLoading.value = false
            }
        }
    })

    return {
        totalGlobal,
        isLoading,
        error,
        fetchTotalGlobal
    }
}