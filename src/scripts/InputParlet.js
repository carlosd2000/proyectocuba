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

export function useInputParlet(props) {
  setTipoOrigen('parlet') // Ajusta según sea el tipo que quieres

  const cargarDatosEdicion = () => {
    cargarDatosEdicionCompartida(
      props,
      nombreUsuario,
      filasFijas,
      filasExtra,
      5 // longitud filas fijas
    )
    // Manejo correcto del valor circuloSolo, acepta 0 y '' sin ignorar
    if (props.datosEdicion?.circuloSolo != null) {
      filasFijas.value[2].circuloSolo = props.datosEdicion.circuloSolo.toString()
    } else {
      filasFijas.value[2].circuloSolo = ''
    }
  }

  watch(() => props.datosEdicion, (nuevosDatos) => {
    if (props.modoEdicion && nuevosDatos) {
      cargarDatosEdicion()
    }
  }, { deep: true, immediate: true })

  watch(nombreUsuario, (nuevo) => {
    setNombre(nuevo)
  })

  onMounted(() => {
    if (props.modoEdicion && props.idEdicion) {
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
    soloEnteros
  }
}
