<script setup>
import { computed } from 'vue'

const props = defineProps({
    apuestas: Array,
    fecha: Date,
    horario: String
})

// Función para verificar si la fecha es del mismo día
const esMismoDia = (fechaA, fechaB) => {
    try {
        const a = new Date(fechaA)
        const b = new Date(fechaB)
        return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
        )
    } catch {
        return false
    }
}

const totalDelDiaYHorario = computed(() => {
    return props.apuestas
    .filter(apuesta => {
        const horarioMatch =
            apuesta.horario?.toLowerCase() === props.horario?.toLowerCase()

        let creadoEn
        if (apuesta.creadoEn?.seconds) {
            creadoEn = new Date(apuesta.creadoEn.seconds * 1000)
        } else if (apuesta.creadoEn?.toDate) {
            creadoEn = apuesta.creadoEn.toDate()
        } else if (apuesta.creadoEn) {
            creadoEn = new Date(apuesta.creadoEn)
        }

        const diaMatch = creadoEn && esMismoDia(creadoEn, props.fecha)
        return horarioMatch && diaMatch
    })
    .reduce((total, a) => total + (Number(a.totalGlobal) || 0), 0)
})
</script>

<template>
    <div class="tabs-container d-flex flex-row justify-content-center align-items-center w-100">
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">{{ totalDelDiaYHorario.toLocaleString() }}</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Coin.svg" alt="">
                <h5 class="small">Bruto</h5>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">$000</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Star.svg" alt="">
                <h5 class="small">Premios</h5>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">$000</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Ganancia.svg" alt="">
                <h5 class="small">Neto</h5>
            </div>
        </div>
    </div>
</template>
<style scoped>
.small{
    color: #696974;
}
p{
    padding: 0px;
    margin: 1px;
    font-size: 0.9rem;
}
.tabs-container {
    padding: 8px 0px;
    gap: 12px;
    width: 343px;
    flex: none;
    flex-grow: 0;
}
.line{
    width: 36px;
    height: 2px;
    border: 1px solid #F0F0FC;
    transform: rotate(90deg);
    flex: none;
    flex-grow: 0;
}
</style>    