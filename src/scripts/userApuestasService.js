// userBetsService.js
import { db, auth } from '@/firebase/config';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { obtenerBancoPadre } from '@/scripts/FunctionBancoPadre.js';

export const UserBetsService = {
  /**
   * Obtiene todas las apuestas del usuario actual
   * @returns {Promise<Array>} Array de apuestas del usuario
   */
  async getUserBets() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("Usuario no autenticado");
        return [];
      }

      // Obtener el banco padre del usuario
      const bancoId = await obtenerBancoPadre();
      if (!bancoId) {
        console.error("No se pudo determinar el banco padre");
        return [];
      }

      // Referencia a la colección de apuestas
      const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`);
      
      // Crear query para filtrar por id_listero
      const q = query(apuestasRef, where("id_listero", "==", userId));
      
      // Ejecutar la consulta
      const querySnapshot = await getDocs(q);
      
      // Mapear los documentos a un array de objetos
      const apuestas = [];
      querySnapshot.forEach((doc) => {
        apuestas.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return apuestas;
    } catch (error) {
      console.error("Error obteniendo apuestas del usuario:", error);
      throw error;
    }
  },

  /**
   * Obtiene las apuestas agrupadas por estado
   * @returns {Promise<Object>} Objeto con apuestas agrupadas
   */
  async getGroupedBets() {
    const apuestas = await this.getUserBets();
    
    return apuestas.reduce((acc, apuesta) => {
      const estado = apuesta.estado || 'pendiente';
      if (!acc[estado]) {
        acc[estado] = [];
      }
      acc[estado].push(apuesta);
      return acc;
    }, {});
  },

  /**
   * Calcula el total de las apuestas según un campo específico
   * @param {String} fieldName - Nombre del campo a sumar (ej: 'monto')
   * @param {String} statusFilter - Filtro por estado (opcional)
   * @returns {Promise<Number>} Total calculado
   */
  async calculateTotal(fieldName = 'monto', statusFilter = null) {
    const apuestas = await this.getUserBets();
    
    const filtered = statusFilter 
      ? apuestas.filter(apuesta => apuesta.estado === statusFilter)
      : apuestas;
    
    return filtered.reduce((total, apuesta) => {
      return total + (Number(apuesta[fieldName]) || 0);
    }, 0);
  }
};