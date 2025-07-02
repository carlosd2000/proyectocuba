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
        
        if (!horarioSnap.exists()) return false;
        
        const horarioData = horarioSnap.data();
        
        // Siempre verificar si está activo
        if (!horarioData.activo) return false;
        
        // Verificar la hora límite si existe
        if (horarioData.hora) {
            const ahora = new Date();
            const horaLimite = horarioData.hora.toDate();
            
            // Comparar solo horas (ignorando fecha)
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            const horaLimiteMinutos = horaLimite.getHours() * 60 + horaLimite.getMinutes();
            
            if (horaActual >= horaLimiteMinutos) return false;
        }
        return true;
    } catch (error) {
        console.error(`Error verificando horario ${horario}:`, error);
        return false;
    }
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