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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function usePagar() {
    const router = useRouter()
    const route = useRoute()

    const mostrarToastSave = ref(false)
    const mostrarToastUpdate = ref(false)
    const mostrarToastError = ref(false)
    const errorMessage = ref('')
    const isOnline = ref(navigator.onLine)
    const verificandoCandado = ref(false) // Nuevo estado para controlar la carga


    // Función para formatear números y manejar NaN/undefined
    const formatNumber = (value) => {
        const num = Number(value || 0)
        return isNaN(num) ? 0 : num
    }

    // Calculamos los totales con protección contra NaN
    const totales = computed(() => {
        const calculos = calcularTotales(filasFijas, filasExtra)
        return {
        col3: formatNumber(calculos.col3),
        col4: formatNumber(calculos.col4),
        col5: formatNumber(calculos.col5)
        }
    })

    // Total general protegido
    const totalGeneral = computed(() => {
        return formatNumber(totales.value.col3) +
            formatNumber(totales.value.col4) +
            formatNumber(totales.value.col5)
    })

    const validarAntesDeEnviar = async () => {
        // 1. Obtener el ID/UUID de la apuesta
        const apuestaId = route.query.editar;
        console.log('ID de la apuesta:', apuestaId);

        const { esValido, circulosInvalidos, circuloSoloInvalido } = validarFilas(filasFijas, filasExtra)

        if (circulosInvalidos) {
            errorMessage.value = 'Cada círculo normal debe tener su cuadrado correspondiente'
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
                    errorMessage.value = 'La apuesta está bloqueada para edición(candado cerrado)';
                    return false;
                }
            } catch (error) {
                console.error('Error al verificar candado:', error);
                return true;
            } finally {
                verificandoCandado.value = false;
            }
        }
        else{
            return true
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
        } 
        else {
            errorMessage.value = resultado.message || 'Error al guardar'
            mostrarToastError.value = true
            setTimeout(() => mostrarToastError.value = false, 2000)
        }
    }

    // Listeners para estado de conexión
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

async function obtenerApuestaPorId(idApuesta) {
  try {
    const apuestaRef = doc(db, 'apuestas', idApuesta);
    const apuestaSnap = await getDoc(apuestaRef);
    
    if (apuestaSnap.exists()) {
      return { id: apuestaSnap.id, ...apuestaSnap.data() };
    } else {
      console.log('No se encontró la apuesta con ID:', idApuesta);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener apuesta:', error);
    return null;
  }
}

// Ejemplo de cómo usar ambas funciones
async function verificarCandadoPorId(idApuesta) {
    // 1. Obtener los datos de la apuesta
    const apuestaData = await obtenerApuestaPorId(idApuesta);
    
    if (!apuestaData) {
        return true; // o false según lo que necesites
    }
    // 2. Verificar el candado
    if (apuestaData && typeof apuestaData.candadoAbierto === 'boolean') {
        return apuestaData.candadoAbierto;
    }
    console.log('Campo candadoAbierto no existe en los datos, se considera ABIERTO');
    return true; // Si no existe el campo, permitir edición
}