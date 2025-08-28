import { db } from '@/firebase/config'
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'

const API_URL = 'https://worldtimeapi.org/api/timezone/America/Bogota'
const HORA_KEY = 'horaGlobal'
let intervalo = null

// Función para sumar 1 hora a una fecha ISO
function sumarUnaHora(fechaISO) {
  const fecha = new Date(fechaISO)
  fecha.setHours(fecha.getHours() + 1)
  return fecha.toISOString()
}

async function obtenerHoraFirestore() {
  try {
    const tempDocRef = doc(db, 'utils', 'horaTemporal')
    await setDoc(tempDocRef, { timestamp: serverTimestamp() })
    await new Promise(resolve => setTimeout(resolve, 300))
    const snap = await getDoc(tempDocRef)
    const data = snap.data()
    await deleteDoc(tempDocRef)

    if (data?.timestamp?.toDate) {
      const horaServidor = data.timestamp.toDate().toISOString()
      const horaAjustada = sumarUnaHora(horaServidor)
      return horaAjustada
    }
    throw new Error('No se pudo obtener hora de Firestore')
  } catch (err) {
    console.error('❌ Error obteniendo hora desde Firestore:', err)
    throw err
  }
}

export async function obtenerHora() {
  try {
    // Primero intentar con WorldTimeAPI
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      const horaISO = data.datetime || data.dateTime
      const horaAjustada = sumarUnaHora(horaISO)
      localStorage.setItem(HORA_KEY, horaAjustada)
      return horaAjustada
    } catch (apiError) {
      console.warn('⚠️ Falló WorldTimeAPI, intentando Firestore:', apiError)
      // Si falla, intentar con Firestore
      const horaFirestore = await obtenerHoraFirestore()
      localStorage.setItem(HORA_KEY, horaFirestore)
      return horaFirestore
    }
  } catch (error) {
    console.warn('⚠️ Usando hora local por error:', error)
    const local = new Date().toISOString()
    localStorage.setItem(HORA_KEY, local)
    return local
  }
}

export function iniciarRelojGlobal() {
  // Al cargar por primera vez
  obtenerHora().catch(error => {
    console.error('Error al obtener hora inicial:', error)
  })

  // Actualizar cada 30 minutos
  intervalo = setInterval(() => {
    obtenerHora().catch(error => {
      console.error('Error al actualizar hora:', error)
    })
  }, 10 * 60 * 1000)

  // Actualizar cuando vuelva la conexión
  window.addEventListener('online', () => {
    obtenerHora().catch(error => {
      console.error('Error al actualizar hora al recuperar conexión:', error)
    })
  })
}

export function detenerRelojGlobal() {
  if (intervalo) clearInterval(intervalo)
  window.removeEventListener('online', obtenerHora)
}