import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { filasFijas, filasExtra, calcularTotalesCombinados, limpiarCampos, validarFilas} from '../scripts/operaciones.js'
import { guardarDatos, setNombre, modoEdicion } from '../scripts/añadir.js'
import { useToastStore } from '../stores/toast'
import CheckIcon from '../assets/icons/Check.svg'
import ErrorIcon from '../assets/icons/Error.svg'
import Alert from '../assets/icons/alert.svg'

export function usePagar() {
    const router = useRouter()
    const route = useRoute()
    const toastStore = useToastStore()
    const errorMessage = ref('')
    const isOnline = ref(navigator.onLine)
    const mostrarEnviando = ref(false)

    const formatNumber = (value) => {
        const num = Number(value || 0)
        return isNaN(num) ? 0 : num
    }

    const totales = computed(() => {
      const calculos = calcularTotalesCombinados()
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
        const tipo = route.query.tipo || 'normal';
        const { esValido, circulosInvalidos, cuadradosInvalidos, circuloSoloInvalido, mensajeEspecial } = validarFilas(filasFijas, filasExtra, tipo)
        
        // Primero verificamos el mensaje especial para parlet/candado
        if (mensajeEspecial) {
            errorMessage.value = mensajeEspecial;
            return false;
        }

        if (circulosInvalidos) {
            errorMessage.value = 'Falta el numero de tu apuesta'
            return false
        }

        if (cuadradosInvalidos) {
            errorMessage.value = 'Falta el valor de tu apuesta';
            return false
        }

        if (circuloSoloInvalido) {
            errorMessage.value = 'El círculo especial requiere al menos 1 cuadrado con dato'
            return false
        }

        if (!esValido) {
            errorMessage.value = 'Ingrese al menos un par válido (numero y valor)'
            return false
        }
        
        errorMessage.value = ''
        return true
    }

    const lanzarToast = async () => {
      try {
        mostrarEnviando.value = true
        // Leer valores de localStorage
        const valorBote = Number(localStorage.getItem('valorBote'))
        const boteActivo = localStorage.getItem('boteActivo') === 'true'

        // Recolectar todos los valores de apuestas
        const valores = [
          ...filasFijas.value.map(f => Number(f.circulo1) || 0),
          ...filasFijas.value.map(f => Number(f.circulo2) || 0),
          ...filasExtra.value.map(f => Number(f.circulo1) || 0),
          ...filasExtra.value.map(f => Number(f.circulo2) || 0),
        ]
        if (filasFijas.value[2]?.circuloSolo !== '' && filasFijas.value[2]?.circuloSolo !== null) {
          valores.push(Number(filasFijas.value[2].circuloSolo) || 0)
        }

        // Validación: si algún valor supera el valorBote y boteActivo es false, bloquear envío
        if (
          valorBote &&
          !boteActivo &&
          valores.some(v => v > valorBote)
        ) {
          toastStore.showToast(
            `Limite alcanzado !! El valor ingresado supera $${valorBote} al limite permitido para esta jugada.`,
            'double-message',
            4000,
            Alert,
            'top'
          )
          mostrarEnviando.value = false
          return
        }

        // Si boteActivo es true y algún valor supera el valorBote, mostrar el otro toast (pero permitir enviar)
        if (
          valorBote &&
          boteActivo &&
          valores.some(v => v > valorBote)
        )
        if (!(await validarAntesDeEnviar())) {
              toastStore.showToast(
                errorMessage.value, 
                'error', 
                3000, 
                ErrorIcon,
                'top'
              )
            return
        }
        const resultado = await guardarDatos()
        
        if (resultado.success) {
          if (modoEdicion.value) {
            toastStore.showToast(
              isOnline.value ? 'Jugada actualizada' : 'Cambios guardados (offline)',
              'success',
              2000,
              CheckIcon,
              'top'
            )
            limpiarCampos()
            setNombre('')
          } 
          else {
            toastStore.showToast(
              isOnline.value ? 'Jugada enviada' : 'Jugada guardada (offline)',
              'success',
              2000,
              CheckIcon,
              'top'
            )
            limpiarCampos()
            setNombre('')
          }
          router.push(`/lista/${route.params.id}`)
        } else {
          toastStore.showToast(
            resultado.message || 'Error al guardar',
            'error',
            3000,
            ErrorIcon,
            'top'
          )
        }
      }
      catch (error) {
        toastStore.showToast(
          'Ocurrió un error inesperado',
          'error',
          3000,
          ErrorIcon,
          'top'
        )
      } 
      finally {
        mostrarEnviando.value = false
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
        errorMessage,
        isOnline,
        formatNumber,
        totales,
        totalGeneral,
        lanzarToast,
        mostrarEnviando, 
    }
}