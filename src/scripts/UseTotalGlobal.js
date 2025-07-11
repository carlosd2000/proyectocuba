// useTotalGlobal.js

import { db } from '@/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import { AuthService } from '../firebase/auth'

export function useTotalGlobal() {
    const totalGlobal = ref(0)
    const isLoading = ref(true)
    const error = ref(null)

    const calculateLocalTotal = (listeroId) => {
        try {
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

            // Consulta a Firestore
            const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`)
            const now = new Date()
            now.setHours(0, 0, 0, 0)
            const startOfDay = now.getTime()
            const endOfDay = startOfDay + 86400000

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

            const localTotal = calculateLocalTotal(listeroId)
            totalGlobal.value = firebaseTotal + localTotal

            // Guardar en caché POR HORARIO
            const cacheKey = `totalGlobal_${listeroId}_${bancoId}_${horario || 'todos'}_${new Date().toISOString().split('T')[0]}`
            localStorage.setItem(cacheKey, JSON.stringify({
                total: totalGlobal.value,
                timestamp: Date.now()
            }))

            // Actualizar fondo del usuario
            const tipo = authStore.profile?.tipo
            await AuthService.updateUserfondo(listeroId, bancoId, tipo, totalGlobal.value)

        } catch (e) {
            console.error('Error en fetchTotalGlobal:', e)
            error.value = e

            // Fallback: cargar desde caché
            const authStore = useAuthStore()
            const bancoId = authStore.profile?.bancoId || authStore.profile?.idBancoPadre || authStore.profile?.creadorId
            const listeroId = authStore.userId

            if (bancoId && listeroId) {
                const cacheKey = `totalGlobal_${listeroId}_${bancoId}_${horario || 'todos'}_${new Date().toISOString().split('T')[0]}`
                const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}')

                if (cachedData.total != null) {
                    totalGlobal.value = cachedData.total
                } else {
                    totalGlobal.value = calculateLocalTotal(listeroId)
                }
            } else {
                totalGlobal.value = 0
            }
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
