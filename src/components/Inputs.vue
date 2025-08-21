<template>
  <div class="container-main p-2">
    <div class="d-flex flex-row justify-content-center gap-1" style="height: 340px;">
      <div class="scroll-container">
        <div v-for="fila in 5" :key="'fija-' + fila" class="input-row-container">
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
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo1') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(fila - 1, 'circulo1'), camposInvalidos.circulo1.has(fila - 1) ? 'input-invalido' : '']"
              v-model="filasFijas[fila - 1].circulo1"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(filasFijas[fila - 1].circulo1, 'circulo1', fila - 1); validarFilaCompleta(fila - 1, 'fija')"
            />
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(fila - 1, 'circulo2') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(fila - 1, 'circulo2'), camposInvalidos.circulo2.has(fila - 1) ? 'input-invalido' : '']"
              v-model="filasFijas[fila - 1].circulo2"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(filasFijas[fila - 1].circulo2, 'circulo2', fila - 1); validarFilaCompleta(fila - 1, 'fija')"
            />
          </div>
          <div v-if="mensajesError[fila - 1]" class="mensaje-error mensaje-restringido">
            {{ mensajesError[fila - 1] }}
          </div>
        </div>
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
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo1') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo1'), camposInvalidos.circulo1.has(filasFijas.length + index) ? 'input-invalido' : '']"
              v-model="fila.circulo1"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(fila.circulo1, 'circulo1', filasFijas.length + index); validarFilaCompleta(index, 'extra')"
            />
            <input
              type="number"
              class="circular label"
              :placeholder="claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo2') ? null : '$'"
              :class="[claseImagenSiHayEspacioGlobal(filasFijas.length + index, 'circulo2'), camposInvalidos.circulo2.has(filasFijas.length + index) ? 'input-invalido' : '']"
              v-model="fila.circulo2"
              min="0"
              step="1"
              @keypress="soloEnteros($event)"
              @input="validarCampo(fila.circulo2, 'circulo2', filasFijas.length + index); validarFilaCompleta(index, 'extra')"
            />
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
      <!-- Círculo solo - FIJO FUERA DEL SCROLL (posición ajustada) -->
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
import { watchEffect, watch, onMounted, onUnmounted, ref, nextTick } from 'vue'
import masIcon from '../assets/icons/mas.svg'
import { useInputs } from '../scripts/Inputs.js'
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

const emit = defineEmits(['update:hayCamposInvalidos' , 'update:hayNumerosNoJuega'])
const props = defineProps({ datosEdicion: Object, modoEdicion: Boolean, idEdicion: String })

const {
  filasFijas,
  filasExtra,
  agregarFila,
  soloEnteros,
  claseImagenSiHayEspacioGlobal
} = useInputs(props)

const mensajesError = ref(Array(5).fill(''))
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
  
  // Llamar al callback original para mostrar mensajes
  manejarErrorNumero(index, tipoFila, mensaje)
  actualizarEstadoNumerosNoJuega()
})

const validarFilaCompleta = (index, tipoFila) => {
  let fila

  if (tipoFila === 'fija') {
    fila = filasFijas.value[index]
    // Solo limpiar mensaje si NO es de parlet
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

    ;['circulo1', 'circulo2'].forEach(campo => {
      const clave = `fija-${index}-${campo}`
      numerosBloqueados.value.delete(clave)
    })
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

    ;['circulo1', 'circulo2'].forEach(campo => {
      const clave = `extra-${index}-${campo}`
      numerosBloqueados.value.delete(clave)
    })
  }

  // Solo validar si hay número en cuadrado Y al menos un círculo tiene valor
  const tieneCuadrado = !!fila.cuadrado
  const tieneCirculo1 = !!fila.circulo1
  const tieneCirculo2 = !!fila.circulo2
  
  if (tieneCuadrado && (tieneCirculo1 || tieneCirculo2)) {
    if (tieneCirculo1) {
      const resultadoFijo = validarNumeroRestringido(fila.cuadrado, 'circulo1', index, tipoFila)
      if (!resultadoFijo.esValido) {
        tieneNumeroNoJuega = true
        // El callback setErrorCallback manejará el registro del bloqueo
      }
    }
    if (tieneCirculo2) {
      const resultadoCorrido = validarNumeroRestringido(fila.cuadrado, 'circulo2', index, tipoFila)
      if (!resultadoCorrido.esValido) {
        tieneNumeroNoJuega = true
        // El callback setErrorCallback manejará el registro del bloqueo
      }
    }
  }
  
  actualizarEstadoNumerosNoJuega()
}

// AGREGAR estas funciones después de los imports:

const obtenerTodosLosNumerosCuadrados = () => {
  const numeros = []
  
  // Obtener números de filas fijas (solo si tienen valor)
  filasFijas.value.forEach((fila, index) => {
    if (fila.cuadrado && fila.cuadrado !== '') {
      const numFormateado = String(fila.cuadrado).padStart(2, '0')
      numeros.push(numFormateado)
    }
  })
  
  // Obtener números de filas extra (solo si tienen valor)
  filasExtra.value.forEach((fila, index) => {
    if (fila.cuadrado && fila.cuadrado !== '') {
      const numFormateado = String(fila.cuadrado).padStart(2, '0')
      numeros.push(numFormateado)
    }
  })
  return numeros
}

// En Inputs.vue - modificar la función generarTodasLasCombinaciones
const generarTodasLasCombinaciones = (numeros) => {
  const combinaciones = []
  
  
  // Generar todas las combinaciones posibles entre números (con comas)
  for (let i = 0; i < numeros.length; i++) {
    for (let j = i + 1; j < numeros.length; j++) {
      combinaciones.push(`${numeros[i]},${numeros[j]}`) // CAMBIADO: usar coma
      combinaciones.push(`${numeros[j]},${numeros[i]}`) // CAMBIADO: usar coma
    }
  }
  
  const combinacionesUnicas = [...new Set(combinaciones)]
  
  return combinacionesUnicas
}

const validarCombinacionesParlet = () => {
  const numerosCuadrados = obtenerTodosLosNumerosCuadrados()
  const tieneCirculoSolo = !!filasFijas.value[2].circuloSolo
  
  // Si no hay circuloSolo, limpiar y salir
  if (!tieneCirculoSolo) {
    limpiarMensajesParlet();
    return
  }

  // Si hay circuloSolo pero menos de 2 cuadrados, mostrar mensaje apropiado
  if (numerosCuadrados.length < 2) {
    limpiarMensajesParlet();
    // Opcional: mostrar mensaje indicando que se necesitan al menos 2 números
    return
  }

  // Resto del código existente...
  const combinaciones = generarTodasLasCombinaciones(numerosCuadrados)
  let tieneErrorNoJuega = false
  const combinacionesConError = new Map() // Almacenar todas las combinaciones con error

  // Verificar cada combinación
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

  // Limpiar mensajes anteriores de parlet
  limpiarMensajesParlet();

  // Mostrar mensajes para todas las combinaciones con error
  if (combinacionesConError.size > 0) {
    mostrarMensajesEnFilasCorrespondientes(combinacionesConError);
  }

  // Actualizar estado para bloquear botón si hay error de noJuega
  if (tieneErrorNoJuega !== hayNumerosNoJuega.value) {
    hayNumerosNoJuega.value = tieneErrorNoJuega
    emit('update:hayNumerosNoJuega', hayNumerosNoJuega.value)
  }
}

const limpiarMensajesParlet = () => {
  // Limpiar mensajes de parlet de filas fijas (solo los que contienen "combinación")
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

  // Limpiar mensajes de parlet de filas extra (solo los que contienen "combinación")
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
  const combinacionesProcesadas = new Set(); // Para evitar procesar ambas direcciones

  // Procesar cada combinación con error
  for (const [combinacion, info] of combinacionesConError.entries()) {
    const [numero1, numero2] = combinacion.split(',');
    const combinacionInversa = `${numero2},${numero1}`;
    
    // Si ya procesamos la combinación inversa, saltar esta
    if (combinacionesProcesadas.has(combinacionInversa)) {
      continue;
    }
    
    combinacionesProcesadas.add(combinacion);

    // Buscar en filas fijas
    filasFijas.value.forEach((fila, index) => {
      const numFormateado = String(fila.cuadrado).padStart(2, '0');
      if (numFormateado === numero1 || numFormateado === numero2) {
        if (!mensajesPorFila.has(index)) {
          mensajesPorFila.set(index, new Set()); // Usar Set para evitar duplicados
        }
        mensajesPorFila.get(index).add(info.mensaje);
      }
    });

    // Buscar en filas extra
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

  // Aplicar mensajes a las filas
  aplicarMensajesAFilas(mensajesPorFila);
}

const aplicarMensajesAFilas = (mensajesPorFila) => {
  // Aplicar a filas fijas
  const newMensajesFijos = [...mensajesError.value];
  
  mensajesPorFila.forEach((mensajesSet, index) => {
    if (index < filasFijas.value.length) {
      // Es una fila fija - convertir Set a array y unir
      const mensajesArray = Array.from(mensajesSet);
      newMensajesFijos[index] = mensajesArray.join(' | ');
    }
  });
  mensajesError.value = newMensajesFijos;

  // Aplicar a filas extra
  const newMensajesExtra = [...mensajesErrorExtra.value];
  
  mensajesPorFila.forEach((mensajesSet, index) => {
    if (index >= filasFijas.value.length) {
      // Es una fila extra
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

// MODIFICAR la función validarParlet existente:
const validarParlet = () => {
  const fila2 = filasFijas.value[2]
  const tieneCirculoSolo = !!fila2.circuloSolo
  
  // Limpiar bloqueo de círculo solo
  numerosBloqueados.value.delete('circulo-solo')
  
  if (tieneCirculoSolo) {
    // Validar el número del cuadrado para círculo solo si existe
    if (fila2.cuadrado) {
      const resultado = validarNumeroRestringido(fila2.cuadrado, 'circuloSolo', 2, 'fija')
      if (!resultado.esValido) {
        numerosBloqueados.value.add('circulo-solo')
      }
    }
    
    // SIEMPRE validar combinaciones cuando hay circuloSolo, sin importar cuántos cuadrados hay
    setTimeout(() => {
      validarCombinacionesParlet()
    }, 50)
  } else {
    // Limpiar mensajes de parlet de todas las filas
    limpiarMensajesParlet()
  }
  
  actualizarEstadoNumerosNoJuega()
}

const revalidarTodosLosCampos = () => {
  filasFijas.value.forEach((fila, index) => {
    if (fila.circulo1) validarCampo(fila.circulo1, 'circulo1', index);
    if (fila.circulo2) validarCampo(fila.circulo2, 'circulo2', index);
    validarFilaCompleta(index, 'fija');
  });
  filasExtra.value.forEach((fila, index) => {
    const globalIndex = filasFijas.value.length + index;
    if (fila.circulo1) validarCampo(fila.circulo1, 'circulo1', globalIndex);
    if (fila.circulo2) validarCampo(fila.circulo2, 'circulo2', globalIndex);
    validarFilaCompleta(index, 'extra');
  });
    
  // Validar campo circuloSolo
  if (filasFijas.value[2].circuloSolo) {
    validarCampo(filasFijas.value[2].circuloSolo, 'circuloSolo');
  }
  
  // Validar combinaciones de parlet
  validarParlet();

  revalidarTodosLosNumeros(filasFijas.value, filasExtra.value);
  actualizarEstadoNumerosNoJuega();
};

const actualizarEstadoNumerosNoJuega = () => {
  // Verificar si hay números bloqueados en nuestro registro
  const hayErroresNoJuega = numerosBloqueados.value.size > 0
  
  // Solo actualizar y emitir si el valor cambió
  if (hayNumerosNoJuega.value !== hayErroresNoJuega) {
    hayNumerosNoJuega.value = hayErroresNoJuega
    emit('update:hayNumerosNoJuega', hayNumerosNoJuega.value)
  }
}

// Watcher para detectar cambios en los números de los cuadrados
watch(() => [
  ...filasFijas.value.map(f => f.cuadrado),
  ...filasExtra.value.map(f => f.cuadrado),
  filasFijas.value[2].circuloSolo,
  filasExtra.value.length 
], () => {
  // Limpiar todos los números bloqueados relacionados con cuadrados
  const nuevasClaves = new Set()
  
  // Revalidar todas las filas para reconstruir el estado de bloqueo
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
  
  // Actualizar el conjunto de números bloqueados
  numerosBloqueados.value = nuevasClaves
  actualizarEstadoNumerosNoJuega()
  
  // Validar parlet después de un pequeño delay
  setTimeout(() => {
    validarCombinacionesParlet();
  }, 50);
}, { deep: true, immediate: true })


watch(horarioActual, (newHorario) => {
  revalidarTodosLosCampos();
});

watch(() => filasFijas.value, (newVal) => {
  revalidarTodosLosNumeros(newVal, filasExtra.value);
}, { deep: true });

watch(() => filasExtra.value, (newVal) => {
  // Solo ajustar la longitud del array de mensajes, no limpiarlos
  if (mensajesErrorExtra.value.length < newVal.length) {
    mensajesErrorExtra.value = [...mensajesErrorExtra.value, ...Array(newVal.length - mensajesErrorExtra.value.length).fill('')]
  }
  revalidarTodosLosNumeros(filasFijas.value, newVal);
}, { deep: true });

watch(() => filasExtra.value.length, (newLength, oldLength) => {
  // Si se agregó o removió una fila, validar parlet
  if (newLength !== oldLength) {
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
  ([cuadradosFijos, cuadradosExtra, circuloSolo]) => {
    if (circuloSolo) {
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
})

onUnmounted(() => {
  window.removeEventListener('horarioCambiado', revalidarTodosLosCampos)
  resetEstadoCompleto()
  numerosBloqueados.value.clear()
})
</script>


<style scoped>
.input-con-imagen {
  background-image: url('../assets/icons/Arrow downward alt.svg') !important;
  background-size: 24px 24px !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}
.container-main{
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Line 1 */
  border-top: 2px solid #F0F0FC;
  border-bottom: 2px solid #F0F0FC;
  flex: none;
  flex-grow: 0;
}
.scroll-container {
  display: flex;
  flex-direction: column;
  max-height: 330px;
  gap: 8px;
  width: 100%;
  overflow-y: auto;
  width: calc(100% - 8px); /* Ajuste para mayor ancho */
}
.btn-agregar-container {
  display: flex;
  justify-content: flex-start;
}

.input-row {
  display: flex;
  justify-content: space-between;
  gap: 10px; /* Aumenté el gap para mejor espacio */
  height: 48px;
  width: 100%;
}

/* Aumenté el tamaño de los inputs */
.cuadrado, .circular, .circular-solo {
  width: 70px; /* Aumenté de 64px a 70px */
  height: 48px;
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
}

/* Círculo solo - POSICIÓN FIJA ABSOLUTA (ajustada) */
.circulo-solo-fixed {
  margin-top: 113px;
  width: 70px;
  height: 48px;
}

/* Mantengo los demás estilos igual */
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

.circular, .circular-solo {
  background: #F3F3F3;
  border: 1px solid #F3F3F3;
  border-radius: 30px;
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

.input-invalido {
  border: 2px solid #ff4d4f !important;
  background-color: #fff2f0 !important;
}

/* Posicionamiento específico para el mensaje del círculo solo */
.circulo-solo-fixed {
  margin-top: 113px;
  width: 70px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Asegurar que los mensajes no desborden */
.input-row-container {
  display: flex;
  flex-direction: column;
}

.mensaje-error {
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
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

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>