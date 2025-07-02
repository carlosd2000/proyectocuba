import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
  filasFijas,
  filasExtra,
  agregarFila,
  limpiarCampos,
  nombreUsuario,
  obtenerFilasCombinadas
} from './operaciones.js'
import { setNombre, setTipoOrigen, setModoEdicion } from './añadir.js'
import { soloEnteros, cargarDatosEdicion as cargarDatosEdicionCompartida } from './inputsFunction.js'

// --- FUNCIÓN GLOBAL PARA LA FLECHA ENTRE TODAS LAS FILAS ---
export function claseImagenSiHayEspacioGlobal(indexGlobal, circuloKey = null) {
  const lista = obtenerFilasCombinadas();

  // Encuentra los índices de los cuadros llenos
  const indicesLlenos = lista
    .map((item, i) => ({ index: i, valor: item.cuadrado }))
    .filter(obj => obj.valor && obj.valor.toString().trim() !== '')
    .map(obj => obj.index);

  if (indicesLlenos.length >= 2) {
    for (let i = 0; i < indicesLlenos.length - 1; i++) {
      const idxInicio = indicesLlenos[i];
      const idxFin = indicesLlenos[i + 1];
      const actual = parseInt(lista[idxInicio].cuadrado, 10);
      const siguiente = parseInt(lista[idxFin].cuadrado, 10);

      // --- Incrementativas ---
      if (
        siguiente > actual &&
        (siguiente - actual) % 10 === 0 &&
        idxFin - idxInicio > 1
      ) {
        if (!circuloKey) {
          if (idxInicio < indexGlobal && indexGlobal < idxFin) {
            return 'input-con-imagen';
          }
        } else {
          const baseValor = String(lista[idxInicio][circuloKey] ?? '');
          const finValor = String(lista[idxFin][circuloKey] ?? '');
          if (
            baseValor === finValor &&
            baseValor !== '' &&
            idxInicio < indexGlobal && indexGlobal < idxFin
          ) {
            return 'input-con-imagen';
          }
        }
      }

      // --- Secuenciales ---
      if (
        siguiente > actual &&
        (siguiente - actual) <= 19 &&
        idxFin - idxInicio > 1
      ) {
        // Verifica que no haya ningún cuadrado lleno entre los extremos
        let hayIntermedioLleno = false;
        for (let j = idxInicio + 1; j < idxFin; j++) {
          if (lista[j].cuadrado && lista[j].cuadrado.toString().trim() !== '') {
            hayIntermedioLleno = true;
            break;
          }
        }
        if (!hayIntermedioLleno) {
          if (!circuloKey) {
            if (idxInicio < indexGlobal && indexGlobal < idxFin) {
              return 'input-con-imagen';
            }
          } else {
            const baseValor = String(lista[idxInicio][circuloKey] ?? '');
            const finValor = String(lista[idxFin][circuloKey] ?? '');
            if (
              baseValor === finValor &&
              baseValor !== '' &&
              idxInicio < indexGlobal && indexGlobal < idxFin
            ) {
              return 'input-con-imagen';
            }
          }
        }
      }
    }
  }
  return '';
}

// --- COMPOSABLE PRINCIPAL ---
export function useInputs(props = {}) {
  setTipoOrigen('tiros')

  // Cargar datos de edición usando función compartida
  const cargarDatosEdicion = () => {
    if (!props || !props.datosEdicion) return
    cargarDatosEdicionCompartida(
      props,
      nombreUsuario,
      filasFijas,
      filasExtra,
      5 // longitud de filas fijas
    )
    if (props.datosEdicion?.circuloSolo) {
      filasFijas.value[2].circuloSolo = props.datosEdicion.circuloSolo.toString()
    }
  }

  // Reactivo: actualiza si los datos de edición cambian dinámicamente
  watch(() => props?.datosEdicion, (nuevosDatos) => {
    if (props?.modoEdicion && nuevosDatos) {
      cargarDatosEdicion()
    }
  }, { deep: true, immediate: true })

  // Sincroniza nombre con añadir.js
  watch(nombreUsuario, (nuevo) => {
    setNombre(nuevo)
  })

  onMounted(() => {
    if (props?.modoEdicion && props?.idEdicion) {
      setModoEdicion(true, props.idEdicion)
    }
  })

  onUnmounted(() => {
    limpiarCampos()
    setModoEdicion(false, '')
  })

  return {
    filasFijas,
    filasExtra,
    agregarFila,
    limpiarCampos,
    nombreUsuario,
    soloEnteros,
    claseImagenSiHayEspacioGlobal, // <-- Exporta la función global
  }
}