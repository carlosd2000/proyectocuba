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

    export function usePagar() {
    const router = useRouter()
    const route = useRoute()

    const mostrarToastSave = ref(false)
    const mostrarToastUpdate = ref(false)
    const mostrarToastError = ref(false)
    const errorMessage = ref('')
    const isOnline = ref(navigator.onLine)

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

    const validarAntesDeEnviar = () => {
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

        errorMessage.value = ''
        return true
    }

    const lanzarToast = async () => {
        if (!validarAntesDeEnviar()) {
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
            if (!resultado.offline) {
                router.push(`/listas/${route.params.id}`)
            }
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
        formatNumber,
        totales,
        totalGeneral,
        lanzarToast
    }
}