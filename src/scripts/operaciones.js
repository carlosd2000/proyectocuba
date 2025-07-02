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
export function calcularTotales(filasFijas, filasExtra) {
  // Aplica la expansión antes de sumar
  const apuestasFijas = expandirApuestasGeneral(filasFijas.value ?? filasFijas)
  const apuestasExtra = expandirApuestasGeneral(filasExtra.value ?? filasExtra)

  // Suma los valores de los círculos de todas las apuestas expandidas
  let col3 = 0, col4 = 0
  for (const fila of [...apuestasFijas, ...apuestasExtra]) {
    col3 += Number(fila.circulo1) || 0
    col4 += Number(fila.circulo2) || 0
  }

  // col5 solo toma el valor de circuloSolo del tercer cuadrado de filasFijas
  let col5 = 0
  if (
    (filasFijas.value ?? filasFijas)[2] &&
    (filasFijas.value ?? filasFijas)[2].circuloSolo !== '' &&
    (filasFijas.value ?? filasFijas)[2].circuloSolo !== null
  ) {
    col5 = Number((filasFijas.value ?? filasFijas)[2].circuloSolo) || 0
  }

  return { col3, col4, col5 }
}

// En operaciones.js
export function validarFilas(fijas, extras, tipoJugada = 'normal') {
  const todasFilas = [...fijas.value, ...extras.value];
  const tieneCirculoSolo = fijas.value[2]?.circuloSolo !== '' && fijas.value[2]?.circuloSolo !== null;
  const cuadradosConDatos = todasFilas.filter(fila => fila.cuadrado !== '' && fila.cuadrado !== null).length;

  if (tipoJugada === 'normal' && tieneCirculoSolo && cuadradosConDatos < 2) {
    return {
      esValido: false,
      circulosInvalidos: false,
      cuadradosInvalidos: true,
      circuloSoloInvalido: true,
      mensajeEspecial: 'Los candados son al menos dos números'
    };
  }

  // 2. Validación para PARLET/CANDADO (siempre requieren 2+ cuadrados)
  if ((tipoJugada === 'parlet' || tipoJugada === 'candado') && cuadradosConDatos < 2) {
    return {
      esValido: false,
      circulosInvalidos: false,
      cuadradosInvalidos: true,
      circuloSoloInvalido: false,
      mensajeEspecial: tipoJugada === 'parlet' 
        ? 'Deben haber dos números para un parlet' 
        : 'Los candados son al menos dos números'
    };
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
    esValido: hayDatosValidos && !circulosInvalidos && !cuadradosInvalidos,
    circulosInvalidos,
    cuadradosInvalidos,
    circuloSoloInvalido: false
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
// ...dentro de expandirApuestasIncrementativas, donde está el for (let n = actual; n <= siguiente; n += 10) ...
for (let n = actual; n <= siguiente; n += 10) {
  let apuesta = {
    cuadrado: n.toString().padStart(2, '0'),
    circulo1: baseCirculo1,
    circulo2: baseCirculo2
  };
if (filas[2] && filas[2].circuloSolo !== undefined && filas[2].circuloSolo !== '') {
  apuesta.circuloSolo = filas[2].circuloSolo;
}
  apuestas.push(apuesta);
}
        return apuestas;
      }
    }
  }
  // Si no hay incrementativa, retorna las filas originales no vacías
  return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
}

/**
 * Expande apuestas secuenciales de uno en uno si la diferencia es <= 19 y hay espacio entre los cuadros.
 * @param {Array} filas Array de filas (fijas o extra)
 * @returns {Array} Array de filas procesadas (expandidas si aplica)
 */
export function expandirApuestasSecuenciales(filas) {
  const indices = filas
    .map((fila, idx) => ({ idx, val: fila.cuadrado }))
    .filter(f => f.val !== '' && f.val !== null && !isNaN(f.val));

  if (indices.length >= 2) {
    for (let i = 0; i < indices.length - 1; i++) {
      const idxInicio = indices[i].idx;
      const idxFin = indices[i + 1].idx;
      const actual = parseInt(indices[i].val, 10);
      const siguiente = parseInt(indices[i + 1].val, 10);

      // Solo si la diferencia es > 0 y <= 19 y hay vacíos entre ellos
      if (
        siguiente > actual &&
        (siguiente - actual) <= 19 &&
        idxFin - idxInicio > 1
      ) {
        // Exigir que circulo1 y circulo2 sean iguales en ambos extremos
        const baseCirculo1 = filas[idxInicio].circulo1;
        const baseCirculo2 = filas[idxInicio].circulo2;
        const finCirculo1 = filas[idxFin].circulo1;
        const finCirculo2 = filas[idxFin].circulo2;

        if (baseCirculo1 !== finCirculo1 || baseCirculo2 !== finCirculo2) {
          return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
        }

        // Verifica que no haya ningún cuadrado lleno entre los extremos
        for (let j = idxInicio + 1; j < idxFin; j++) {
          if (filas[j].cuadrado !== '' && filas[j].cuadrado !== null && !isNaN(filas[j].cuadrado)) {
            return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
          }
        }

        // Generar todos los números intermedios de uno en uno
        const apuestas = [];
// ...dentro de expandirApuestasSecuenciales, donde está el for (let n = actual; n <= siguiente; n++) ...
for (let n = actual; n <= siguiente; n++) {
  let apuesta = {
    cuadrado: n.toString().padStart(2, '0'),
    circulo1: baseCirculo1,
    circulo2: baseCirculo2
  };
if (filas[2] && filas[2].circuloSolo !== undefined && filas[2].circuloSolo !== '') {
  apuesta.circuloSolo = filas[2].circuloSolo;
}
  apuestas.push(apuesta);
}
        return apuestas;
      }
    }
  }
  return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
}

/**
 * Expande apuestas usando la lógica de 10 en 10 o de uno en uno.
 * @param {Array} filas
 * @returns {Array}
 */
export function expandirApuestasGeneral(filas) {
  // Intenta primero la expansión de 10 en 10
  const inc = expandirApuestasIncrementativas(filas);
  if (
    inc.length > 2 &&
    Math.abs(parseInt(inc[1].cuadrado) - parseInt(inc[0].cuadrado)) === 10
  ) {
    return inc;
  }
  // Si no, intenta la expansión secuencial de uno en uno
  const sec = expandirApuestasSecuenciales(filas);
  if (
    sec.length > 2 &&
    Math.abs(parseInt(sec[1].cuadrado) - parseInt(sec[0].cuadrado)) === 1
  ) {
    return sec;
  }
  // Si ninguna aplica, retorna los llenos
  return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
}



// Une filas fijas y extra en una sola lista
export function obtenerFilasCombinadas() {
  return [...filasFijas.value, ...filasExtra.value];
}

// Expansión combinada (incrementativas y secuenciales sobre todas las filas)
export function expandirApuestasGeneralCombinadas() {
  const filas = obtenerFilasCombinadas();

  // --- Incrementativas ---
  const inc = expandirApuestasIncrementativas(filas);
  if (
    inc.length > 2 &&
    Math.abs(parseInt(inc[1].cuadrado) - parseInt(inc[0].cuadrado)) === 10
  ) {
    return inc;
  }
  // --- Secuenciales ---
  const sec = expandirApuestasSecuenciales(filas);
  if (
    sec.length > 2 &&
    Math.abs(parseInt(sec[1].cuadrado) - parseInt(sec[0].cuadrado)) === 1
  ) {
    return sec;
  }
  // Si ninguna aplica, retorna los llenos
  return filas.filter(f => f.cuadrado !== '' && f.cuadrado !== null && !isNaN(f.cuadrado));
}

// Totales combinados
export function calcularTotalesCombinados() {
  const apuestas = expandirApuestasGeneralCombinadas();
  let col3 = 0, col4 = 0, col5 = 0;
  for (const fila of apuestas) {
    col3 += Number(fila.circulo1) || 0;
    col4 += Number(fila.circulo2) || 0;
  }
  // col5 solo toma el valor de circuloSolo del tercer cuadrado de filasFijas
  if (
    filasFijas.value[2] &&
    filasFijas.value[2].circuloSolo !== '' &&
    filasFijas.value[2].circuloSolo !== null
  ) {
    col5 = Number(filasFijas.value[2].circuloSolo) || 0;
  }
  return { col3, col4, col5 };
}