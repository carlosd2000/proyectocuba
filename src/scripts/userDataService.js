// userDataService.js
import { auth, db } from '@/firebase/config';
import { obtenerBancoPadre } from '@/scripts/FunctionBancoPadre.js';
import { AuthService } from '@/firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';

export const UserDataService = {
  /**
   * Obtiene los datos completos del usuario actual
   * @returns {Promise<Object|null>} Datos del usuario o null si no está autenticado
   */
  async getCurrentUserData() {
    try {
      // Verificar si hay usuario autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No hay usuario autenticado");
        return null;
      }

      // Obtener el perfil del usuario desde AuthService
      const userProfile = await AuthService.getUserProfile(currentUser.uid);
      
      if (!userProfile) {
        console.error("No se pudo obtener el perfil del usuario");
        return null;
      }

      // Obtener banco padre si el usuario no es admin o banco
      let bancoPadreId = null;
      if (userProfile.tipo !== 'admin' && userProfile.tipo !== 'bancos') {
        bancoPadreId = await obtenerBancoPadre();
      } else if (userProfile.tipo === 'bancos') {
        bancoPadreId = currentUser.uid; // Para bancos, su ID es su propio bancoId
      }

      // Combinar toda la información
      const userData = {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        ...userProfile,
        bancoPadreId: bancoPadreId || userProfile.bancoId || null
      };

      return userData;
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      throw error;
    }
  },

  /**
   * Escucha cambios en la autenticación y devuelve los datos del usuario cuando cambia
   * @param {Function} callback Función que recibe los datos del usuario (o null si cierra sesión)
   */
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userData = await this.getCurrentUserData();
          callback(userData);
        } catch (error) {
          console.error("Error al obtener datos del usuario en listener:", error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  /**
   * Obtiene datos básicos del usuario desde el estado de autenticación
   * @returns {Object|null} Datos básicos del usuario o null si no está autenticado
   */
  async getTotalGlobalListero() {
    const authStore = useAuthStore();
    const listeroId = authStore.userId;
    if (!listeroId) return 0;

    // Busca todas las apuestas donde idistero == listeroId
    const apuestasRef = collection(db, 'apuestas');
    const q = query(apuestasRef, where('idistero', '==', listeroId));
    const snapshot = await getDocs(q);

    let total = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (typeof data.totalGlobal === 'number') {
        total += data.totalGlobal;
      }
    });
    return total;
  }
};