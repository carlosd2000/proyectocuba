<template>
  <div class="container py-2" style="max-width: 350px;">
    <div class="main-container">
      <!-- Contenedor del scroll (filas) -->
      <div class="scroll-container">
        <!-- Filas fijas - Mostrar 2 si es nuevo, 3 si es edición -->
        <div v-for="fila in (modoEdicion ? 3 : 2)" :key="'fija-' + fila" class="input-row-container">
          <div class="input-row">
            <input
              type="number"
              class="cuadrado label"
              :placeholder="claseImagenSiHayEspacioGlobal(fila - 1) ? null : '-'"
              :class="[claseImagenSiHayEspacioGlobal(fila - 1), mensajesError[fila - 1] ? 'input-restringido' : '']"
              v-model="filasFijas[fila - 1].cuadrado"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarFilaCompleta(fila - 1, 'fija')"
            />
            <div class="espacio-vacio"></div>
            <div class="espacio-vacio"></div>
          </div>
          <div v-if="mensajesError[fila - 1]" class="mensaje-error mensaje-restringido">
            {{ mensajesError[fila - 1] }}
          </div>
        </div>

        <!-- Filas extra -->
        <div v-for="(fila, index) in filasExtra" :key="'extra-' + index" class="input-row-container">
          <div class="input-row">
            <input
              type="number"
              class="cuadrado label"
              :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index) ? null : '-'"
              :class="[claseImagenSiHayEspacioGlobal(filasFijas.length + index), mensajesErrorExtra[index] ? 'input-restringido' : '']"
              v-model="fila.cuadrado"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarFilaCompleta(index, 'extra')"
            />
            <div class="espacio-vacio"></div>
            <div class="espacio-vacio"></div>
          </div>
          <div v-if="mensajesErrorExtra[index]" class="mensaje-error mensaje-restringido">
            {{ mensajesErrorExtra[index] }}
          </div>
        </div>
        <div class="btn-agregar-container">
          <button class="btn-agregar-fila" @click="agregarFila">
            <img :src="masIcon" alt="Agregar fila" class="icono-mas">
          </button>
        </div>
      </div>

      <!-- Círculo solo - FIJO FUERA DEL SCROLL - SIEMPRE VISIBLE -->
      <div class="circulo-solo-fixed">
        <input
          type="number"
          class="circular-solo label"
          placeholder="$"
          v-model="filasFijas[2].circuloSolo"
          :class="camposInvalidos.circuloSolo ? 'input-invalido' : ''"
          min="0"
          step="1"
          @keypress="soloEnteros($event)"
          @input="validarCampo(filasFijas[2].circuloSolo, 'circuloSolo'); validarParlet()"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect, watch, onMounted, onUnmounted, ref } from 'vue'
import masIcon from '@/assets/icons/mas.svg'
import { useInputParlet } from '../scripts/InputParlet.js'
import {
  camposInvalidos,
  validarCampo,
  hayErroresCriticos,
  resetCamposInvalidos,
  revalidarTodosLosNumeros,
  validarNumeroRestringido,
  setErrorCallback,
  horarioActual,
  resetEstadoCompleto,
  verificarCombinacionParlet,
} from '../scripts/fieldValidator.js'

const emit = defineEmits(['update:hayCamposInvalidos', 'update:hayNumerosNoJuega'])
const props = defineProps({ 
  datosEdicion: Object, 
  modoEdicion: Boolean, 
  idEdicion: String 
})

const {
  filasFijas,
  filasExtra,
  agregarFila,
  soloEnteros,
  limpiarCampos,
  claseImagenSiHayEspacioGlobal
} = useInputParlet(props)

const modoEdicion = ref(props.modoEdicion)
const mensajesError = ref(Array(3).fill(''))
const mensajesErrorExtra = ref([])
const hayNumerosNoJuega = ref(false)
const numerosBloqueados = ref(new Set())

const manejarErrorNumero = (index, tipoFila, mensaje) => {
  if (tipoFila === 'fija') {
    const newMensajes = [...mensajesError.value];
    newMensajes[index] = mensaje;
    mensajesError.value = newMensajes;
  } else if (tipoFila === 'extra') {
    const newMensajes = [...mensajesErrorExtra.value];
    if (newMensajes.length <= index) {
      newMensajes.length = index + 1;
    }
    newMensajes[index] = mensaje;
    mensajesErrorExtra.value = newMensajes;
  }
}

setErrorCallback((index, tipoFila, mensaje, tipoCampo, tipoRestriccion) => {
  if (tipoRestriccion === 'NoJuega') {
    if (tipoCampo === 'circuloSolo') {
      numerosBloqueados.value.add('circulo-solo')
    } else {
      const clave = `${tipoFila}-${index}-${tipoCampo}`
      numerosBloqueados.value.add(clave)
    }
  } else {
    if (tipoCampo === 'circuloSolo') {
      numerosBloqueados.value.delete('circulo-solo')
    } else {
      const clave = `${tipoFila}-${index}-${tipoCampo}`
      numerosBloqueados.value.delete(clave)
    }
  }
  
  manejarErrorNumero(index, tipoFila, mensaje)
  actualizarEstadoNumerosNoJuega()
})

const validarFilaCompleta = (index, tipoFila) => {
  let fila

  if (tipoFila === 'fija') {
    fila = filasFijas.value[index]
    const newMensajes = [...mensajesError.value]
    if (
      !newMensajes[index] ||
      (
        !newMensajes[index].includes('combinación') &&
        !newMensajes[index].includes('bloqueada') &&
        !newMensajes[index].includes('limitada')
      )
    ) {
      newMensajes[index] = ''
    }
    mensajesError.value = newMensajes
  } else {
    fila = filasExtra.value[index]
    const newMensajes = [...mensajesErrorExtra.value]
    if (newMensajes.length <= index) {
      newMensajes.length = index + 1
    }
    if (
      !newMensajes[index] ||
      (
        !newMensajes[index].includes('combinación') &&
        !newMensajes[index].includes('bloqueada') &&
        !newMensajes[index].includes('limitada')
      )
    ) {
      newMensajes[index] = ''
    }
    mensajesErrorExtra.value = newMensajes
  }
  
  actualizarEstadoNumerosNoJuega()
}

const obtenerTodosLosNumerosCuadrados = () => {
  const numeros = []
  
  filasFijas.value.forEach((fila, index) => {
    if (fila.cuadrado && fila.cuadrado !== '') {
      const numFormateado = String(fila.cuadrado).padStart(2, '0')
      numeros.push(numFormateado)
    }
  })
  
  filasExtra.value.forEach((fila, index) => {
    if (fila.cuadrado && fila.cuadrado !== '') {
      const numFormateado = String(fila.cuadrado).padStart(2, '0')
      numeros.push(numFormateado)
    }
  })
  return numeros
}

const generarTodasLasCombinaciones = (numeros) => {
  const combinaciones = []
  
  for (let i = 0; i < numeros.length; i++) {
    for (let j = i + 1; j < numeros.length; j++) {
      combinaciones.push(`${numeros[i]},${numeros[j]}`)
      combinaciones.push(`${numeros[j]},${numeros[i]}`)
    }
  }
  
  const combinacionesUnicas = [...new Set(combinaciones)]
  return combinacionesUnicas
}

const validarCombinacionesParlet = () => {
  const numerosCuadrados = obtenerTodosLosNumerosCuadrados()
  const tieneCirculoSolo = !!filasFijas.value[2].circuloSolo
  
  if (!tieneCirculoSolo) {
    limpiarMensajesParlet();
    return
  }

  if (numerosCuadrados.length < 2) {
    limpiarMensajesParlet();
    return
  }

  const combinaciones = generarTodasLasCombinaciones(numerosCuadrados)
  let tieneErrorNoJuega = false
  const combinacionesConError = new Map()

  for (const combinacion of combinaciones) {
    const resultado = verificarCombinacionParlet(combinacion, horarioActual.value)
    
    if (!resultado.esValido) {
      tieneErrorNoJuega = true
      combinacionesConError.set(combinacion, {
        mensaje: resultado.mensaje,
        tipo: 'NoJuega'
      })
    } else if (resultado.restriccion === 'Limitado') {
      combinacionesConError.set(combinacion, {
        mensaje: resultado.mensaje,
        tipo: 'Limitado'
      })
    }
  }

  limpiarMensajesParlet();

  if (combinacionesConError.size > 0) {
    mostrarMensajesEnFilasCorrespondientes(combinacionesConError);
  }

  if (tieneErrorNoJuega !== hayNumerosNoJuega.value) {
    hayNumerosNoJuega.value = tieneErrorNoJuega
    emit('update:hayNumerosNoJuega', hayNumerosNoJuega.value)
  }
}

const limpiarMensajesParlet = () => {
  const newMensajesFijos = [...mensajesError.value];
  for (let i = 0; i < newMensajesFijos.length; i++) {
    if (newMensajesFijos[i] && 
        (newMensajesFijos[i].includes('combinación') || 
         newMensajesFijos[i].includes('bloqueada') ||
         newMensajesFijos[i].includes('limitada'))) {
      newMensajesFijos[i] = '';
    }
  }
  mensajesError.value = newMensajesFijos;

  const newMensajesExtra = [...mensajesErrorExtra.value];
  for (let i = 0; i < newMensajesExtra.length; i++) {
    if (newMensajesExtra[i] && 
        (newMensajesExtra[i].includes('combinación') || 
         newMensajesExtra[i].includes('bloqueada') ||
         newMensajesExtra[i].includes('limitada'))) {
      newMensajesExtra[i] = '';
    }
  }
  mensajesErrorExtra.value = newMensajesExtra;
}

const mostrarMensajesEnFilasCorrespondientes = (combinacionesConError) => {
  const mensajesPorFila = new Map();
  const combinacionesProcesadas = new Set();

  for (const [combinacion, info] of combinacionesConError.entries()) {
    const [numero1, numero2] = combinacion.split(',');
    const combinacionInversa = `${numero2},${numero1}`;
    
    if (combinacionesProcesadas.has(combinacionInversa)) {
      continue;
    }
    
    combinacionesProcesadas.add(combinacion);

    filasFijas.value.forEach((fila, index) => {
      const numFormateado = String(fila.cuadrado).padStart(2, '0');
      if (numFormateado === numero1 || numFormateado === numero2) {
        if (!mensajesPorFila.has(index)) {
          mensajesPorFila.set(index, new Set());
        }
        mensajesPorFila.get(index).add(info.mensaje);
      }
    });

    filasExtra.value.forEach((fila, index) => {
      const numFormateado = String(fila.cuadrado).padStart(2, '0');
      if (numFormateado === numero1 || numFormateado === numero2) {
        const globalIndex = filasFijas.value.length + index;
        if (!mensajesPorFila.has(globalIndex)) {
          mensajesPorFila.set(globalIndex, new Set());
        }
        mensajesPorFila.get(globalIndex).add(info.mensaje);
      }
    });
  }

  aplicarMensajesAFilas(mensajesPorFila);
}

const aplicarMensajesAFilas = (mensajesPorFila) => {
  const newMensajesFijos = [...mensajesError.value];
  
  mensajesPorFila.forEach((mensajesSet, index) => {
    if (index < filasFijas.value.length) {
      const mensajesArray = Array.from(mensajesSet);
      newMensajesFijos[index] = mensajesArray.join(' | ');
    }
  });
  mensajesError.value = newMensajesFijos;

  const newMensajesExtra = [...mensajesErrorExtra.value];
  
  mensajesPorFila.forEach((mensajesSet, index) => {
    if (index >= filasFijas.value.length) {
      const extraIndex = index - filasFijas.value.length;
      if (newMensajesExtra.length <= extraIndex) {
        newMensajesExtra.length = extraIndex + 1;
      }
      const mensajesArray = Array.from(mensajesSet);
      newMensajesExtra[extraIndex] = mensajesArray.join(' | ');
    }
  });
  mensajesErrorExtra.value = newMensajesExtra;
}

const validarParlet = () => {
  const fila2 = filasFijas.value[2]
  const tieneCirculoSolo = !!fila2.circuloSolo
  
  numerosBloqueados.value.delete('circulo-solo')
  
  if (tieneCirculoSolo) {
    if (fila2.cuadrado) {
      const resultado = validarNumeroRestringido(fila2.cuadrado, 'circuloSolo', 2, 'fija')
      if (!resultado.esValido) {
        numerosBloqueados.value.add('circulo-solo')
      }
    }
    
    setTimeout(() => {
      validarCombinacionesParlet()
    }, 50)
  } else {
    limpiarMensajesParlet()
  }
  
  actualizarEstadoNumerosNoJuega()
}

const revalidarTodosLosCampos = () => {
  if (filasFijas.value[2].circuloSolo) {
    validarCampo(filasFijas.value[2].circuloSolo, 'circuloSolo');
  }
  
  validarParlet();
  actualizarEstadoNumerosNoJuega();
}

const actualizarEstadoNumerosNoJuega = () => {
  const hayErroresNoJuega = numerosBloqueados.value.size > 0
  
  if (hayNumerosNoJuega.value !== hayErroresNoJuega) {
    hayNumerosNoJuega.value = hayErroresNoJuega
    emit('update:hayNumerosNoJuega', hayNumerosNoJuega.value)
  }
}

watch(() => [
  ...filasFijas.value.map(f => f.cuadrado),
  ...filasExtra.value.map(f => f.cuadrado),
  filasFijas.value[2].circuloSolo,
  filasExtra.value.length 
], () => {
  const nuevasClaves = new Set()
  
  filasFijas.value.forEach((fila, index) => {
    if (fila.cuadrado) {
      if (fila.circulo1) {
        const resultado = validarNumeroRestringido(fila.cuadrado, 'circulo1', index, 'fija')
        if (!resultado.esValido) {
          nuevasClaves.add(`fija-${index}-circulo1`)
        }
      }
      if (fila.circulo2) {
        const resultado = validarNumeroRestringido(fila.cuadrado, 'circulo2', index, 'fija')
        if (!resultado.esValido) {
          nuevasClaves.add(`fija-${index}-circulo2`)
        }
      }
    }
  })
  
  filasExtra.value.forEach((fila, index) => {
    if (fila.cuadrado) {
      if (fila.circulo1) {
        const resultado = validarNumeroRestringido(fila.cuadrado, 'circulo1', index, 'extra')
        if (!resultado.esValido) {
          nuevasClaves.add(`extra-${index}-circulo1`)
        }
      }
      if (fila.circulo2) {
        const resultado = validarNumeroRestringido(fila.cuadrado, 'circulo2', index, 'extra')
        if (!resultado.esValido) {
          nuevasClaves.add(`extra-${index}-circulo2`)
        }
      }
    }
  })
  
  numerosBloqueados.value = nuevasClaves
  actualizarEstadoNumerosNoJuega()
  
  if (filasFijas.value[2].circuloSolo) {
    setTimeout(() => {
      validarCombinacionesParlet();
    }, 50);
  }
}, { deep: true, immediate: true })

watch(horarioActual, () => {
  revalidarTodosLosCampos();
});

watch(() => filasFijas.value, () => {
  revalidarTodosLosCampos();
}, { deep: true });

watch(() => filasExtra.value, (newVal) => {
  if (mensajesErrorExtra.value.length < newVal.length) {
    mensajesErrorExtra.value = [...mensajesErrorExtra.value, ...Array(newVal.length - mensajesErrorExtra.value.length).fill('')]
  }
  revalidarTodosLosCampos();
}, { deep: true });

watch(() => filasExtra.value.length, () => {
  if (filasFijas.value[2].circuloSolo) {
    setTimeout(() => {
      validarCombinacionesParlet();
    }, 100);
  }
});

watch(
  [
    () => filasFijas.value.map(f => f.cuadrado),
    () => filasExtra.value.map(f => f.cuadrado),
    () => filasFijas.value[2].circuloSolo
  ],
  () => {
    if (filasFijas.value[2].circuloSolo) {
      validarCombinacionesParlet()
    } else {
      limpiarMensajesParlet()
    }
  },
  { deep: true, immediate: true }
)

watchEffect(() => {
  const hayErrores = hayErroresCriticos() || hayNumerosNoJuega.value;
  emit('update:hayCamposInvalidos', hayErrores);
})

onMounted(() => {
  actualizarEstadoNumerosNoJuega();
  resetCamposInvalidos();
})

onUnmounted(() => {
  resetEstadoCompleto()
  numerosBloqueados.value.clear()
})
</script>

<style scoped>
.main-container {
  position: relative;
  background-color: #fdfef2;
  height: 350px;
  padding-right: 64px;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  max-height: 330px;
  gap: 8px;
  width: 100%;
  overflow-y: auto;
  width: calc(100% - 8px);
}
.btn-agregar-container {
  display: flex;
  justify-content: flex-start;
}

.input-row {
  display: flex;
  gap: 10px;
  height: 48px;
  width: 100%;
}

.input-row-container {
  display: flex;
  flex-direction: column;
}

.cuadrado, .circular-solo {
  width: 70px;
  height: 48px;
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
}

.espacio-vacio {
  width: 70px;
  height: 48px;
}

.circulo-solo-fixed {
  position: absolute;
  right: 0;
  top: 112px;
  width: 64px;
  height: 48px;
  z-index: 2;
}

.btn-agregar-fila {
  width: 70px;
  height: 48px;
  background: #E0E0F8;
  border-radius: 60px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-agregar-fila:hover {
  background: #D0D0F0;
}

.icono-mas {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.cuadrado {
  border: 1px solid #CDCDD1;
  border-radius: 30px;
  background: #FFFFFF;
}

.circular-solo {
  background: #F3F3F3;
  border: 1px solid #F3F3F3;
  border-radius: 30px;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.input-invalido {
  border: 1px solid #ff0000 !important;
  background-color: #ffeeee !important;
}

.mensaje-error {
  font-size: 11px;
  color: #ff4d4f;
  padding: 6px 10px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  text-align: center;
  animation: fadeIn 0.3s ease-in;
  margin-top: 4px;
  font-weight: 500;
}

.mensaje-restringido {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  font-weight: bold;
}

.input-restringido {
  border: 2px solid #ff4d4f !important;
  background-color: #fff2f0 !important;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(-5px); 
    max-height: 0;
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
    max-height: 50px;
  }
}
</style>