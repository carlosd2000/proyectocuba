// scripts/validadorCampos.js

import { reactive, ref } from 'vue'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { obtenerBancoPadre } from './FunctionBancoPadre'

// Importa el toastStore y el ícono de alerta
import { useToastStore } from '../stores/toast'
import Alert from '../assets/icons/alert.svg'

// Estado reactivo compartido
export const camposInvalidos = reactive({
  circulo1: new Set(),
  circulo2: new Set(),
  circuloSolo: false,
})

export const valorBote = ref(0)
export const boteActivo = ref(true)

// Cargar info del banco si no está cargado en localStorage
export async function cargarInfoBancoSiNoExiste() {
  // Leer respaldo del localStorage primero
  const valorGuardado = localStorage.getItem('valorBote')
  const activoGuardado = localStorage.getItem('boteActivo')

  if (valorGuardado !== null) {
    valorBote.value = Number(valorGuardado)
  }

  if (activoGuardado !== null) {
    boteActivo.value = activoGuardado === 'true'
  }

  try {
    const bancoId = await obtenerBancoPadre()
    const docSnap = await getDoc(doc(db, 'bancos', bancoId))

    if (docSnap.exists()) {
      const data = docSnap.data()
      valorBote.value = data.bote ?? 0
      boteActivo.value = data.boteActivo ?? false

      // Actualizar respaldo
      localStorage.setItem('valorBote', valorBote.value)
      localStorage.setItem('boteActivo', boteActivo.value ? 'true' : 'false')
    }
  } catch (error) {
    console.warn('No se pudo cargar el banco desde Firestore:', error.message)
    // No hacer nada más, ya tenemos los valores de localStorage
  }
}


// Validar campos
export function validarCampo(valor, campo, index = null) {
  const toastStore = useToastStore()
  const numero = Number(valor)
  const limite = valorBote.value
  const activo = boteActivo.value

  const esVisualmenteInvalido = !isNaN(numero) && numero > limite
  const esCritico = esVisualmenteInvalido && !activo

  // 🔴 Mostrar rojo visual aunque el bote esté activo
  if (campo === 'circuloSolo') {
    camposInvalidos.circuloSolo = esVisualmenteInvalido
  } else if (index !== null) {
    const set = camposInvalidos[campo]
    if (esVisualmenteInvalido) {
      set.add(index)
    } else {
      set.delete(index)
    }
  }

  // 🔔 Mostrar toast solo si es un error crítico
  if (esCritico) {
    toastStore.showToast(
      `Límite alcanzado !! El valor ingresado supera $${limite} al límite permitido para esta jugada.`,
      'double-message',
      5000,
      Alert
    )
  } else if (esVisualmenteInvalido && activo) {
    toastStore.showToast(
      `Tu tirada superó el límite !! Se juega $${limite} como valor máximo, el excedente se va directo al bote.`,
      'double-message',
      5000,
      Alert
    )
  }
}


// Saber si hay errores
export function hayErroresGlobal() {
  return (
    camposInvalidos.circuloSolo ||
    camposInvalidos.circulo1.size > 0 ||
    camposInvalidos.circulo2.size > 0
  )
}

export function hayErroresCriticos() {
  return !boteActivo.value && hayErroresGlobal()
}

export function resetCamposInvalidos() {
  camposInvalidos.circulo1.clear()
  camposInvalidos.circulo2.clear()
  camposInvalidos.circuloSolo = false
}
