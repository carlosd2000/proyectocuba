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

    // ... (mantén el resto de esta función igual)
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