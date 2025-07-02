import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
  filasFijas,
  filasExtra,
  agregarFila,
  limpiarCampos,
  nombreUsuario
} from './operaciones.js'
import { setNombre, setTipoOrigen, setModoEdicion } from './añadir.js'
import { soloEnteros, cargarDatosEdicion as cargarDatosEdicionCompartida } from './inputsFunction.js'

export function useInputs(props = {}) { // Añade valor por defecto para props
  setTipoOrigen('tiros')

  // Cargar datos de edición usando función compartida
  const cargarDatosEdicion = () => {
    if (!props || !props.datosEdicion) return // Verificación añadida
    
    cargarDatosEdicionCompartida(
      props,
      nombreUsuario,
      filasFijas,
      filasExtra,
      5 // longitud de filas fijas
    )
    
    // Lógica específica para círculo solo (si aplica)
    if (props.datosEdicion?.circuloSolo) {
      filasFijas.value[2].circuloSolo = props.datosEdicion.circuloSolo.toString()
    }
  }

function claseImagenSiHayEspacio(index, tipo, circuloKey = null) {
  const lista = tipo === 'fija' ? filasFijas.value : filasExtra.value

  // Encuentra los índices de los cuadros llenos
  const indicesLlenos = lista
    .map((item, i) => ({ index: i, valor: item.cuadrado }))
    .filter(obj => obj.valor && obj.valor.toString().trim() !== '')
    .map(obj => obj.index)

  if (indicesLlenos.length >= 2) {
    for (let i = 0; i < indicesLlenos.length - 1; i++) {
      const idxInicio = indicesLlenos[i]
      const idxFin = indicesLlenos[i + 1]
      const actual = parseInt(lista[idxInicio].cuadrado, 10)
      const siguiente = parseInt(lista[idxFin].cuadrado, 10)

      // --- Condición para incrementativas (de 10 en 10) ---
      if (
        siguiente > actual &&
        (siguiente - actual) % 10 === 0 &&
        idxFin - idxInicio > 1
      ) {
        if (!circuloKey) {
          if (idxInicio < index && index < idxFin) {
            return 'input-con-imagen'
          }
        } else {
          const baseValor = String(lista[idxInicio][circuloKey] ?? '')
          const finValor = String(lista[idxFin][circuloKey] ?? '')
          if (
            baseValor === finValor &&
            baseValor !== '' &&
            idxInicio < index && index < idxFin
          ) {
            return 'input-con-imagen'
          }
        }
      }

      // --- Condición para secuenciales (de uno en uno, diferencia <= 19, hay cuadros vacíos entre extremos) ---
      if (
        siguiente > actual &&
        (siguiente - actual) <= 19 &&
        idxFin - idxInicio > 1
      ) {
        // Verifica que no haya ningún cuadrado lleno entre los extremos
        let hayIntermedioLleno = false
        for (let j = idxInicio + 1; j < idxFin; j++) {
          if (lista[j].cuadrado && lista[j].cuadrado.toString().trim() !== '') {
            hayIntermedioLleno = true
            break
          }
        }
        if (!hayIntermedioLleno) {
          if (!circuloKey) {
            if (idxInicio < index && index < idxFin) {
              return 'input-con-imagen'
            }
          } else {
            const baseValor = String(lista[idxInicio][circuloKey] ?? '')
            const finValor = String(lista[idxFin][circuloKey] ?? '')
            if (
              baseValor === finValor &&
              baseValor !== '' &&
              idxInicio < index && index < idxFin
            ) {
              return 'input-con-imagen'
            }
          }
        }
      }
    }
  }
  return ''
}

  // Reactivo: actualiza si los datos de edición cambian dinámicamente
  watch(() => props?.datosEdicion, (nuevosDatos) => { // Añade ?. para seguridad
    if (props?.modoEdicion && nuevosDatos) {
      cargarDatosEdicion()
    }
  }, { deep: true, immediate: true })

  // Sincroniza nombre con añadir.js
  watch(nombreUsuario, (nuevo) => {
    setNombre(nuevo)
  })

  onMounted(() => {
    if (props?.modoEdicion && props?.idEdicion) { // Añade ?. para seguridad
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
    claseImagenSiHayEspacio,
  }
}