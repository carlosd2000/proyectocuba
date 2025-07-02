import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'

export async function obtenerHorasTurnos(bancoId) {
  const horarios = ['dia', 'tarde', 'noche']
  const resultados = {
    dia: 'Sin hora',
    tarde: 'Sin hora',
    noche: 'Sin hora',
  }

  try {
    for (const turno of horarios) {
      const docRef = doc(db, `bancos/${bancoId}/hora`, turno)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.hora && data.hora.seconds) {
          const hora = new Date(data.hora.seconds * 1000)
          const horaFormateada = hora.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          resultados[turno] = horaFormateada
        }
      }
    }
  } catch (error) {
    console.error('Error al obtener horas:', error)
  }

  return resultados
}
