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

const calcularPremioApuesta = (apuesta) => {
    if (!apuesta.ganador) return 0;
    
    const hoy = new Date().toISOString().slice(0, 10);
    const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}');
    const tiroGanador = tirosLocales[hoy]?.[apuesta.horario]?.tiro;
    
    if (!tiroGanador) return 0;
    
    const [primerNumero, corrido1, corrido2] = tiroGanador.split('-');
    const fijo = primerNumero.slice(-2); // Últimos 2 dígitos del primer número
    
    // Obtener configuración del horario
    const configPagos = JSON.parse(localStorage.getItem('configPagos') || '{}');
    const configHorario = configPagos[apuesta.horario] || {};
    const { montos = {}, limitados = {}, noJuega = {} } = configHorario;
    
    let premioTotal = 0;
    
    // Verificar cada fila de datos de la apuesta
    apuesta.datos?.forEach(mapa => {
        if (!mapa.cuadrado) return;
        
        const cuadradoStr = mapa.cuadrado.toString().padStart(2, '0');
        const circulo1 = Number(mapa.circulo1) || 0;
        const circulo2 = Number(mapa.circulo2) || 0;
        
        // Verificar si es Fijo ganador
        if (cuadradoStr === fijo && circulo1 > 0) {
            if (noJuega.Fijo?.numeros?.includes(cuadradoStr)) {
                return; // No juega, no suma
            }
            
            let multiplicador = montos.Fijo || 0;
            if (limitados.Fijo?.numeros?.includes(cuadradoStr)) {
                multiplicador = limitados.Fijo.monto || multiplicador;
            }
            
            premioTotal += circulo1 * multiplicador;
        }
        
        // Verificar si es Corrido ganador
        if ((cuadradoStr === corrido1 || cuadradoStr === corrido2) && circulo2 > 0) {
            if (noJuega.Corrido?.numeros?.includes(cuadradoStr)) {
                return; // No juega, no suma
            }
            
            let multiplicador = montos.Corrido || 0;
            if (limitados.Corrido?.numeros?.includes(cuadradoStr)) {
                multiplicador = limitados.Corrido.monto || multiplicador;
            }
            
            premioTotal += circulo2 * multiplicador;
        }
    });
    

    // CALCULAR PARLET - Combinaciones ganadoras
    if (apuesta.circuloSolo !== undefined && apuesta.circuloSolo !== null && apuesta.circuloSolo !== '') {
        const circuloSolo = Number(apuesta.circuloSolo) || 0;
        
        if (circuloSolo > 0) {
            // Obtener todos los cuadrados de la apuesta
            const cuadrados = apuesta.datos
                ?.map(mapa => mapa.cuadrado?.toString().padStart(2, '0'))
                .filter(Boolean) || [];
            
            // Números del tiro para parlet (solo corrido1 y corrido2)
            const numerosTiroParlet = [corrido1, corrido2];
            
            // Contar cuántos cuadrados coinciden con los números del tiro
            const coincidencias = cuadrados.filter(cuadrado => 
                numerosTiroParlet.includes(cuadrado)
            );
            
            // Calcular combinaciones ganadoras (n choose k = n! / (k!(n-k)!))
            // Para parlet, necesitamos al menos 2 coincidencias
            if (coincidencias.length >= 2) {
                const n = coincidencias.length;
                const combinacionesGanadoras = (n * (n - 1)) / 2; // n choose 2
                
                let multiplicadorParlet = montos.Parlet || 0;
                
                // Aplicar multiplicador por cada combinación ganadora
                premioTotal += circuloSolo * multiplicadorParlet * combinacionesGanadoras;
            }
        }
    }
    
    // CALCULAR CENTENA - Número de 3 dígitos que coincide con el fijo completo
    if (apuesta.circuloSolo !== undefined && apuesta.circuloSolo !== null && apuesta.circuloSolo !== '') {
        const circuloSolo = Number(apuesta.circuloSolo) || 0;
        
        if (circuloSolo > 0) {
            // Buscar si algún cuadrado es la centena completa
            const tieneCentena = apuesta.datos?.some(mapa => {
                if (!mapa.cuadrado) return false;
                const cuadrado3Str = mapa.cuadrado.toString().padStart(3, '0');
                return cuadrado3Str === primerNumero;
            });
            
            if (tieneCentena) {
                let multiplicadorCentena = montos.Centena || 0;
                premioTotal += circuloSolo * multiplicadorCentena;
            }
        }
    }
    
    return premioTotal;
}

// Filtra apuestas por día y horario
const apuestasFiltradas = computed(() => {
    return props.apuestas.filter(apuesta => {
        const horarioMatch = apuesta.horario?.toLowerCase() === props.horario?.toLowerCase();

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
})

// Calcula total bruto
const totalDelDiaYHorario = computed(() => {
    return apuestasFiltradas.value.reduce((total, a) => total + (Number(a.totalGlobal) || 0), 0)
})

// Calcula total premios (NUEVO)
const totalPremios = computed(() => {
    return apuestasFiltradas.value.reduce((total, apuesta) => {
        return total + calcularPremioApuesta(apuesta);
    }, 0)
})

// Calcula neto (NUEVO)
const totalNeto = computed(() => {
    return totalDelDiaYHorario.value - totalPremios.value
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
            <h5 class="label">${{ totalPremios.toLocaleString() }}</h5>
            <div class="d-flex flex-row gap-2">
                <img src="../assets/icons/Star.svg" alt="">
                <h5 class="small">Premios</h5>
            </div>
        </div>
        <div class="line"></div>
        <div class="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
            <h5 class="label">${{ totalNeto.toLocaleString() }}</h5>
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