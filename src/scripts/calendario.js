    import { ref, computed, watch } from 'vue'

    export function useCalendario(emit) {
    const fecha = ref(new Date())
    const numeros = ref('123 - 45 - 45')

    const fechaSeleccionada = ref(new Date())
    const fechaSeleccionadaString = ref(fechaSeleccionada.value.toISOString().slice(0, 10))

    watch(fechaSeleccionadaString, (val) => {
        fechaSeleccionada.value = new Date(val + 'T00:00:00')
    })

    watch(fechaSeleccionada, (val) => {
        fechaSeleccionadaString.value = val.toISOString().slice(0, 10)
    })

    watch(fechaSeleccionada, (val) => {
        fecha.value = new Date(val)
    })

    watch(fechaSeleccionada, (val) => {
        emit('cambiar-fecha', new Date(val))
    })

    const fechaFormateada = computed(() => {
        const dia = fechaSeleccionada.value.getDate().toString().padStart(2, '0')
        const mes = (fechaSeleccionada.value.getMonth() + 1).toString().padStart(2, '0')
        const anio = fechaSeleccionada.value.getFullYear()
        return `${dia}/${mes}/${anio}`
    })

    const diaAnterior = () => {
        fechaSeleccionada.value.setDate(fechaSeleccionada.value.getDate() - 1)
        fechaSeleccionada.value = new Date(fechaSeleccionada.value)
    }

    const diaSiguiente = () => {
        fechaSeleccionada.value.setDate(fechaSeleccionada.value.getDate() + 1)
        fechaSeleccionada.value = new Date(fechaSeleccionada.value)
    }

    const esMismoDia = (fechaA, fechaB) => {
        const a = new Date(fechaA)
        const b = new Date(fechaB)
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
    }

    return {
        fecha,
        numeros,
        fechaSeleccionada,
        fechaSeleccionadaString,
        fechaFormateada,
        diaAnterior,
        diaSiguiente,
        esMismoDia
    }
    }