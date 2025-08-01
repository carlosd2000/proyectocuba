// FunctionHorarioActivo.js
/**
 * Verifica si un horario está activo y no sobrepasado usando solo localStorage.
 * No hace ninguna consulta a Firestore.
 */
export async function verificarHorarioActivo(horario) {
    try {
        const cache = leerEstadosHorariosCache()
        const estado = cache[horario] || { activo: false, sobrepasado: false }
        
        return estado.activo && !estado.sobrepasado
    } catch (error) {
        console.error(`Error verificando horario ${horario}:`, error)
        return false
    }
}

export function leerEstadosHorariosCache() {
    return JSON.parse(localStorage.getItem('horariosCache') || '{}')
}

export async function verificarHorarioBasico( horario) {
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

export async function actualizarCacheHorarios() {
    const horarios = ['dia', 'tarde', 'noche']
    for (const horario of horarios) {
        await verificarHorarioActivo(horario)
    }
}
