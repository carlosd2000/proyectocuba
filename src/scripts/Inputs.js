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

    export function useInputs(props) {
    setTipoOrigen('tiros')

    // Cargar datos de edición usando función compartida
    const cargarDatosEdicion = () => {
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

            // Condiciones de expansión incrementativa
            if (
                siguiente > actual &&
                (siguiente - actual) % 10 === 0 &&
                idxFin - idxInicio > 1
            ) {
                if (!circuloKey) {
                    // Para el cuadro: solo requiere expansión incrementativa
                    if (idxInicio < index && index < idxFin) {
                        return 'input-con-imagen'
                    }
                } else {
                    // Para círculo: requiere igualdad y no vacío en ambos extremos
                    const baseValor = lista[idxInicio][circuloKey]
                    const finValor = lista[idxFin][circuloKey]
                    if (
                        baseValor === finValor &&
                        baseValor !== '' &&
                        baseValor !== null &&
                        String(baseValor).trim() !== '' &&
                        idxInicio < index && index < idxFin
                    ) {
                        return 'input-con-imagen'
                    }
                }
            }
        }
    }
    return ''
}


    // Reactivo: actualiza si los datos de edición cambian dinámicamente
    watch(() => props.datosEdicion, (nuevosDatos) => {
        if (props.modoEdicion && nuevosDatos) {
        cargarDatosEdicion()
        }
    }, { deep: true, immediate: true })

    // Sincroniza nombre con añadir.js
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
        soloEnteros,
        claseImagenSiHayEspacio,
    }
}