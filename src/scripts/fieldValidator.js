// scripts/validadorCampos.js

import { reactive, ref } from 'vue'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'

// Importa el toastStore y el ícono de alerta
import { useToastStore } from '../stores/toast'
import Alert from '../assets/icons/alert.svg'

// Estado reactivo compartido
export const camposInvalidos = reactive({
  circulo1: new Set(),
  circulo2: new Set(),
  circuloSolo: false,
  numerosRestringidos: new Map(),
})

export const valorBote = ref(0)
export const boteActivo = ref(true)
export const superaLimiteGeneral = ref(false)
export const horarioActual = ref(null)

let errorCallback = null

export function setErrorCallback(callback) {
  errorCallback = callback
}

// Cargar info del banco si no está cargado en localStorage
export async function cargarInfoBancoSiNoExiste(bancoId) {
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

export let configHorarioActual = reactive({
  boteActivo: false,
  limitePorJugada: 0,
  boteMonto: {
    Fijo: 0,
    Corrido: 0,
    Parlet: 0
  }
})

// Función para establecer la configuración del horario actual
export function setConfigHorario(config, horario) {
  configHorarioActual.boteActivo = config?.boteActivo || false
  configHorarioActual.limitePorJugada = config?.limitePorJugada || 0
  configHorarioActual.boteMonto.Fijo = config?.boteMonto?.Fijo || 0
  configHorarioActual.boteMonto.Corrido = config?.boteMonto?.Corrido || 0
  configHorarioActual.boteMonto.Parlet = config?.boteMonto?.Parlet || 0

  horarioActual.value = horario
}

// Validar campos
export function validarCampo(valor, campo, index = null) {
  const toastStore = useToastStore()
  const numero = Number(valor)

  // Determinar el límite según el tipo de campo
  let limite = configHorarioActual.limitePorJugada || 0
  let montoBote = 0
  
  if (campo === 'circulo1') {
    montoBote = configHorarioActual.boteMonto.Fijo
  } else if (campo === 'circulo2') {
    montoBote = configHorarioActual.boteMonto.Corrido
  } else if (campo === 'circuloSolo') {
    montoBote = configHorarioActual.boteMonto.Parlet
  }
  
  superaLimiteGeneral.value = !isNaN(numero) && numero > limite
  const superaMontoBote = !isNaN(numero) && numero > montoBote
  const esVisualmenteInvalido = superaLimiteGeneral.value || (superaMontoBote && configHorarioActual.boteActivo)

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
  if (superaLimiteGeneral.value) {
    toastStore.showToast(
      `Límite alcanzado !! El valor ingresado supera $${limite} al límite permitido para esta jugada.`,
      'double-message',
      5000,
      Alert,
      'top'
    )
  } else if (superaMontoBote && configHorarioActual.boteActivo && !superaLimiteGeneral.value) {
    toastStore.showToast(
      `Tu tirada superó el límite !! Se juega $${montoBote} como valor máximo, el excedente se va directo al bote.`,
      'double-message',
      5000,
      Alert,
      'top'
    )
  }
}

// NUEVA FUNCIÓN: Validar número restringido
export function validarNumeroRestringido(numero, tipoCampo, index = null, tipoFila = null) {
  const configPagos = JSON.parse(localStorage.getItem('configPagos')) || {}
  const configHorario = horarioActual.value ? configPagos[horarioActual.value] : null
  
  if (!configHorario || !numero) {
    return { esValido: true, restriccion: null, mensaje: '' }
  }

  const numeroVal = Number(numero)
  if (isNaN(numeroVal)) {
    return { esValido: true, restriccion: null, mensaje: '' }
  }

  let campoConfig = ''
  if (tipoCampo === 'circulo1') campoConfig = 'Fijo'
  else if (tipoCampo === 'circulo2') campoConfig = 'Corrido'
  else return { esValido: true, restriccion: null, mensaje: '' }

  // Obtener los números restringidos
  let numerosNoJuega = [];
  let numerosLimitados = [];
  
  if (configHorario.noJuega && configHorario.noJuega[campoConfig]) {
    if (typeof configHorario.noJuega[campoConfig] === 'object' && 
        !Array.isArray(configHorario.noJuega[campoConfig])) {
      numerosNoJuega = Object.values(configHorario.noJuega[campoConfig]).map(Number);
    } else if (Array.isArray(configHorario.noJuega[campoConfig])) {
      numerosNoJuega = configHorario.noJuega[campoConfig].map(Number);
    }
  }
  
  if (configHorario.limitados && configHorario.limitados[campoConfig]) {
    if (typeof configHorario.limitados[campoConfig] === 'object' && 
        !Array.isArray(configHorario.limitados[campoConfig])) {
      numerosLimitados = Object.values(configHorario.limitados[campoConfig]).map(Number);
    } else if (Array.isArray(configHorario.limitados[campoConfig])) {
      numerosLimitados = configHorario.limitados[campoConfig].map(Number);
    }
  }

  // Verificar en noJuega (bloqueo completo) - ESTO DEBE BLOQUEAR EL BOTÓN
  if (numerosNoJuega.includes(numeroVal)) {
    const mensaje = `El número ${numeroVal} está bloqueado` // MENSAJE MODIFICADO PARA TEMPLATE
    
    if (errorCallback && index !== null && tipoFila) {
      errorCallback(index, tipoFila, mensaje, tipoCampo, 'NoJuega')
    }
    
    return {
      esValido: false, // CAMBIADO A false PARA BLOQUEAR EL BOTÓN
      restriccion: 'NoJuega',
      mensaje: mensaje
    }
  }

  // Verificar en limitados (restricciones especiales) - ESTO SOLO DEBE MOSTRAR MENSAJE
  if (numerosLimitados.includes(numeroVal)) {
    const mensaje = `El número ${numeroVal} será limitado para esta jugada` // MENSAJE MODIFICADO PARA TEMPLATE
    
    if (errorCallback && index !== null && tipoFila) {
      errorCallback(index, tipoFila, mensaje, tipoCampo, 'Limitado')
    }
    
    return {
      esValido: true, // MANTENER EN true PARA NO BLOQUEAR EL BOTÓN
      restriccion: 'Limitado',
      mensaje: mensaje
    }
  }
  return { esValido: true, restriccion: null, mensaje: '' }
}

// NUEVA FUNCIÓN: Validar campo completo (valor monetario + número)
export function validarCampoCompleto(valorMonetario, numero, tipoCampo, index = null) {
  const resultadoValidacion = validarCampo(valorMonetario, tipoCampo, index)
  const resultadoNumero = validarNumeroRestringido(numero, tipoCampo)
  
  // Combinar resultados
  return {
    ...resultadoValidacion,
    numeroRestringido: !resultadoNumero.esValido,
    restriccionNumero: resultadoNumero.restriccion,
    mensajeNumero: resultadoNumero.mensaje
  }
}

// NUEVA FUNCIÓN: Revalidar todos los números (para cuando cambia el horario)
// Modifica la función revalidarTodosLosNumeros
export function revalidarTodosLosNumeros(filasFijas, filasExtra) {
  camposInvalidos.numerosRestringidos.clear()
  
  // Validar filas fijas - SOLO cuando hay cuadrado Y al menos un círculo
  filasFijas.forEach((fila, index) => {
    if (fila.cuadrado) {
      const tieneCirculo1 = !!fila.circulo1;
      const tieneCirculo2 = !!fila.circulo2;
      
      if (tieneCirculo1) {
        const resultado1 = validarNumeroRestringido(fila.cuadrado, 'circulo1', index, 'fija')
        // SOLO AGREGAR A RESTRINGIDOS SI ES NoJuega (no válido)
        if (!resultado1.esValido) {
          camposInvalidos.numerosRestringidos.set(`fija-${index}-circulo1`, resultado1.mensaje)
        }
      }
      
      if (tieneCirculo2) {
        const resultado2 = validarNumeroRestringido(fila.cuadrado, 'circulo2', index, 'fija')
        // SOLO AGREGAR A RESTRINGIDOS SI ES NoJuega (no válido)
        if (!resultado2.esValido) {
          camposInvalidos.numerosRestringidos.set(`fija-${index}-circulo2`, resultado2.mensaje)
        }
      }
    }
  })
  
  // Validar filas extra - SOLO cuando hay cuadrado Y al menos un círculo
  filasExtra.forEach((fila, index) => {
    if (fila.cuadrado) {
      const tieneCirculo1 = !!fila.circulo1;
      const tieneCirculo2 = !!fila.circulo2;
      
      if (tieneCirculo1) {
        const resultado1 = validarNumeroRestringido(fila.cuadrado, 'circulo1', index, 'extra')
        // SOLO AGREGAR A RESTRINGIDOS SI ES NoJuega (no válido)
        if (!resultado1.esValido) {
          camposInvalidos.numerosRestringidos.set(`extra-${index}-circulo1`, resultado1.mensaje)
        }
      }
      
      if (tieneCirculo2) {
        const resultado2 = validarNumeroRestringido(fila.cuadrado, 'circulo2', index, 'extra')
        // SOLO AGREGAR A RESTRINGIDOS SI ES NoJuega (no válido)
        if (!resultado2.esValido) {
          camposInvalidos.numerosRestringidos.set(`extra-${index}-circulo2`, resultado2.mensaje)
        }
      }
    }
  })
  
  // Validar círculo solo - SOLO cuando hay cuadrado en fila 2 Y círculo solo
  if (filasFijas[2]?.cuadrado && filasFijas[2]?.circuloSolo) {
    const resultado = validarNumeroRestringido(filasFijas[2].cuadrado, 'circuloSolo', 2, 'fija')
    // SOLO AGREGAR A RESTRINGIDOS SI ES NoJuega (no válido)
    if (!resultado.esValido) {
      camposInvalidos.numerosRestringidos.set('circulo-solo', resultado.mensaje)
    }
  }
}

// AGREGAR después de la función validarNumeroRestringido:
export function verificarCombinacionParlet(combinacion, horario = null) {
  const configPagos = JSON.parse(localStorage.getItem('configPagos')) || {}
  const configHorario = horario ? configPagos[horario] : (horarioActual.value ? configPagos[horarioActual.value] : null)

  if (!configHorario) {
    return { esValido: true, restriccion: null, mensaje: '' }
  }

  // Obtener combinaciones de parlet restringidas
  let parletNoJuega = []
  let parletLimitados = []
  
  // Función para convertir arrays a strings con comas
  const convertirAString = (item) => {
    if (Array.isArray(item)) {
      return item.join(',') // Convertir [88, 99] a "88,99"
    }
    return item
  }

  // Obtener noJuega.Parlet
  if (configHorario.noJuega && configHorario.noJuega.Parlet) {
    
    if (configHorario.noJuega.Parlet.numeros && Array.isArray(configHorario.noJuega.Parlet.numeros)) {
      parletNoJuega = configHorario.noJuega.Parlet.numeros.map(convertirAString)
    } else if (Array.isArray(configHorario.noJuega.Parlet)) {
      parletNoJuega = configHorario.noJuega.Parlet.map(convertirAString)
    } else if (typeof configHorario.noJuega.Parlet === 'object') {
      parletNoJuega = Object.values(configHorario.noJuega.Parlet).map(convertirAString)
    }
  }
  
  // Obtener limitados.Parlet
  if (configHorario.limitados && configHorario.limitados.Parlet) {
    
    if (configHorario.limitados.Parlet.numeros && Array.isArray(configHorario.limitados.Parlet.numeros)) {
      parletLimitados = configHorario.limitados.Parlet.numeros.map(convertirAString)
    } else if (Array.isArray(configHorario.limitados.Parlet)) {
      parletLimitados = configHorario.limitados.Parlet.map(convertirAString)
    } else if (typeof configHorario.limitados.Parlet === 'object') {
      parletLimitados = Object.values(configHorario.limitados.Parlet).map(convertirAString)
    }
  }

  // Verificar ambas direcciones de la combinación (88,99 y 99,88)
  const partes = combinacion.split(',')
  if (partes.length !== 2) {
    return { esValido: true, restriccion: null, mensaje: '' }
  }
  
  const combinacionInversa = `${partes[1]},${partes[0]}`

  // Verificar en noJuega (bloqueo completo)
  if (parletNoJuega.includes(combinacion) || parletNoJuega.includes(combinacionInversa)) {
    return {
      esValido: false,
      restriccion: 'NoJuega',
      mensaje: `La combinación ${combinacion} está bloqueada`
    }
  }

  // Verificar en limitados (solo advertencia)
  if (parletLimitados.includes(combinacion) || parletLimitados.includes(combinacionInversa)) {
    return {
      esValido: true,
      restriccion: 'Limitado',
      mensaje: `La combinación ${combinacion} será limitada para esta jugada`
    }
  }

  return { esValido: true, restriccion: null, mensaje: '' }
}

// Saber si hay errores
export function hayErroresCriticos() {
  return superaLimiteGeneral.value
}

export function resetCamposInvalidos() {
  camposInvalidos.circulo1.clear()
  camposInvalidos.circulo2.clear()
  camposInvalidos.circuloSolo = false
  camposInvalidos.numerosRestringidos.clear()
  superaLimiteGeneral.value = false
}

export function resetEstadoCompleto() {
  resetCamposInvalidos();
  // Resetear otros estados si es necesario
  valorBote.value = 0
  boteActivo.value = true
  configHorarioActual.boteActivo = false
  configHorarioActual.limitePorJugada = 0
  configHorarioActual.boteMonto.Fijo = 0
  configHorarioActual.boteMonto.Corrido = 0
  configHorarioActual.boteMonto.Parlet = 0
}