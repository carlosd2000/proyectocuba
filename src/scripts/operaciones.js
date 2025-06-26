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
export function validarFilas(fijas, extras, tipoJugada = 'normal') {
  const todasFilas = [...fijas.value, ...extras.value];
  const tieneCirculoSolo = fijas.value[2]?.circuloSolo !== '' && fijas.value[2]?.circuloSolo !== null;
  
    if (tipoJugada === 'parlet' || tipoJugada === 'candado') {
    const cuadradosConDatos = todasFilas.filter(fila => 
      fila.cuadrado !== '' && fila.cuadrado !== null
    ).length;
    
    if (cuadradosConDatos < 2) {
      return {
        esValido: false,
        circulosInvalidos: false,
        cuadradosInvalidos: true,
        circuloSoloInvalido: false,
        // Añadimos esta propiedad nueva
        mensajeEspecial: tipoJugada === 'parlet' 
          ? 'Deben haber dos números para un parlet' 
          : 'Los candados son al menos dos números'
      };
    }
  }

  // 1. Validar que los círculos normales tengan su cuadrado
  const circulosInvalidos = todasFilas.some(fila => {
    const tieneCirculosNormales = (fila.circulo1 !== '' && fila.circulo1 !== null) || 
                                (fila.circulo2 !== '' && fila.circulo2 !== null);
    const sinCuadrado = !(fila.cuadrado !== '' && fila.cuadrado !== null);
    return tieneCirculosNormales && sinCuadrado;
  });

  const cuadradosInvalidos = !tieneCirculoSolo && todasFilas.some(fila => {
    const tieneCuadrado = fila.cuadrado !== '' && fila.cuadrado !== null;
    const sinCirculos = !(fila.circulo1 !== '' || fila.circulo2 !== '');
    return tieneCuadrado && sinCirculos;
  });

  // 2. Validar que circuloSolo tenga al menos 1 cuadrado
  const circuloSoloInvalido = tieneCirculoSolo && 
    !todasFilas.some(fila => fila.cuadrado !== '' && fila.cuadrado !== null);

  // 3. Validar que haya al menos un dato válido
  const hayDatosValidos = todasFilas.some(fila => {
    const tieneCuadrado = fila.cuadrado !== '' && fila.cuadrado !== null;
    const tieneCirculos = (fila.circulo1 !== '' && fila.circulo1 !== null) || 
                         (fila.circulo2 !== '' && fila.circulo2 !== null);
    return tieneCuadrado && (tieneCirculos || tieneCirculoSolo);
  }) || (tieneCirculoSolo && !circuloSoloInvalido);

  return {
    esValido: hayDatosValidos && !circulosInvalidos && !cuadradosInvalidos && !circuloSoloInvalido,
    circulosInvalidos,
    cuadradosInvalidos,
    circuloSoloInvalido
  };
}

/**
 * Detecta si hay una apuesta incrementativa y la expande.
 * @param {Array} filas Array de filas (fijas o extra)
 * @returns {Array} Array de filas procesadas (expandidas si aplica)
 */
export function expandirApuestasIncrementativas(filas) {
  // Busca los índices y valores de los cuadrados no vacíos
  const indices = filas
    .map((fila, idx) => ({ idx, val: fila.cuadrado }))
    .filter(f => f.val !== '' && f.val !== null && !isNaN(f.val));

  // Solo aplica si hay al menos dos cuadrados llenos y hay vacíos entre ellos
  if (indices.length >= 2) {
    for (let i = 0; i < indices.length - 1; i++) {
      const idxInicio = indices[i].idx;
      const idxFin = indices[i + 1].idx;
      const actual = parseInt(indices[i].val, 10);
      const siguiente = parseInt(indices[i + 1].val, 10);

      // Solo si la diferencia es múltiplo de 10 y hay vacíos entre ellos
      if (
        siguiente > actual &&
        (siguiente - actual) % 10 === 0 &&
        idxFin - idxInicio > 1
      ) {
        // Exigir que circulo1 y circulo2 sean iguales en ambos extremos
        const baseCirculo1 = filas[idxInicio].circulo1;
        const baseCirculo2 = filas[idxInicio].circulo2;
        const finCirculo1 = filas[idxFin].circulo1;
        const finCirculo2 = filas[idxFin].circulo2;

        // Si no son iguales, NO expandir
        if (baseCirculo1 !== finCirculo1 || baseCirculo2 !== finCirculo2) {
          // No cumple la condición, retorna las filas originales no vacías
          return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
        }

        // Generar todos los números intermedios
        const apuestas = [];
        for (let n = actual; n <= siguiente; n += 10) {
          apuestas.push({
            cuadrado: n.toString().padStart(2, '0'),
            circulo1: baseCirculo1,
            circulo2: baseCirculo2
            // NO copiar circuloSolo
          });
        }
        return apuestas;
      }
    }
  }
  // Si no hay incrementativa, retorna las filas originales no vacías
  return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
}