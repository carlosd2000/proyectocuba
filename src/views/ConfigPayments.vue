<script setup>
import { ref } from 'vue';
import Header from '../components/Header.vue';
import SelectorHorario from '../components/SelectorHorario.vue';
import LimitedNumber from '../components/LimitedNumber.vue';
import CirclesPayments from '../components/CirclesPayments.vue';
import ButtonDouble from '../components/ButtonDouble.vue';
import Modal from '../components/Modal.vue';
import toggleon from '@/assets/icons/Toggleon.svg';
import toggleoff from '@/assets/icons/Toggleoff.svg';

const toggleActivo = ref(false);
const modalType = ref(null);
const title = ref('');

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

const cambiarToggle = () => {
    toggleActivo.value = !toggleActivo.value;
};

const handleSelect = (selected) => {
    
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

const guardar = () => {
    
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
                    <input class="border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
                </div>
            </div>
            <div class="line"></div>
            <LimitedNumber title="Fijo" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton"/>
            <CirclesPayments title="Fijo" tipo="Limitado" :lista="limitadosFijo" @eliminarNumero="handleEliminarNumero"/>
            <CirclesPayments title="Fijo" tipo="NoJuega" :lista="noJuegaFijo" @eliminarNumero="handleEliminarNumero"/>
            <div class="line"></div>
            <LimitedNumber title="Corrido" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton"/>
            <CirclesPayments title="Corrido" tipo="Limitado" :lista="limitadosCorrido" @eliminarNumero="handleEliminarNumero"/>
            <CirclesPayments title="Corrido" tipo="NoJuega" :lista="noJuegaCorrido" @eliminarNumero="handleEliminarNumero"/>
            <div class="line"></div>
            <LimitedNumber title="Parlet" @accionPimerBoton="manejarPrimerBoton" @accionSegundoBoton="manejarSegundoBoton"/>
            <CirclesPayments title="Parlet" tipo="Limitado" :lista="limitadosParlet" @eliminarNumero="handleEliminarNumero"/>
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
            <ButtonDouble fistbutton="Cancelar" secondbutton="Guardar" :isEnabled="false" @accionSegundoBoton="guardar"/>
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