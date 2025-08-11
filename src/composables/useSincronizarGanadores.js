// useSincronizarGanadores.js
import { db } from '@/firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import localforage from '@/stores/localStorage'

export async function useSincronizarGanadores() {
  const authStore = useAuthStore()
  const bancoId = authStore.bancoId
  const userId = authStore.userId

  // En useSincronizarGanadores.js
  let tirosLocales
  try {
    tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}')
  } catch (e) {
    console.error('Error parsing tirosLocales:', e)
    tirosLocales = {}
  }
  const hoy = new Date().toISOString().slice(0, 10)

  if (!tirosLocales[hoy]) {
    console.warn('⛔ No hay tiros locales para hoy')
    return []
  }

  const apuestasLocales = await localforage.getItem('apuestasPorFecha') || {}
  const apuestasDeHoy = apuestasLocales[hoy] || []

  const horarios = Object.keys(tirosLocales[hoy])
  const ganadores = []

  for (const horario of horarios) {
    const { tiro, timestamp } = tirosLocales[hoy][horario]
    const fechaTiro = new Date(timestamp).toISOString().slice(0, 10)

    const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`)
    const q = query(
      apuestasRef,
      where('id_usuario', '==', userId),
      where('horario', '==', horario),
      where('fecha', '==', fechaTiro),
    )
    
    const snapshot = await getDocs(q)

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const docId = docSnap.id

      if (!Array.isArray(data.datos)) continue

      const sincronizadoEn = data.sincronizadoEn?.toDate?.()
      const fechaSincronizado = sincronizadoEn?.toISOString().slice(0, 10)

      if (fechaSincronizado !== fechaTiro) continue // 💡 Saltar si la sincronización fue otro día

// useSincronizarGanadores.js (SOLO MODIFICAR LAS CONDICIONES)
      for (const fila of data.datos) {
        const cuadrado = fila.cuadrado
        const circulo1 = fila.circulo1
        const circulo2 = fila.circulo2

        if (typeof cuadrado !== 'number') continue

        const cuadradoStr = cuadrado.toString().padStart(2, '0')
        const [fijo, corrido1, corrido2] = tiro.split('-')
        const decenaFijo = fijo.slice(-2)

        let esGanador = false

        // CONDICIÓN 1: Cuadrado igual a decena del fijo Y tiene circulo1
        if (cuadradoStr === decenaFijo && circulo1 !== undefined) {
          esGanador = true
        }
        
        // CONDICIÓN 2: Cuadrado igual a corrido1 o corrido2 Y tiene circulo2
        if ((cuadradoStr === corrido1 || cuadradoStr === corrido2) && circulo2 !== undefined) {
          esGanador = true
        }

        if (esGanador) {
          const index = apuestasDeHoy.findIndex(a =>
            (a.uuid === data.uuid || a.id === data.uuid) &&
            a.horario === horario &&
            a.fecha === fechaTiro
          );

          if (index !== -1 && apuestasDeHoy[index].ganador !== true) {
            apuestasDeHoy[index] = {
              ...apuestasDeHoy[index],
              ganador: true
            };
          }

          ganadores.push({ 
            docId, 
            ...data, 
            ganador: true
          })
          break
        }
      }
    }
  }

  // 🔄 Guardar cambios de vuelta en localforage
  if (ganadores.length > 0) {
    // Guardar en un almacenamiento especial solo para ganadores
    const ganadoresGuardados = JSON.parse(localStorage.getItem('ganadoresConfirmados') || '{}');
    ganadoresGuardados[hoy] = ganadoresGuardados[hoy] || [];
    
    // Añadir solo nuevos ganadores
    ganadores.forEach(ganador => {
        if (!ganadoresGuardados[hoy].some(g => g.uuid === ganador.uuid)) {
            ganadoresGuardados[hoy].push({
                uuid: ganador.uuid || ganador.id,
                horario: ganador.horario,
                ganador: true
            });
        }
    });
    
    localStorage.setItem('ganadoresConfirmados', JSON.stringify(ganadoresGuardados));
  }

  console.log('🏆 Ganadores encontrados:', ganadores)
  window.dispatchEvent(new CustomEvent('ganadores-actualizados', {
    detail: { fecha: hoy }
  }));
  return ganadores
}
