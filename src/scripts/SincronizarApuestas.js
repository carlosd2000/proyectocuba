import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore'

// Obtener hora límite del turno desde Firestore
async function obtenerHoraLimite(turno) {
  const db = getFirestore()
  const docRef = doc(db, 'hora', turno.toLowerCase())
  const docSnap = await getDoc(docRef)

  console.log(`[obtenerHoraLimite] Buscando hora límite para turno: ${turno}`)

  if (docSnap.exists()) {
    const data = docSnap.data()
    console.log(`[obtenerHoraLimite] Datos obtenidos:`, data)
    return { hh: data.hh, mm: data.mm, ss: data.ss }
  }

  console.warn(`[obtenerHoraLimite] No existe documento para el turno: ${turno}`)
  return null
}

// Obtener hora actual en Cuba
function getFechaHoraCuba() {
  const ahora = new Date()
  const opciones = { timeZone: 'America/Havana', hour12: false }
  const formato = new Intl.DateTimeFormat('en-GB', {
    ...opciones,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(ahora)
  const partes = Object.fromEntries(formato.map(({ type, value }) => [type, value]))
  const fechaCuba = new Date(`${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`)

  console.log(`[getFechaHoraCuba] Hora actual en Cuba: ${fechaCuba.toISOString()}`)
  return fechaCuba
}

export async function sincronizarApuestasOffline() {
  const db = getFirestore()
  const apuestasOffline = JSON.parse(localStorage.getItem('apuestasOffline') || '[]')
  const apuestasNoSincronizadas = []

  console.log(`[sincronizarApuestasOffline] Apuestas offline encontradas:`, apuestasOffline)

  for (const apuesta of apuestasOffline) {
    const turno = apuesta.turno
    console.log(`\nProcesando apuesta para el turno: ${turno}`)

    const horaLimite = await obtenerHoraLimite(turno)
    if (!horaLimite) {
      console.warn(`Hora límite no encontrada para turno ${turno}, no se sincroniza esta apuesta.`)
      apuestasNoSincronizadas.push(apuesta)
      continue
    }

    const ahoraCuba = getFechaHoraCuba()
    const fechaLimite = new Date(ahoraCuba)
    fechaLimite.setHours(horaLimite.hh, horaLimite.mm, horaLimite.ss, 0)

    console.log(`[sincronizarApuestasOffline] Hora límite para el turno ${turno}: ${fechaLimite.toISOString()}`)

    // Determinar estado
    let estado = 'en tiempo'
    if (ahoraCuba > fechaLimite) {
      estado = 'fuera de tiempo'
    }

    console.log(`[sincronizarApuestasOffline] Estado de la apuesta: ${estado}`)

    try {
      await addDoc(collection(db, 'apuestas'), {
        ...apuesta,
        estado
      })
      console.log(`[sincronizarApuestasOffline] Apuesta sincronizada con éxito.`)
    } catch (e) {
      console.error(`[sincronizarApuestasOffline] Error al sincronizar la apuesta:`, e)
      apuestasNoSincronizadas.push(apuesta)
    }
  }

  console.log(`[sincronizarApuestasOffline] Apuestas no sincronizadas:`, apuestasNoSincronizadas)
  localStorage.setItem('apuestasOffline', JSON.stringify(apuestasNoSincronizadas))
}
