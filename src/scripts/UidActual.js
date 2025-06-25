import { auth } from '../firebase/config'

/**
 * Devuelve el UID del usuario autenticado actualmente, o null si no hay usuario.
 */
export function obtenerUidActual() {
    try {
        return auth.currentUser?.uid || null
    } catch (error) {
        console.error('Error al obtener UID actual:', error)
        return null
    }
}