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
import { obtenerBancoPadre } from './FunctionBancoPadre.js';
import { useToastStore } from '../stores/toast'
import CheckIcon from '../assets/icons/Check.svg'
import ErrorIcon from '../assets/icons/Error.svg'

async function ejemploUso() {
  const bancoId = await obtenerBancoPadre();
  console.log("Banco padre:", bancoId);
}

export function usePagar() {
    const router = useRouter()
    const route = useRoute()
    const toastStore = useToastStore()
    const errorMessage = ref('')
    const isOnline = ref(navigator.onLine)
    const bancoId = ref(null) // Nuevo: almacenar bancoId
    const mostrarEnviando = ref(false)

    async function obtenerApuestaPorId(bancoId, idApuesta) {
      try {
        const apuestaRef = doc(db, `bancos/${bancoId}/apuestas`, idApuesta);
        const apuestaSnap = await getDoc(apuestaRef);
        
        if (apuestaSnap.exists()) {
          return { 
            id: apuestaSnap.id, 
            ...apuestaSnap.data(),
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
        const { esValido, mensajeError } = validarFilas(
          filasFijas, 
          filasExtra, 
          route.query.tipo || 'normal' // Pasar el tipo de jugada
        );
        
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
        if (!(await validarAntesDeEnviar())) {
              toastStore.showToast(errorMessage.value, 'error', 2000, ErrorIcon)
            return
        }
        const resultado = await guardarDatos()
        
        if (resultado.success) {
          if (modoEdicion.value) {
            toastStore.showToast(
              isOnline.value ? 'Jugada actualizada' : 'Cambios guardados (offline)',
              'success',
              1500,
              CheckIcon
            )
            setTimeout(() => {
              limpiarCampos()
              setNombre('')
            }, 1500)
          } 
          else {
            limpiarCampos()
            setNombre('')
            toastStore.showToast(
              isOnline.value ? 'Jugada enviada' : 'Jugada guardada (offline)',
              'success',
              1500,
              CheckIcon
            )
          }
          router.push(`/lista/${route.params.id}`)
        } else {
          toastStore.showToast(
            resultado.message || 'Error al guardar',
            'error',
            2000,
            ErrorIcon
          )
        }
      }
      catch (error) {
        toastStore.showToast(
          'Ocurrió un error inesperado',
          'error',
          2000,
          ErrorIcon
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