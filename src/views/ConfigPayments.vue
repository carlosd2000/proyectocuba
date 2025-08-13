<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import SelectorHorario from '../components/SelectorHorario.vue';
import LimitedNumber from '../components/LimitedNumber.vue';
import CirclesPayments from '../components/CirclesPayments.vue';
import ButtonDouble from '../components/ButtonDouble.vue';
import Modal from '../components/Modal.vue';
import { useToastStore } from '../stores/toast'
import toggleon from '@/assets/icons/Toggleon.svg';
import toggleoff from '@/assets/icons/Toggleoff.svg';
import CheckIcon from '../assets/icons/Check.svg'

const router = useRouter()
const route = useRoute()

const toggleActivo = ref(false);
const modalType = ref(null);
const title = ref('');
const horarioSeleccionado = ref('Dia')
const toastStore = useToastStore()

const inputPrincipal = ref('')

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

const hayDatosParaGuardar = computed(() => {
  // Verificar input principal
  if (!inputPrincipal.value || inputPrincipal.value.trim() === '') return false
  
  // Verificar que los 3 LimitedNumber tengan datos
  return Object.values(montos.value).every(monto => monto.trim() !== '')
})

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
    if (origen === 'Fijo') {
        title.value = 'Fijo';
    }
    else if (origen === 'Corrido') {
        title.value = 'Corrido'
    }
    else if (origen === 'Parlet') {
        title.value = 'Parlet'
    }
}

const manejarSegundoBoton = (origen) => {
    modalType.value = 'NoJuega'
    if (origen === 'Fijo') {
        title.value = 'Fijo';
    }
    else if (origen === 'Corrido') {
        title.value = 'Corrido'
    }
    else if (origen === 'Parlet') {
        title.value = 'Parlet'
    }
}

const guardarDatosLimitados = (datos) => {
  console.log('Datos recibidos:', datos);
  
  // Determinar si es Limitado o NoJuega
  const esNoJuega = modalType.value === 'NoJuega';
  
  // Actualizar el estado correspondiente
  if (title.value === 'Fijo') {
    if (esNoJuega) {
      noJuegaFijo.value = datos;
      console.log('NoJuega Fijo actualizado:', noJuegaFijo.value);
    } else {
      limitadosFijo.value = datos;
      console.log('Limitados Fijo actualizado:', limitadosFijo.value);
    }
  } 
  else if (title.value === 'Corrido') {
    if (esNoJuega) {
      noJuegaCorrido.value = datos;
      console.log('NoJuega Corrido actualizado:', noJuegaCorrido.value);
    } else {
      limitadosCorrido.value = datos;
      console.log('Limitados Corrido actualizado:', limitadosCorrido.value);
    }
  } 
  else if (title.value === 'Parlet') {
    if (esNoJuega) {
      noJuegaParlet.value = datos;
      console.log('NoJuega Parlet actualizado:', noJuegaParlet.value);
    } else {
      limitadosParlet.value = datos;
      console.log('Limitados Parlet actualizado:', limitadosParlet.value);
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
        break;
      case 'Corrido':
        limitadosCorrido.value.numeros.splice(index, 1);
        break;
      case 'Parlet':
        limitadosParlet.value.numeros.splice(index, 1);
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

const guardar = () => {
  const datosParaGuardar = {
    inputPrincipal: inputPrincipal.value,
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
  }
  
  console.log('Datos a guardar:', datosParaGuardar)
  // 1. Obtener datos existentes de localStorage
  const todosLosDatos = JSON.parse(localStorage.getItem('configPagos') || '{}')
  
  // 2. Actualizar solo el horario actual
  todosLosDatos[horarioSeleccionado.value] = datosParaGuardar
  
  // 3. Guardar en localStorage
  localStorage.setItem('configPagos', JSON.stringify(todosLosDatos))
  
  console.log('Datos guardados para horario:', horarioSeleccionado.value)

  // Aquí puedes enviar los datos a tu backend o hacer lo que necesites
  toastStore.showToast(
    'Cambios guardados (offline)',
    'success',
    20000,
    CheckIcon,
    'bottom',
  )
  router.push(`/payments/${route.params.id}`)
}
</script>
<template>
    <div class="container-login d-flex flex-column align-items-center gap-2">
        <header>
            <Header/>
        </header>
        <main class="container-main">
            <div class="d-flex flex-column align-items-start gap-2 w-100">
                <h3>
                    Configurar nuevo pago
                </h3>
                <h5 class="body">
                    Configura el horario y los pagos que se aplicaran a las proximas tiradas
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-between align-items-center w-100" style="min-height: 36px;">
                <h5 class="label">
                    Horario
                </h5>
                <SelectorHorario @update:selected="handleSelect"/>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                <h5 class="label d-flex justify-content-start w-50">
                    Limite por jugada
                </h5>
                <div class="input d-flex flex-row align-items-center gap-1 w-50">
                    <h5 class="input-label">
                        $
                    </h5>
                    <input v-model="inputPrincipal" class="border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
                </div>
            </div>
            <div class="line"></div>
            <LimitedNumber title="Fijo" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton" @update:value="actualizarMonto"/>
            <CirclesPayments title="Fijo" tipo="Limitado" :lista="limitadosFijo" @eliminarNumero="handleEliminarNumero" @resetearMonto="handleResetearMonto"/>
            <CirclesPayments title="Fijo" tipo="NoJuega" :lista="noJuegaFijo" @eliminarNumero="handleEliminarNumero"/>
            <div class="line"></div>
            <LimitedNumber title="Corrido" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton" @update:value="actualizarMonto"/>
            <CirclesPayments title="Corrido" tipo="Limitado" :lista="limitadosCorrido" @eliminarNumero="handleEliminarNumero" @resetearMonto="handleResetearMonto"/>
            <CirclesPayments title="Corrido" tipo="NoJuega" :lista="noJuegaCorrido" @eliminarNumero="handleEliminarNumero"/>
            <div class="line"></div>
            <LimitedNumber title="Parlet" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton" @update:value="actualizarMonto"/>
            <CirclesPayments title="Parlet" tipo="Limitado" :lista="limitadosParlet" @eliminarNumero="handleEliminarNumero" @resetearMonto="handleResetearMonto"/>
            <CirclesPayments title="Parlet" tipo="NoJuega" :lista="noJuegaParlet" @eliminarNumero="handleEliminarNumero"/>
            <div class="line"></div>
            <div class="d-flex justify-content-between align-items-center gap-1 w-100">
                <h5 class="label">
                    Activar bote
                </h5>
                <button class="p-0 btn bg-transparent" @click="cambiarToggle()">
                    <img :src="toggleActivo ? toggleon : toggleoff" alt="Toggle" width="48" />
                </button>
            </div>
            <Modal v-if="modalType" :title="title" :type="modalType" @cerrar="modalType = null" @guardarLimitados="guardarDatosLimitados"/>
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
</style>