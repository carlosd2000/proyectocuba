<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToastStore } from '../stores/toast'
import { useAuthStore } from '@/stores/authStore';
import { useOfflineQueueStore } from '@/stores/offlineQueue'
import Header from '../components/Header.vue';
import SelectorHorario from '../components/SelectorHorario.vue';
import LimitedNumber from '../components/LimitedNumber.vue';
import CirclesPayments from '../components/CirclesPayments.vue';
import ButtonDouble from '../components/ButtonDouble.vue';
import Modal from '../components/Modal.vue';
import toggleon from '@/assets/icons/Toggleon.svg';
import toggleoff from '@/assets/icons/Toggleoff.svg';
import CheckIcon from '../assets/icons/Check.svg'

const router = useRouter()
const route = useRoute()

const toggleActivo = ref(false);
const modalType = ref(null);
const title = ref('');
const horarioSeleccionado = ref(null)
const authStore = useAuthStore();
const toastStore = useToastStore()

const limitePorJugada = ref('')
const modalInitialData = ref(null);

const inputBoteFijo = ref('');
const inputBoteCorrido = ref('');
const inputBoteParlet = ref('');

const montos = ref({
  Fijo: '',
  Corrido: '',
  Parlet: ''
})

// Estado para los limitados
const limitadosFijo = ref({
    monto: '',
    numeros: []
});

const limitadosCorrido = ref({
    monto: '',
    numeros: []
});

const limitadosParlet = ref({
    monto: '',
    numeros: []
});

// Estado para NoJuega
const noJuegaFijo = ref({
    monto: '',
    numeros: []
});

const noJuegaCorrido = ref({
    monto: '',
    numeros: []
});

const noJuegaParlet = ref({
    monto: '',
    numeros: []
});

const esModoEdicion = computed(() => {
  return !!route.query.edit && !!route.query.horario;
});

const hayDatosParaGuardar = computed(() => {
  if (!horarioSeleccionado.value) return false;
  // Validar datos básicos
  if (!limitePorJugada.value || limitePorJugada.value.trim() === '') return false;
  if (!Object.values(montos.value).every(monto => monto.trim() !== '')) return false;
  
  // Si el bote está activo, validar que todos los montos del bote estén completos
  if (toggleActivo.value) {
    if (!inputBoteFijo.value || !inputBoteCorrido.value || !inputBoteParlet.value) {
      return false;
    }
  }
  
  return true;
});

const actualizarMonto = ({ title, monto }) => {
  montos.value[title] = monto
}

const cambiarToggle = () => {
    toggleActivo.value = !toggleActivo.value;
};

function handleSelect(valor) {
  switch (valor) {
    case '1': horarioSeleccionado.value = 'Dia'; break
    case '2': horarioSeleccionado.value = 'Tarde'; break
    case '3': horarioSeleccionado.value = 'Noche'; break
    default: horarioSeleccionado.value = 'Dia'
  }
}

const manejarPrimerBoton = (origen) => {
  modalType.value = 'Limitado'
  title.value = origen;
  modalInitialData.value = null; // Modal vacío
}

const manejarSegundoBoton = (origen) => {
  modalType.value = 'NoJuega'
  title.value = origen;
  modalInitialData.value = null; // Modal vacío
}

// ...existing code...
const manejarEditar = ({ tipo, title: titulo }) => {
  modalType.value = tipo;
  title.value = titulo;

  // Busca los datos actuales según tipo y title
  let datos = { monto: '', numeros: [] };
  if (tipo === 'Limitado') {
    if (titulo === 'Fijo') datos = { ...limitadosFijo.value };
    else if (titulo === 'Corrido') datos = { ...limitadosCorrido.value };
    else if (titulo === 'Parlet') datos = { ...limitadosParlet.value };
  } else if (tipo === 'NoJuega') {
    if (titulo === 'Fijo') datos = { ...noJuegaFijo.value };
    else if (titulo === 'Corrido') datos = { ...noJuegaCorrido.value };
    else if (titulo === 'Parlet') datos = { ...noJuegaParlet.value };
  }
  modalInitialData.value = datos;
}

const guardarDatosLimitados = (datos) => {
  
  if (datos.numeros.length === 0) {
    datos.monto = '';
  }

  // Determinar si es Limitado o NoJuega
  const esNoJuega = modalType.value === 'NoJuega';
  
  // Actualizar el estado correspondiente
  if (title.value === 'Fijo') {
    if (esNoJuega) {
      noJuegaFijo.value = datos;
    } else {
      limitadosFijo.value = datos;
    }
  } 
  else if (title.value === 'Corrido') {
    if (esNoJuega) {
      noJuegaCorrido.value = datos;
    } else {
      limitadosCorrido.value = datos;
    }
  } 
  else if (title.value === 'Parlet') {
    if (esNoJuega) {
      noJuegaParlet.value = datos;
    } else {
      limitadosParlet.value = datos;
    }
  }
  
  // Cierra el modal
  modalType.value = null;
};

const handleEliminarNumero = ({ tipo, title, index }) => {
  if (tipo === 'Limitado') {
    switch(title) {
      case 'Fijo':
        limitadosFijo.value.numeros.splice(index, 1);
        if (limitadosFijo.value.numeros.length === 0) {
          limitadosFijo.value.monto = '';
        }
        break;
      case 'Corrido':
        limitadosCorrido.value.numeros.splice(index, 1);
        if (limitadosCorrido.value.numeros.length === 0) {
          limitadosCorrido.value.monto = '';
        }
        break;
      case 'Parlet':
        limitadosParlet.value.numeros.splice(index, 1);
        if (limitadosParlet.value.numeros.length === 0) {
          limitadosParlet.value.monto = '';
        }
        break;
    }
  } else { // NoJuega
    switch(title) {
      case 'Fijo':
        noJuegaFijo.value.numeros.splice(index, 1);
        break;
      case 'Corrido':
        noJuegaCorrido.value.numeros.splice(index, 1);
        break;
      case 'Parlet':
        noJuegaParlet.value.numeros.splice(index, 1);
        break;
    }
  }
}

const handleResetearMonto = ({ tipo, title }) => {
  if (tipo === 'Limitado') {
    switch(title) {
      case 'Fijo':
        limitadosFijo.value.monto = '';
        break;
      case 'Corrido':
        limitadosCorrido.value.monto = '';
        break;
      case 'Parlet':
        limitadosParlet.value.monto = '';
        break;
    }
  }
}

const formatForStorage = () => {
  const now = new Date();
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[now.getMonth()]} ${now.getDate().toString().padStart(2, '0')} | ${
         now.getHours().toString().padStart(2, '0')}:${
         now.getMinutes().toString().padStart(2, '0')}`;
};

const transformarParaFirestore = (data) => {
  const transformarNumeros = (numeros) => {
    if (numeros === undefined || numeros === null) return '';
    if (!Array.isArray(numeros)) return numeros.toString();
    
    // Si es un array de arrays (como en Parlet)
    if (numeros.length > 0 && Array.isArray(numeros[0])) {
      return JSON.stringify(numeros); // Convertir a string JSON
    }
    
    // Si es un array simple
    return numeros.join(',');
  };

  const safeData = {
    ...data,
    limitados: {
      Fijo: data.limitados?.Fijo || { monto: '', numeros: [] },
      Corrido: data.limitados?.Corrido || { monto: '', numeros: [] },
      Parlet: data.limitados?.Parlet || { monto: '', numeros: [] }
    },
    noJuega: {
      Fijo: data.noJuega?.Fijo || { numeros: [] },
      Corrido: data.noJuega?.Corrido || { numeros: [] },
      Parlet: data.noJuega?.Parlet || { numeros: [] }
    }
  };

  return {
    limitePorJugada: safeData.limitePorJugada,
    montos: safeData.montos,
    limitados: {
      Fijo: {
        monto: safeData.limitados.Fijo.monto,
        numeros: transformarNumeros(safeData.limitados.Fijo.numeros)
      },
      Corrido: {
        monto: safeData.limitados.Corrido.monto,
        numeros: transformarNumeros(safeData.limitados.Corrido.numeros)
      },
      Parlet: {
        monto: safeData.limitados.Parlet.monto,
        numeros: transformarNumeros(safeData.limitados.Parlet.numeros)
      }
    },
    noJuega: {
      Fijo: {
        numeros: transformarNumeros(safeData.noJuega.Fijo.numeros)
      },
      Corrido: {
        numeros: transformarNumeros(safeData.noJuega.Corrido.numeros)
      },
      Parlet: {
        numeros: transformarNumeros(safeData.noJuega.Parlet.numeros)
      }
    },
    boteActivo: safeData.boteActivo,
    boteMonto: safeData.boteMonto,
    hora: safeData.hora
  };
};

const guardar = async () => {
  if (!hayDatosParaGuardar.value) {
    toastStore.showToast(
      'Complete todos los campos requeridos',
      'error',
      2000,
      null,
      'bottom',
    );
    return;
  }

  if (toggleActivo.value === false) {
    inputBoteFijo.value = 0;
    inputBoteCorrido.value = 0;
    inputBoteParlet.value = 0;
  }

  const datosParaGuardar = {
    limitePorJugada: limitePorJugada.value,
    montos: {
      Fijo: montos.value.Fijo,
      Corrido: montos.value.Corrido,
      Parlet: montos.value.Parlet,
    },
    limitados: {
      Fijo: limitadosFijo.value,
      Corrido: limitadosCorrido.value,
      Parlet: limitadosParlet.value,
    },
    noJuega: {
      Fijo: noJuegaFijo.value,
      Corrido: noJuegaCorrido.value,
      Parlet: noJuegaParlet.value,
    },
    boteActivo: toggleActivo.value,
    boteMonto: {
      Fijo: inputBoteFijo.value || 0,
      Corrido: inputBoteCorrido.value || 0,
      Parlet: inputBoteParlet.value || 0,
    },
    hora: formatForStorage(),
  }

  const datosFirestore = transformarParaFirestore(datosParaGuardar);
  const datosLocal = {
    ...datosParaGuardar,
    // Asegurar que los arrays vacíos se mantengan como arrays
    limitados: {
      Fijo: { ...datosParaGuardar.limitados.Fijo, numeros: datosParaGuardar.limitados.Fijo.numeros || [] },
      Corrido: { ...datosParaGuardar.limitados.Corrido, numeros: datosParaGuardar.limitados.Corrido.numeros || [] },
      Parlet: { ...datosParaGuardar.limitados.Parlet, numeros: datosParaGuardar.limitados.Parlet.numeros || [] }
    },
    noJuega: {
      Fijo: { ...datosParaGuardar.noJuega.Fijo, numeros: datosParaGuardar.noJuega.Fijo.numeros || [] },
      Corrido: { ...datosParaGuardar.noJuega.Corrido, numeros: datosParaGuardar.noJuega.Corrido.numeros || [] },
      Parlet: { ...datosParaGuardar.noJuega.Parlet, numeros: datosParaGuardar.noJuega.Parlet.numeros || [] }
    }
  };

  // Guardar en localStorage primero
  const todosLosDatos = JSON.parse(localStorage.getItem('configPagos') || '{}');
  todosLosDatos[horarioSeleccionado.value] = datosLocal;
  localStorage.setItem('configPagos', JSON.stringify(todosLosDatos));


  try {
    const docRef = doc(db, "bancos", authStore.bancoId);
    await setDoc(docRef, {
      configPagos: {
        [horarioSeleccionado.value]: datosFirestore
      }
    }, { merge: true });
    
    const mensaje = esModoEdicion.value 
      ? 'Pago actualizado exitosamente' 
      : 'Pago creado exitosamente';
    
    toastStore.showToast(
      mensaje,
      'success',
      2000, // Cambié de 20000 a 2000 (20 segundos era demasiado)
      CheckIcon,
      'bottom',
    );
  } catch (error) {
    console.error("Error guardando en Firestore:", error);
    
    // Añadir a cola offline
    const firestoreOperation = {
      type: 'updateConfigPagos',
      data: {
        bancoId: authStore.bancoId,
        horario: horarioSeleccionado.value,
        config: datosFirestore
      },
      timestamp: new Date().getTime()
    };
    
    const offlineQueue = useOfflineQueueStore();
    offlineQueue.addOperation(firestoreOperation);
    
    toastStore.showToast(
      'Pago creado exitosamente (offline)',
      'warning',
      2000,
      CheckIcon,
      'top',
    );
  }
  
  router.push(`/payments/${route.params.id}`);
}

const cargarConfiguracionExistente = (horario) => {
  const configGuardada = JSON.parse(localStorage.getItem('configPagos') || '{}');
  const configHorario = configGuardada[horario];
  
  if (configHorario) {
    // Establecer el horario seleccionado
    horarioSeleccionado.value = horario;

    // Cargar datos básicos
    limitePorJugada.value = configHorario.limitePorJugada;
    montos.value = { ...configHorario.montos };

    toggleActivo.value = configHorario.boteActivo;
    inputBoteFijo.value = configHorario.boteMonto?.Fijo || '';
    inputBoteCorrido.value = configHorario.boteMonto?.Corrido || '';
    inputBoteParlet.value = configHorario.boteMonto?.Parlet || '';
    
    // Cargar limitados y noJuega
    limitadosFijo.value = { ...configHorario.limitados?.Fijo || { monto: '', numeros: [] } };
    limitadosCorrido.value = { ...configHorario.limitados?.Corrido || { monto: '', numeros: [] } };
    limitadosParlet.value = { ...configHorario.limitados?.Parlet || { monto: '', numeros: [] } };
    
    noJuegaFijo.value = { ...configHorario.noJuega?.Fijo || { monto: '', numeros: [] } };
    noJuegaCorrido.value = { ...configHorario.noJuega?.Corrido || { monto: '', numeros: [] } };
    noJuegaParlet.value = { ...configHorario.noJuega?.Parlet || { monto: '', numeros: [] } };
  }
};

onMounted(() => {
  const route = useRoute();
  
  // Si estamos en modo edición
  if (route.query.edit && route.query.horario) {
    cargarConfiguracionExistente(route.query.horario);
  }
});
</script>
<template>
    <div class="container-login d-flex flex-column align-items-center gap-2">
        <header>
            <Header/>
        </header>
        <main class="container-main">
            <div class="d-flex flex-column align-items-start gap-2 w-100">
                <h3>
                    {{ esModoEdicion ? 'Editar pago' : 'Configurar nuevo pago' }}
                </h3>
                <h5 class="body">
                    Configura el horario y los pagos que se aplicaran a las proximas tiradas
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-between align-items-center w-100" style="min-height: 36px;">
                <h5 class="label">
                    Horario
                </h5>
                <SelectorHorario @update:selected="handleSelect" :horarioEdicion="horarioSeleccionado" :modoEdicion="!!$route.query.edit" :filtrarPorLocalStorage="true"/>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                <h5 class="label d-flex justify-content-start w-50">
                    Limite por jugada
                </h5>
                <div class="input d-flex flex-row align-items-center gap-1 w-50">
                    <h5 class="input-label">
                        $
                    </h5>
                    <input v-model="limitePorJugada" class="label border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
                </div>
            </div>
            <div class="line"></div>
            <LimitedNumber title="Fijo" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton" @update:value="actualizarMonto" :monto-inicial="montos.Fijo"/>
            <CirclesPayments title="Fijo" tipo="Limitado" :lista="limitadosFijo" @eliminarNumero="handleEliminarNumero" @resetearMonto="handleResetearMonto" @editar="manejarEditar"/>
            <CirclesPayments title="Fijo" tipo="NoJuega" :lista="noJuegaFijo" @eliminarNumero="handleEliminarNumero" @editar="manejarEditar"/>
            <div class="line"></div>
            <LimitedNumber title="Corrido" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton" @update:value="actualizarMonto" :monto-inicial="montos.Corrido"/>
            <CirclesPayments title="Corrido" tipo="Limitado" :lista="limitadosCorrido" @eliminarNumero="handleEliminarNumero" @resetearMonto="handleResetearMonto" @editar="manejarEditar"/>
            <CirclesPayments title="Corrido" tipo="NoJuega" :lista="noJuegaCorrido" @eliminarNumero="handleEliminarNumero" @editar="manejarEditar"/>
            <div class="line"></div>
            <LimitedNumber title="Parlet" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton" @update:value="actualizarMonto" :monto-inicial="montos.Parlet"/>
            <CirclesPayments title="Parlet" tipo="Limitado" :lista="limitadosParlet" @eliminarNumero="handleEliminarNumero" @resetearMonto="handleResetearMonto" @editar="manejarEditar"/>
            <CirclesPayments title="Parlet" tipo="NoJuega" :lista="noJuegaParlet" @eliminarNumero="handleEliminarNumero" @editar="manejarEditar"/>
            <div class="line"></div>
            <div class="d-flex flex-column justify-content-center align-items-center gap-2 w-100">
                <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                    <h5 class="label">
                        Activar bote
                    </h5>
                    <button class="p-0 btn bg-transparent" @click="cambiarToggle()">
                        <img :src="toggleActivo ? toggleon : toggleoff" alt="Toggle" width="48" />
                    </button>
                </div>
                <div v-if="toggleActivo" class="d-flex flex-column justify-content-center align-items-center gap-2 w-100">
                    <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                        <h5 class="label d-flex justify-content-start w-50">
                            Fijo
                        </h5>
                        <div class="input d-flex flex-row align-items-center gap-1 w-50">
                            <h5 class="input-label">
                                $
                            </h5>
                            <input v-model="inputBoteFijo" class="label border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                        <h5 class="label d-flex justify-content-start w-50">
                            Corrido
                        </h5>
                        <div class="input d-flex flex-row align-items-center gap-1 w-50">
                            <h5 class="input-label">
                                $
                            </h5>
                            <input v-model="inputBoteCorrido" class="label border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                        <h5 class="label d-flex justify-content-start w-50">
                            Parlet
                        </h5>
                        <div class="input d-flex flex-row align-items-center gap-1 w-50">
                            <h5 class="input-label">
                                $
                            </h5>
                            <input v-model="inputBoteParlet" class="label border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;"/>
                        </div>
                    </div>
                </div>
            </div>
            <Modal v-if="modalType" :title="title" :type="modalType" :initialData="modalInitialData" @cerrar="modalType = null" @guardarLimitados="guardarDatosLimitados"/>
        </main>
        <footer>
            <ButtonDouble fistbutton="Cancelar" secondbutton="Guardar" :isEnabled="hayDatosParaGuardar" @accionSegundoBoton="guardar"/>
        </footer>
    </div>
</template>
<style scoped>
.container-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 16px;
    height: calc(100vh - 7% - 100px);
    gap: 20px;
    width: 100%;
    overflow-y: auto;
}
.input{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 12px 8px 16px;
    gap: 10px;
    height: 48px;
    width: 100%;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    flex-grow: 1;
}
.line{
    width: 100%;
    height: 2px;
    border: 1px solid #F0F0FC;
    flex: none;
    flex-grow: 0;
}
input::placeholder {
  color: #9B9BA2; /* Cambia el color del placeholder */
  opacity: 1; /* Asegura que el color se vea en todos los navegadores */
}
</style>