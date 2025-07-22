// FunctionHorarioActivo.js
/**
 * Verifica si un horario está activo y no sobrepasado usando solo localStorage.
 * No hace ninguna consulta a Firestore.
 */
export async function verificarHorarioActivo(bancoId, horario) {
    try {
        const fechaKey = new Date().toISOString().slice(0, 10)
        const cacheCompleto = JSON.parse(localStorage.getItem('horaCierreCache') || '{}')
        const datosHorario = cacheCompleto[fechaKey]?.[horario]

        if (!datosHorario) {
            console.warn(`No se encontró cache para ${horario}`)
            guardarEstadoEnCache(horario, false, false)
            return false
        }

        const activo = datosHorario.activo
        if (!activo) {
            guardarEstadoEnCache(horario, false, false)
            return false
        }

        const [horaStr, minutoStr] = datosHorario.hora.split(':')
        const horaLimiteMin = parseInt(horaStr) * 60 + parseInt(minutoStr)

        const ahora = new Date()
        ahora.setHours(ahora.getHours() + 1) // ajuste por zona si aplica
        const horaActualMin = ahora.getHours() * 60 + ahora.getMinutes()

        const sobrepasado = horaActualMin >= horaLimiteMin
        guardarEstadoEnCache(horario, activo, sobrepasado)

        return activo && !sobrepasado
    } catch (error) {
        console.error(`Error verificando horario ${horario}:`, error)
        return false
    }
}

function guardarEstadoEnCache(horario, activo, sobrepasado) {
    const cache = JSON.parse(localStorage.getItem('horariosCache') || '{}')
    cache[horario] = { activo, sobrepasado }
    localStorage.setItem('horariosCache', JSON.stringify(cache))
}

export function leerEstadosHorariosCache() {
    return JSON.parse(localStorage.getItem('horariosCache') || '{}')
}

export async function verificarHorarioBasico(bancoId, horario) {
    try {
        const fechaKey = new Date().toISOString().slice(0, 10)
        const cache = JSON.parse(localStorage.getItem('horaCierreCache') || '{}')
        const datos = cache[fechaKey]?.[horario]
        return datos?.activo === true
    } catch (error) {
        console.error(`Error verificando horario básico ${horario}:`, error)
        return false
    }
}

export async function actualizarCacheHorarios(bancoId) {
    const horarios = ['dia', 'tarde', 'noche']
    for (const horario of horarios) {
        await verificarHorarioActivo(bancoId, horario)
    }
}
