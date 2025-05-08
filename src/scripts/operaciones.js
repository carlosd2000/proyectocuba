// src/scripts/operaciones.js

import { ref } from 'vue'

// Datos compartidos
export const nombreUsuario = ref('')

export const filasFijas = ref([
  { cuadrado: '', circulo1: '', circulo2: '' },
  { cuadrado: '', circulo1: '', circulo2: '' },
  { cuadrado: '', circulo1: '', circulo2: '', circuloSolo: '' },
  { cuadrado: '', circulo1: '', circulo2: '' },
  { cuadrado: '', circulo1: '', circulo2: '' },
])

export const filasExtra = ref([])

export const agregarFila = () => {
  filasExtra.value.push({ cuadrado: '', circulo1: '', circulo2: '' })
}

// Función para limpiar todos los campos
export const limpiarCampos = () => {
  filasFijas.value = [
    { cuadrado: '', circulo1: '', circulo2: '' },
    { cuadrado: '', circulo1: '', circulo2: '' },
    { cuadrado: '', circulo1: '', circulo2: '', circuloSolo: '' },
    { cuadrado: '', circulo1: '', circulo2: '' },
    { cuadrado: '', circulo1: '', circulo2: '' },
  ]
  filasExtra.value = []
  nombreUsuario.value = '' // limpia el campo de nombre
}

// Cálculo de totales
export function calcularTotales(fijas, extras) {
  const fijasValue = fijas.value || []
  const extrasValue = extras.value || []

  const col3 = fijasValue.reduce(
    (acc, fila) => acc + (fila.circulo1 !== '' ? Number(fila.circulo1) : 0), 0
  ) + extrasValue.reduce(
    (acc, fila) => acc + (fila.circulo1 !== '' ? Number(fila.circulo1) : 0), 0
  )

  const col4 = fijasValue.reduce(
    (acc, fila) => acc + (fila.circulo2 !== '' ? Number(fila.circulo2) : 0), 0
  ) + extrasValue.reduce(
    (acc, fila) => acc + (fila.circulo2 !== '' ? Number(fila.circulo2) : 0), 0
  )

  const col5 = fijasValue[2]?.circuloSolo !== '' ? Number(fijasValue[2].circuloSolo) : 0

  return { col3, col4, col5 }
}

// En operaciones.js
export function validarFilas(fijas, extras) {
  const todasFilas = [...fijas.value, ...extras.value];
  const tieneCirculoSolo = fijas.value[2]?.circuloSolo !== '' && fijas.value[2]?.circuloSolo !== null;

  // 1. Validar que los cuadrados tengan al menos un círculo (excepto si hay circuloSolo)
  const filasInvalidas = todasFilas.some(fila => {
    const tieneCuadrado = fila.cuadrado !== '' && fila.cuadrado !== null;
    const tieneCirculos = (fila.circulo1 !== '' && fila.circulo1 !== null) || 
                         (fila.circulo2 !== '' && fila.circulo2 !== null);
    
    // Un cuadrado es inválido si:
    // - Tiene valor PERO no tiene círculos
    // - Y NO estamos en el caso especial del circuloSolo
    return tieneCuadrado && !tieneCirculos && !tieneCirculoSolo;
  });

  // 2. Validar que haya al menos algún dato para enviar
  const hayDatosValidos = todasFilas.some(fila => {
    const tieneCuadrado = fila.cuadrado !== '' && fila.cuadrado !== null;
    const tieneCirculos = (fila.circulo1 !== '' && fila.circulo1 !== null) || 
                         (fila.circulo2 !== '' && fila.circulo2 !== null);
    
    return tieneCuadrado && tieneCirculos;
  }) || tieneCirculoSolo;

  return {
    esValido: hayDatosValidos && !filasInvalidas,
    hayDatosValidos,
    filasInvalidas,
    tieneCirculoSolo
  };
}