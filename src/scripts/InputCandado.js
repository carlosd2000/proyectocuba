    
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

    export function useInputCandado(props) {
    setTipoOrigen('candado')

    // Cargar datos de edición usando función compartida
    const cargarDatosEdicion = () => {
        cargarDatosEdicionCompartida(
        props,
        nombreUsuario,
        filasFijas,
        filasExtra,
        5
        )
        // Lógica específica para círculo solo (si aplica)
        if (props.datosEdicion?.circuloSolo) {
        filasFijas.value[2].circuloSolo = props.datosEdicion.circuloSolo.toString()
        }
    }

    // Reactivo: actualiza si los datos de edición cambian dinámicamente
    watch(() => props.datosEdicion, (nuevosDatos) => {
        if (props.modoEdicion && nuevosDatos) {
        console.log('Actualización detectada en datosEdicion:', nuevosDatos)
        cargarDatosEdicion()
        }
    }, { deep: true, immediate: true })

    // Sincroniza nombre con añadir.js
    watch(nombreUsuario, (nuevo) => {
        setNombre(nuevo)
    })

    onMounted(() => {
        if (props.modoEdicion && props.idEdicion) {
        setModoEdicion(true, props.idEdicion);
        }
    });

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