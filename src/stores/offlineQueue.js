// stores/offlineQueue.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'

export const useOfflineQueueStore = defineStore('offlineQueue', () => {
  const pendingOperations = ref([])
  const isProcessing = ref(false)
  
  const loadStoredOperations = () => {
    const stored = localStorage.getItem('offlineQueue')
    if (stored) {
      pendingOperations.value = JSON.parse(stored)
    }
  }
  
  const addOperation = (operation) => {
    pendingOperations.value.push(operation)
    saveToLocalStorage()
  }
  
  const removeOperation = (timestamp) => {
    pendingOperations.value = pendingOperations.value.filter(
      op => op.timestamp !== timestamp
    )
    saveToLocalStorage()
  }
  
  const saveToLocalStorage = () => {
    localStorage.setItem('offlineQueue', JSON.stringify(pendingOperations.value))
  }

  const serializeNumeros = (numeros) => {
    if (Array.isArray(numeros) && Array.isArray(numeros[0])) {
      // Array de arrays (Parlet)
      return JSON.stringify(numeros);
    }
    if (Array.isArray(numeros)) {
      // Array simple
      return numeros.join(',');
    }
    return numeros || '';
  };
  
  const processQueue = async () => {
    if (isProcessing.value || pendingOperations.value.length === 0) return;
    
    isProcessing.value = true;
    
    try {
      for (const operation of [...pendingOperations.value]) {
        try {
          if (operation.type === 'updateConfigPagos') {
            const { bancoId, horario, config } = operation.data;
            const docRef = doc(db, "bancos", bancoId);
            
            // Crear objeto seguro para Firestore
            const firestoreData = {
              configPagos: {
                [horario]: {
                  ...config,
                  limitados: {
                    Fijo: {
                      monto: config.limitados?.Fijo?.monto || '',
                      numeros: serializeNumeros(config.limitados?.Fijo?.numeros)
                    },
                    Corrido: {
                      monto: config.limitados?.Corrido?.monto || '',
                      numeros: serializeNumeros(config.limitados?.Corrido?.numeros)
                    },
                    Parlet: {
                      monto: config.limitados?.Parlet?.monto || '',
                      numeros: serializeNumeros(config.limitados?.Parlet?.numeros)
                    }
                  },
                  noJuega: {
                    Fijo: {
                      numeros: serializeNumeros(config.noJuega?.Fijo?.numeros)
                    },
                    Corrido: {
                      numeros: serializeNumeros(config.noJuega?.Corrido?.numeros)
                    },
                    Parlet: {
                      numeros: serializeNumeros(config.noJuega?.Parlet?.numeros)
                    }
                  }
                }
              }
            };
            
            await setDoc(docRef, firestoreData, { merge: true });
            removeOperation(operation.timestamp);
          }
        } catch (error) {
          console.error(`Error procesando operación ${operation.timestamp}:`, error);
          continue;
        }
      }
    } finally {
      isProcessing.value = false;
    }
  };
  
  const clearQueue = () => {
    pendingOperations.value = []
    localStorage.removeItem('offlineQueue')
  }
  
  loadStoredOperations()
  
  return { 
    pendingOperations,
    isProcessing,
    addOperation,
    processQueue,
    clearQueue
  }
})