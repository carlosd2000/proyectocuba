import { ref } from 'vue'
import { db } from '@/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

const parsearDesdeFirestore = (firestoreData) => {
  if (!firestoreData) return {};

  const parsearNumeros = (numeros) => {
    if (numeros === undefined || numeros === null) return [];
    if (Array.isArray(numeros)) return numeros;
    
    try {
      // Intentar parsear como JSON (para arrays anidados)
      if (typeof numeros === 'string' && numeros.startsWith('[')) {
        return JSON.parse(numeros);
      }
      // Para strings separados por comas
      if (typeof numeros === 'string') {
        return numeros.split(',').filter(x => x !== '').map(num => parseInt(num));
      }
      return [];
    } catch {
      return [];
    }
  };

  const result = {};
  
  Object.keys(firestoreData).forEach(horario => {
    const data = firestoreData[horario];
    if (!data) return;
    
    result[horario] = {
      ...data,
      limitados: {
        Fijo: {
          monto: data.limitados?.Fijo?.monto || '',
          numeros: parsearNumeros(data.limitados?.Fijo?.numeros)
        },
        Corrido: {
          monto: data.limitados?.Corrido?.monto || '',
          numeros: parsearNumeros(data.limitados?.Corrido?.numeros)
        },
        Parlet: {
          monto: data.limitados?.Parlet?.monto || '',
          numeros: parsearNumeros(data.limitados?.Parlet?.numeros)
        }
      },
      noJuega: {
        Fijo: {
          numeros: parsearNumeros(data.noJuega?.Fijo?.numeros)
        },
        Corrido: {
          numeros: parsearNumeros(data.noJuega?.Corrido?.numeros)
        },
        Parlet: {
          numeros: parsearNumeros(data.noJuega?.Parlet?.numeros)
        }
      }
    };
  });

  return result;
};

export function obtenerConfigPagos() {
  const configPagos = ref({})
  const loading = ref(false)
  const error = ref(null)

  const cargarConfigPagos = async (bancoId) => {
    if (!bancoId) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, "bancos", bancoId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        configPagos.value = parsearDesdeFirestore(data.configPagos || {});
        
        // Guardar en localStorage ya parseado
        localStorage.setItem('configPagos', JSON.stringify(configPagos.value));
      }
    } catch (err) {
      console.error("Error cargando configPagos:", err);
      error.value = err;
      
      // Intentar cargar desde localStorage como fallback
      const localData = localStorage.getItem('configPagos');
      if (localData) {
        configPagos.value = JSON.parse(localData);
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    configPagos,
    loading,
    error,
    cargarConfigPagos
  };
}