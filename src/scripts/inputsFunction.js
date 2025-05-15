/*En este archivo se van a realizar las funciones que se encuentran
de manera similar en los siguientes archivos:
    Inputs.vue
    InputParlet.vue
    InputCandado.vue
    InputCentena.vue*/

// Permite solo la entrada de números enteros en un input
export function soloEnteros(e) {
    const charCode = e.which ? e.which : e.keyCode
    if (charCode < 48 || charCode > 57) {
    e.preventDefault()
    }
}

// Carga datos de edición en los campos reactivos del formulario
export function cargarDatosEdicion(props, nombreUsuario, filasFijas, filasExtra, filasFijasLength = 5) {
    if (!props.datosEdicion) return

    nombreUsuario.value = props.datosEdicion.nombre || ''

  // Limpiar campos primero
filasFijas.value = Array(filasFijasLength).fill().map(() => ({
    cuadrado: '',
    circulo1: '',
    circulo2: '',
    circuloSolo: ''
    }))
    filasExtra.value = []

  // Cargar datos
    if (props.datosEdicion.datos) {
    props.datosEdicion.datos.forEach((fila, index) => {
        const datosFila = {
        cuadrado: fila.cuadrado?.toString() || '',
        circulo1: fila.circulo1?.toString() || '',
        circulo2: fila.circulo2?.toString() || '',
        circuloSolo: fila.circuloSolo?.toString() || ''
        }
        if (index < filasFijasLength) {
            filasFijas.value[index] = datosFila
        } else {
            filasExtra.value.push(datosFila)
        }
        })
    }
}

