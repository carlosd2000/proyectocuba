// scripts/syncHorasCierre.js
import { doc, getDoc, getFirestore, Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'

const db = getFirestore()

export async function sincronizarHorasDeCierre() {
    const authStore = useAuthStore()
    const bancoId = authStore.bancoId
    if (!bancoId) return

    const horarios = ['dia', 'tarde', 'noche']
    let horaCierreCache = {}
    let horariosCache = {}

    for (const horarioKey of horarios) {
        try {
        const ref = doc(db, `bancos/${bancoId}/hora`, horarioKey)
        const snap = await getDoc(ref)

        if (snap.exists()) {
            const data = snap.data()
            const hora = data.hora
            const activo = !!data.activo

            if (hora instanceof Timestamp || (hora && typeof hora.toDate === 'function')) {
                const horaDate = hora.toDate()
                const horaStr = horaDate.toTimeString().slice(0, 5) // 'HH:MM'
                horaCierreCache[horarioKey] = { hora: horaStr, activo }
                horariosCache[horarioKey] = { activo, sobrepasado: false }
            }
        }
        } catch (err) {
        console.error(`Error al sincronizar horario ${horarioKey}:`, err)
        }
    }

    localStorage.setItem('horaCierreCache', JSON.stringify(horaCierreCache))
    localStorage.setItem('horariosCache', JSON.stringify(horariosCache))
}
