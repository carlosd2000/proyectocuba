// FunctionHorarioActivo.js
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Verifica si un horario está activo considerando solo la hora (no la fecha)
 * @param {string} bancoId - ID del banco
 * @param {string} horario - Nombre del horario ('dia', 'tarde', 'noche')
 * @returns {Promise<boolean>} - True si el horario está disponible
 */
export async function verificarHorarioActivo(bancoId, horario) {
    try {
        const horarioRef = doc(db, `bancos/${bancoId}/hora/${horario}`);
        const horarioSnap = await getDoc(horarioRef);

        let activo = false;
        let sobrepasado = false;

        if (!horarioSnap.exists()) {
            guardarEstadoEnCache(horario, activo, sobrepasado);
            return false;
        }

        const horarioData = horarioSnap.data();

        if (!horarioData.activo) {
            guardarEstadoEnCache(horario, false, false);
            return false;
        }

        activo = true;

        if (horarioData.hora) {
            const ahora = new Date();
            ahora.setHours(ahora.getHours() + 1);
            const horaLimite = horarioData.hora.toDate();
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            const horaLimiteMinutos = horaLimite.getHours() * 60 + horaLimite.getMinutes();

            if (horaActual >= horaLimiteMinutos) {
                sobrepasado = true;
                // NO cambies activo aquí, solo marca sobrepasado
            }
        }

        guardarEstadoEnCache(horario, true, sobrepasado);
        // Para /anadirjugada, retorna false si está sobrepasado
        return !sobrepasado;
        
    } catch (error) {
        // Si hay error, no modificar el cache
        console.error(`Error verificando horario ${horario}:`, error);
        return false;
    }
}

// Función auxiliar para guardar el estado en cache
function guardarEstadoEnCache(horario, activo, sobrepasado) {
    let cache = JSON.parse(localStorage.getItem('horariosCache') || '{}');
    cache[horario] = { activo, sobrepasado };
    localStorage.setItem('horariosCache', JSON.stringify(cache));
}

// Función para leer el cache
export function leerEstadosHorariosCache() {
    return JSON.parse(localStorage.getItem('horariosCache') || '{}');
}

/**
 * Verificación básica (solo campo activo)
 */
export async function verificarHorarioBasico(bancoId, horario) {
    try {
        const horarioRef = doc(db, `bancos/${bancoId}/hora/${horario}`);
        const horarioSnap = await getDoc(horarioRef);
        return horarioSnap.exists() && horarioSnap.data().activo === true;
    } catch (error) {
        console.error(`Error verificando horario básico ${horario}:`, error);
        return false;
    }
}
export async function actualizarCacheHorarios(bancoId) {
    const horarios = ['dia', 'tarde', 'noche'];
    for (const horario of horarios) {
        await verificarHorarioActivo(bancoId, horario);
    }
}