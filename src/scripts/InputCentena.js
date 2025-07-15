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

export function useInputCentena(props = {}) {
  setTipoOrigen('centena')

  // Cargar datos de edición mejorado para manejar offline
  const cargarDatosEdicion = () => {
    if (!props) return;
    
    // 1. Buscar en datos directos (online)
    if (props.datosEdicion) {
      cargarDatosEdicionCompartida(props, nombreUsuario, filasFijas, filasExtra, 3);
      
      // SOLUCIÓN DEFINITIVA PARA CIRCULO SOLO
      if (props.datosEdicion.circuloSolo !== undefined) {
        filasFijas.value[2].circuloSolo = props.datosEdicion.circuloSolo?.toString() || '';
      } else if (props.datosEdicion.hasOwnProperty('circuloSolo')) {
        filasFijas.value[2].circuloSolo = '';
      }
      return;
    }

    // 2. Buscar en localStorage (offline)
    if (props?.modoEdicion && props?.idEdicion) {
      // Buscar en apuestas pendientes
      const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
      const apuesta = pendientes.find(p => p.uuid === props.idEdicion || p.id === props.idEdicion);
      
      if (apuesta) {
        cargarDatosEdicionCompartida(
          { datosEdicion: apuesta },
          nombreUsuario,
          filasFijas,
          filasExtra,
          3
        );
        
        // SOLUCIÓN DEFINITIVA PARA CIRCULO SOLO
        if (apuesta.circuloSolo !== undefined) {
          filasFijas.value[2].circuloSolo = apuesta.circuloSolo?.toString() || '';
        } else if (apuesta.hasOwnProperty('circuloSolo')) {
          filasFijas.value[2].circuloSolo = '';
        }
        return;
      }

      // Buscar en caché de Firebase
      const cacheStr = localStorage.getItem('apuestasFirebaseCache');
      if (cacheStr) {
        const cache = JSON.parse(cacheStr);
        const apuestaCache = cache.data?.find(a => a.id === props.idEdicion);
        
        if (apuestaCache) {
          cargarDatosEdicionCompartida(
            { datosEdicion: apuestaCache },
            nombreUsuario,
            filasFijas,
            filasExtra,
            3
          );
          
          // SOLUCIÓN DEFINITIVA PARA CIRCULO SOLO
          if (apuestaCache.circuloSolo !== undefined) {
            filasFijas.value[2].circuloSolo = apuestaCache.circuloSolo?.toString() || '';
          } else if (apuestaCache.hasOwnProperty('circuloSolo')) {
            filasFijas.value[2].circuloSolo = '';
          }
        }
      }
    }
  };

  // Reactivo: actualiza si los datos de edición cambian dinámicamente
  watch(() => props?.datosEdicion, (nuevosDatos) => {
    if (props?.modoEdicion && nuevosDatos) {
      cargarDatosEdicion();
    }
  }, { deep: true, immediate: true });

  // Watch adicional para cambios en idOriginal (para ediciones offline)
  watch(() => props?.query?.idOriginal, (idOriginal) => {
    if (props?.modoEdicion && idOriginal) {
      cargarDatosEdicion();
    }
  });

  // Sincroniza nombre con añadir.js
  watch(nombreUsuario, (nuevo) => {
    setNombre(nuevo);
  });

  onMounted(() => {
    if (props?.modoEdicion && (props?.idEdicion || props?.query?.idOriginal)) {
      setModoEdicion(true, props.idEdicion || props.query.idOriginal);
    }
  });

  onUnmounted(() => {
    limpiarCampos();
    setModoEdicion(false, '');
  });

  return {
    filasFijas,
    filasExtra,
    agregarFila,
    limpiarCampos,
    nombreUsuario,
    soloEnteros
  };
}