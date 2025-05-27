import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  filasFijas,
  filasExtra,
  calcularTotales,
  limpiarCampos,
  validarFilas
} from '../scripts/operaciones.js'
import { guardarDatos, setNombre, modoEdicion } from '../scripts/añadir.js'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

export function usePagar() {
    const router = useRouter()
    const route = useRoute()

    const mostrarToastSave = ref(false)
    const mostrarToastUpdate = ref(false)
    const mostrarToastError = ref(false)
    const errorMessage = ref('')
    const isOnline = ref(navigator.onLine)
    const verificandoCandado = ref(false)
    const bancoId = ref(null) // Nuevo: almacenar bancoId

    // Función para obtener el banco padre
    async function obtenerBancoPadre() {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("Usuario no autenticado");

        const bancosSnapshot = await getDocs(collection(db, 'bancos'));
        
        for (const bancoDoc of bancosSnapshot.docs) {
          const currentBancoId = bancoDoc.id;
          
          // Buscar en listeros directos del banco
          const listeroRef = doc(db, `bancos/${currentBancoId}/listeros/${userId}`);
          const listeroSnap = await getDoc(listeroRef);
          if (listeroSnap.exists()) {
            return currentBancoId;
          }

          // Buscar en listeros de colectores del banco
          const colectoresSnapshot = await getDocs(collection(db, `bancos/${currentBancoId}/colectores`));
          
          for (const colectorDoc of colectoresSnapshot.docs) {
            const listeroRef = doc(db, `bancos/${currentBancoId}/colectores/${colectorDoc.id}/listeros/${userId}`);
            const listeroSnap = await getDoc(listeroRef);
            if (listeroSnap.exists()) {
              return currentBancoId;
            }
          }
        }

        throw new Error("No se encontró el banco padre para este usuario");
      } catch (error) {
        console.error("Error obteniendo banco padre:", error);
        throw error;
      }
    }

    // Obtener apuesta por ID (versión mejorada)
    async function obtenerApuestaPorId(bancoId, idApuesta) {
      try {
        const apuestaRef = doc(db, `bancos/${bancoId}/apuestas`, idApuesta);
        const apuestaSnap = await getDoc(apuestaRef);
        
        if (apuestaSnap.exists()) {
          return { 
            id: apuestaSnap.id, 
            ...apuestaSnap.data(),
            candadoAbierto: apuestaSnap.data().candadoAbierto ?? false,
            nombre: apuestaSnap.data().nombre || 'Sin nombre',
            tipo: apuestaSnap.data().tipo || 'tiros',
            horario: apuestaSnap.data().horario || 'Dia'
          };
        }
        return null;
      } catch (error) {
        console.error('Error al obtener apuesta:', error);
        throw error;
      }
    }

    // Verificar candado con manejo de errores mejorado
    async function verificarCandadoPorId(idApuesta) {
      try {
        if (!bancoId.value) {
          bancoId.value = await obtenerBancoPadre();
        }
        
        const apuestaData = await obtenerApuestaPorId(bancoId.value, idApuesta);
        
        if (!apuestaData) {
          console.warn('Apuesta no encontrada, permitiendo edición por defecto');
          return true;
        }
        
        return apuestaData.candadoAbierto ?? true;
      } catch (error) {
        console.error('Error verificando candado:', error);
        return true; // Por defecto permitir edición si hay error
      }
    }

    const formatNumber = (value) => {
        const num = Number(value || 0)
        return isNaN(num) ? 0 : num
    }

    const totales = computed(() => {
        const calculos = calcularTotales(filasFijas, filasExtra)
        return {
          col3: formatNumber(calculos.col3),
          col4: formatNumber(calculos.col4),
          col5: formatNumber(calculos.col5)
        }
    })

    const totalGeneral = computed(() => {
        return formatNumber(totales.value.col3) +
            formatNumber(totales.value.col4) +
            formatNumber(totales.value.col5)
    })

    const validarAntesDeEnviar = async () => {
        const apuestaId = route.query.editar;
        const { esValido, circulosInvalidos, cuadradosInvalidos, circuloSoloInvalido } = validarFilas(filasFijas, filasExtra)

        if (circulosInvalidos) {
            errorMessage.value = 'Cada círculo normal debe tener su cuadrado correspondiente'
            return false
        }

        if (cuadradosInvalidos) {
            errorMessage.value = 'Los cuadrados sin círculos solo son válidos cuando creas candados';
            return false
        }

        if (circuloSoloInvalido) {
            errorMessage.value = 'El círculo especial requiere al menos 1 cuadrado con dato'
            return false
        }

        if (!esValido) {
            errorMessage.value = 'Ingrese al menos un par válido (cuadrado + círculo)'
            return false
        }

        if (apuestaId) {
            try {
                verificandoCandado.value = true;
                const candadoAbierto = await verificarCandadoPorId(apuestaId);
                if (!candadoAbierto) {
                    errorMessage.value = 'La apuesta está bloqueada para edición (candado cerrado)';
                    return false;
                }
            } catch (error) {
                console.error('Error al verificar candado:', error);
                return true; // Permitir continuar si hay error en verificación
            } finally {
                verificandoCandado.value = false;
            }
        }
        
        errorMessage.value = ''
        return true
    }

    const lanzarToast = async () => {
        if (!(await validarAntesDeEnviar())) {
            mostrarToastError.value = true
            setTimeout(() => mostrarToastError.value = false, 2000)
            return
        }

        const resultado = await guardarDatos()

        if (resultado.success) {
            if (modoEdicion.value) {
                mostrarToastUpdate.value = true
                setTimeout(() => {
                  mostrarToastUpdate.value = false
                  limpiarCampos()
                  setNombre('')
                  router.push(`/listas/${route.params.id}`)
                }, 1500)
            } else {
                limpiarCampos()
                setNombre('')
                mostrarToastSave.value = true
                setTimeout(() => {
                  mostrarToastSave.value = false
                }, 1500)
            }
        } else {
            errorMessage.value = resultado.message || 'Error al guardar'
            mostrarToastError.value = true
            setTimeout(() => mostrarToastError.value = false, 2000)
        }
    }

    const updateOnlineStatus = () => {
        isOnline.value = navigator.onLine
    }

    onMounted(() => {
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
    })

    onUnmounted(() => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
    })

    return {
        mostrarToastSave,
        mostrarToastUpdate,
        mostrarToastError,
        errorMessage,
        isOnline,
        verificandoCandado,
        formatNumber,
        totales,
        totalGeneral,
        lanzarToast
    }
}