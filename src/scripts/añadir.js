// src/scripts/añadir.js

import { db, auth } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { filasFijas, filasExtra, calcularTotales } from './operaciones'

// Variables compartidas
let nombreTemporal = 'SinNombre'
let tipoOrigen = 'tiros' // Valor por defecto
let horarioSeleccionado = 'Dia' // Valor por defecto

// Actualiza el nombre del jugador
export function setNombre(nombre) {
  nombreTemporal = nombre?.trim() || 'SinNombre'
}

// Define desde qué componente se originó la jugada
export function setTipoOrigen(tipo) {
  tipoOrigen = tipo || 'tiros'
}

// Define el horario seleccionado
export function setHorario(horario) {
  horarioSeleccionado = horario || 'Dia'
}

// Guarda los datos válidos en Firebase
export async function guardarDatos() {
  try {
    const datosAGuardar = []

    // Calcular los totales
    const { col3, col4, col5 } = calcularTotales(filasFijas, filasExtra)
    const totalGlobal = col3 + col4 + col5

    // Obtener circuloSolo desde la fila 3
    const circuloSolo = filasFijas.value[2]?.circuloSolo
    const circuloSoloValido = circuloSolo !== '' && circuloSolo !== null && !isNaN(circuloSolo)

    // Solo aplicamos "/candado" si el tipoOrigen es "tiros"
    let tipoFinal = tipoOrigen;
    if (circuloSoloValido && tipoOrigen === "tiros") {  // ⚠️ Solo para "tiros"
      tipoFinal = `${tipoOrigen}/candado`;  // Ej: "tiros/candado"
    }

    // Procesar filas fijas
    filasFijas.value.forEach((fila, index) => {
      if (index === 2) {
        const { circuloSolo, ...resto } = fila
        fila = resto
      }

      const filaProcesada = { tipo: 'fija', fila: index + 1 }
      let tieneDato = false

      for (let clave in fila) {
        const valor = fila[clave]
        if (valor !== '' && valor !== null && !isNaN(valor)) {
          filaProcesada[clave] = Number(valor)
          tieneDato = true
        }
      }

      if (tieneDato) datosAGuardar.push(filaProcesada)
    })

    // Procesar filas extra
    filasExtra.value.forEach((fila, index) => {
      const filaProcesada = { tipo: 'extra', fila: index + 1 }
      let tieneDato = false

      for (let clave in fila) {
        const valor = fila[clave]
        if (valor !== '' && valor !== null && !isNaN(valor)) {
          filaProcesada[clave] = Number(valor)
          tieneDato = true
        }
      }

      if (tieneDato) datosAGuardar.push(filaProcesada)
    })

    if (datosAGuardar.length === 0 && !circuloSoloValido && totalGlobal === 0) {
      return { success: false, message: 'No se ingresaron datos válidos.' }
    }

    // Documento final
    const docAGuardar = {
      nombre: nombreTemporal,
      totalGlobal,
      datos: datosAGuardar,
      creadoEn: serverTimestamp(),
      id_listero: auth.currentUser?.uid || 'sin-autenticacion',
      tipo: tipoFinal, // Usamos el tipo final aquí
      horario: horarioSeleccionado // Añadimos el horario aquí
    }

    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo)
    }

    await addDoc(collection(db, 'apuestas'), docAGuardar)

    return { success: true, message: 'Datos guardados correctamente' }
  } catch (error) {
    console.error('Error guardando en Firebase:', error)
    return { success: false, message: error.message }
  }
}