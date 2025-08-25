<script setup>
import { toRef, reactive, watch, computed, onMounted } from 'vue'
import useLista from '../scripts/Lista.js'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  fecha: Date,
  horario: String,
  candadoAbierto: Boolean,
  apuestas: Array,
  opcionSeleccionada: String // Nuevo prop para saber si estamos en "Lista" o "Bote"
})

const fechaRef = toRef(props, 'fecha')
const detallesVisibles = reactive(new Set())

const toggleDetalles = (personaId) => {
  const apuesta = props.apuestas.find(a => a.id === personaId)
  console.log('Información de apuesta:', {
    ...apuesta,
    ganadorType: typeof apuesta?.ganador
  })
  if (detallesVisibles.has(personaId)) {
    detallesVisibles.delete(personaId)
  } else {
    detallesVisibles.add(personaId)
  }
}

const {
  mostrarModal,
  mostrarConfirmacionEliminar,
  personaSeleccionada,
  isOnline,
  isSyncing,
  apuestasLocales,
  apuestasCombinadas,
  cuadroClick,
  cerrarModal,
  editarPersona,
  eliminarPersona,
  confirmarEliminar,
  mostrarHora,
  obtenerIconoEstado
} = useLista(fechaRef, router, route)

// Función para verificar si supera el bote
const superaBote = (apuesta) => {
  // Obtener configuración de pagos del horario actual
  const configPagos = JSON.parse(localStorage.getItem('configPagos') || '{}');
  const configHorario = configPagos[props.horario] || {};
  
  // Si bote no está activo para este horario, no supera bote
  if (!configHorario.boteActivo) return false;
  
  // Tipos de apuestas que NO deben ir a bote
  const tiposExcluidos = ['centena']; // Fácil de agregar más tipos
  
  // Si el tipo está excluido, no va a bote
  if (apuesta.tipo && tiposExcluidos.includes(apuesta.tipo.toLowerCase())) {
    return false;
  }
  
  const { Fijo = 0, Corrido = 0, Parlet = 0 } = configHorario.boteMonto || {};
  
  // Verificar círculo solo (Parlet)
  if (apuesta.circuloSolo && Number(apuesta.circuloSolo) > Parlet) {
    return true;
  }
  
  // Verificar datos de apuesta
  if (apuesta.datos) {
    return apuesta.datos.some(d => {
      const c1 = d.circulo1 ? Number(d.circulo1) : 0;
      const c2 = d.circulo2 ? Number(d.circulo2) : 0;
      return c1 > Fijo || c2 > Corrido;
    });
  }
  
  return false;
}

const apuestasFiltradas = computed(() => {
  return props.apuestas.filter(apuesta => {
    const mismoHorario = apuesta.horario?.toLowerCase() === props.horario?.toLowerCase()
    if (!mismoHorario) return false;
    
    if (props.opcionSeleccionada === 'Bote') return superaBote(apuesta)
    if (props.opcionSeleccionada === 'Lista') return !superaBote(apuesta)
    return true;
  })
})

const esNumeroGanador = (persona, tipoNumero, valor, mapa) => {
  if (tipoNumero !== 'cuadrado') return false;

  const hoy = new Date().toISOString().slice(0, 10);
  const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}');
  const tiroGanador = tirosLocales[hoy]?.[persona.horario]?.tiro;
  
  if (!tiroGanador) return false;

  const [primerNumero, corrido1, corrido2] = tiroGanador.split('-');
  const fijo = primerNumero.slice(-2); // Últimos 2 dígitos del primer número
  const cuadradoStr = valor.toString().padStart(2, '0');
  const cuadrado3Str = valor.toString().padStart(3, '0');

  // Verificar si es ganador independientemente del estado de persona.ganador
  const esFijoGanador = cuadradoStr === fijo && 
                        mapa.circulo1 !== undefined && 
                        mapa.circulo1 !== null && 
                        mapa.circulo1 !== '';
  
  const esCorridoGanador = (cuadradoStr === corrido1 || cuadradoStr === corrido2) && 
                          mapa.circulo2 !== undefined && 
                          mapa.circulo2 !== null && 
                          mapa.circulo2 !== '';

  const esCentenaGanador = cuadrado3Str === primerNumero && 
                          persona.circuloSolo !== undefined && 
                          persona.circuloSolo !== null && 
                          persona.circuloSolo !== '';

  // VERIFICAR PARLET - Si el número es parte de una combinación ganadora
  let esParletGanador = false;
  if (persona.circuloSolo !== undefined && persona.circuloSolo !== null && persona.circuloSolo !== '') {
    // Obtener todos los cuadrados de la apuesta
    const cuadrados = persona.datos
      ?.map(mapa => mapa.cuadrado?.toString().padStart(2, '0'))
      .filter(Boolean) || [];
    
    // Números del tiro para parlet (solo corrido1 y corrido2)
    const numerosTiroParlet = [corrido1, corrido2];
    
    // Contar cuántos cuadrados coinciden con los números del tiro
    const coincidencias = cuadrados.filter(cuadrado => 
      numerosTiroParlet.includes(cuadrado)
    );
    
    // Verificar si este número específico es parte de las coincidencias
    // Y si hay al menos 2 coincidencias en total (para formar parlet)
    esParletGanador = numerosTiroParlet.includes(cuadradoStr) && 
                     coincidencias.length >= 2 &&
                     coincidencias.includes(cuadradoStr);
  }

  return esFijoGanador || esCorridoGanador || esParletGanador || esCentenaGanador;
};

const calcularPremio = (persona) => {
  if (!persona.ganador) return 0;
  
  const hoy = new Date().toISOString().slice(0, 10);
  const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}');
  const tiroGanador = tirosLocales[hoy]?.[persona.horario]?.tiro;
  
  if (!tiroGanador) return 0;
  
  const [primerNumero, corrido1, corrido2] = tiroGanador.split('-');
  const fijo = primerNumero.slice(-2); // Últimos 2 dígitos del primer número
  
  // Obtener configuración del horario
  const configPagos = JSON.parse(localStorage.getItem('configPagos') || '{}');
  const configHorario = configPagos[persona.horario] || {};
  const { montos = {}, limitados = {}, noJuega = {} } = configHorario;
  
  let premioTotal = 0;
  
  // Verificar cada fila de datos de la apuesta
  persona.datos?.forEach(mapa => {
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
  if (persona.circuloSolo !== undefined && persona.circuloSolo !== null && persona.circuloSolo !== '') {
    const circuloSolo = Number(persona.circuloSolo) || 0;
    
    if (circuloSolo > 0) {
      // Obtener todos los cuadrados de la apuesta
      const cuadrados = persona.datos
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
  if (persona.circuloSolo !== undefined && persona.circuloSolo !== null && persona.circuloSolo !== '') {
    const circuloSolo = Number(persona.circuloSolo) || 0;
    
    if (circuloSolo > 0) {
      // Buscar si algún cuadrado es la centena completa
      const tieneCentena = persona.datos?.some(mapa => {
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

onMounted(() => {
  console.log('📋 Apuestas combinadas:', apuestasCombinadas.value)
  console.log('📋 Apuestas filtradas:', apuestasFiltradas.value)
})

const handleEditClick = (persona, event) => {
  event.stopPropagation()
  if (props.candadoAbierto || persona.estado === 'Pendiente' || persona.estado === 'EditadoOffline') {
    cuadroClick(persona)
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Acción no disponible',
      text: 'El candado está cerrado y no puedes editar esta apuesta',
      timer: 1500
    })
  }
}
</script>

<!-- El resto del template y estilos se mantiene EXACTAMENTE IGUAL -->

<template>
  <div v-if="!isOnline" class="offline-banner bg-warning text-center p-1 mb-1">
    Modo offline - mostrando datos cacheados
    <span v-if="isSyncing" class="ms-2">Sincronizando...</span>
  </div>
  
  <div v-if="!apuestasFiltradas.length" class="d-flex justify-content-center align-items-center h-100">
    <h5 class="body">
      Aún no hay jugadas en la lista
    </h5>
  </div>
  
  <div v-for="persona in apuestasFiltradas" 
       :key="`${persona.id}-${persona.estado}-${persona.sincronizadoEn || persona.creadoEn}`"
       class="container-list" 
       style="cursor: pointer;" 
       :class="{ 
         'apuesta-pendiente': persona.estado === 'Pendiente',
         'apuesta-editada': persona.estado === 'EditadoOffline',
         'eliminando': persona.estado === 'Eliminando'
       }" @click="toggleDetalles(persona.id)">
    <header class="d-flex flex-row justify-content-between align-items-center h-100">
      <div class="container-title d-flex justify-content-center align-items-center">
        <img v-if="persona.ganador === true" src="../assets/icons/Star_fill.svg" alt="Avatar" class="avatar px-2">        
        <h5 class="body">{{ persona.nombre }}</h5>
      </div>
      <div class="container-cloud d-flex flex-row justify-content-center align-items-center">
        <img :src="obtenerIconoEstado(persona)" alt="">
        <h5 class="small">{{ mostrarHora(persona) }}</h5>
        <img src="../assets/icons/Expand.svg" alt="">
      </div>
    </header>
    <main v-if="detallesVisibles.has(persona.id)" class="row m-0 p-0 w-100 gap-1">
      <div class="col-12 container-apuestas p-0 py-1 d-flex flex-row justify-content-center align-items-center">
        <div class="col-1 d-flex justify-content-center align-items-start h-100">
          <div
            class="container-edit-button my-2"
            :class="{ 'disabled': !candadoAbierto}"
            @click="handleEditClick(persona, $event)"
          >
            <img src="../assets/icons/Editar.svg" alt="">
          </div>
        </div>
        <div class="col-8 apuestas d-flex flex-column justify-content-center align-items-start">
          <div v-for="(mapa, index) in persona.datos" :key="index" class="my-1 w-100">
            <div class="d-flex align-items-center flex-wrap justify-content-around container-line">
              <div class="col-4">
                <div v-if="'cuadrado' in mapa" class="d-flex justify-content-center align-items-center container-number"
                  :class="{ 'numero-ganador': esNumeroGanador(persona, 'cuadrado', mapa['cuadrado'], mapa) }">
                  <p class="label d-flex justify-content-center align-items-center"
                  :class="{ 'numero-ganador': esNumeroGanador(persona, 'cuadrado', mapa['cuadrado'], mapa) }">
                    {{ mapa['cuadrado'] }}
                  </p>
                </div>
              </div>
              <div class="col-3">
                <div v-if="'circulo1' in mapa" class="d-flex justify-content-center align-items-center container-number">
                  <p class="label d-flex justify-content-center align-items-center">
                    {{ mapa['circulo1'] }}
                  </p>
                </div>
              </div>
              <div class="col-3">
                <div v-if="'circulo2' in mapa" class="d-flex justify-content-center align-items-center container-number">
                  <p class="label d-flex justify-content-center align-items-center">
                    {{ mapa['circulo2'] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-2 d-flex justify-content-center align-items-center">
          <div v-if="persona.circuloSolo !== undefined && persona.circuloSolo !== null" class="d-flex justify-content-center align-items-center container-number">
            <h5 class="label">{{ persona.circuloSolo }}</h5>
          </div>
        </div>
      </div>
      <div class="line"></div>
      <div class="p-2 d-flex flex-row justify-content-between align-items-center w-100">
        <div class="d-flex flex-column justify-content-center align-items-center gap-1">
          <h5 class="label">${{ Number(persona.totalGlobal) || 0 }}</h5>
          <div class="d-flex flex-row justify-content-center align-items-center gap-1">
            <img src="../assets/icons/Coin.svg" alt="">
            <h5 class="body">Bruto</h5>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-center align-items-center gap-1">
          <h5 class="label">${{ calcularPremio(persona) || 0 }}</h5>
          <div class="d-flex flex-row justify-content-center align-items-center gap-1">
            <img src="../assets/icons/Star.svg" alt="">
            <h5 class="body">Premio</h5>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-center align-items-center gap-1">
          <h5 class="label">${{ Number(persona.totalGlobal) - calcularPremio(persona) || 0 }}</h5>
          <div class="d-flex flex-row justify-content-center align-items-center gap-1">
            <img src="../assets/icons/Ganancia.svg" alt="">
            <h5 class="body">Neto</h5>
          </div>
        </div>
      </div>
    </main>
    <footer class="col-12 m-0 p-0 d-flex justify-conten-center align-items-center">
      <div class="col-12 m-0 p-0 d-flex justify-content-end align-items-center">
        <div class="mx-2 d-flex justify-content-center align-items-center">
          <i class="icon-estado" :class="obtenerIconoEstado(persona)"></i>
          <span v-if="!isOnline && persona.estado !== 'Pendiente' && persona.estado !== 'EditadoOffline'" 
                class="ms-1 badge bg-warning text-dark">Offline</span>
          <span v-if="persona.estado === 'Pendiente'" 
                class="ms-1 badge bg-primary text-white">Pendiente</span>
          <span v-if="persona.estado === 'EditadoOffline'" 
                class="ms-1 badge bg-info text-dark">Editada</span>
        </div>
      </div>
    </footer>
  </div>
  <!-- Modal personalizado -->
  <div v-if="mostrarModal" class="custom-modal-backdrop" @click="cerrarModal">
    <div class="custom-modal" @click.stop>
      <div class="button-group">
        <button @click="editarPersona" class="btn editar btn-page">
          Editar
        </button>
        <button @click="confirmarEliminar" class="btn eliminar">
          Eliminar
        </button>
      </div>
    </div>
  </div>
  <!-- Modal de confirmación de eliminación -->
  <div v-if="mostrarConfirmacionEliminar" class="custom-modal-backdrop" @click="mostrarConfirmacionEliminar = false">
    <div class="custom-modal-aceptar" @click.stop>
      <h3>¿Estás seguro de eliminar a {{ personaSeleccionada?.nombre }}?</h3>
      <div class="button-group">
        <button @click="eliminarPersona" class="btn eliminar-confirmar">Sí, eliminar</button>
        <button @click="mostrarConfirmacionEliminar = false" class="btn cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line {
  width: 343px;
  height: 2px;
  border: 1px solid #F0F0FC;
  flex: none;
  flex-grow: 0;
}

.small, .body {
  color: #696974;
}

.container-cloud {
  gap: 6px;
}

.container-title {
  max-width: 200px;
}

@media (max-width: 375px) {
  .container-title {
    max-width: 140px;
  }
}

.container-apuestas {
  gap: 12px;
  flex: none;
  flex-grow: 0;
}

.container-list {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  height: auto;
  width: 100%;
  max-width: 500px;
  border: 1px solid #F3F3F3;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  transition: all 0.3s ease;
}

.container-line {
  gap: 8px;
}

.container-edit-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  width: 28px;
  height: 28px;
  background: #E0E0F8;
  border-radius: 30px;
  flex: none;
  order: 0;
  flex-grow: 0;
  cursor: pointer;
}

.container-edit-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.offline-banner {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-number {
  padding: 8px 16px;
  gap: 16px;
  width: 55px;
  background: #F3F3F3;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
}

.apuesta-pendiente {
  background-color: #fff8e1;
  border: 2px dashed #ffc107;
}

.apuesta-editada {
  background-color: #e1f5fe;
  border: 2px dashed #03a9f4;
}

.apuestas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(117, 117, 117, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.custom-modal {
  background-color: transparent;
  padding: 10px;
  border-radius: 12px;
  width: 95%;
  max-width: 400px;
  text-align: center;
}

.custom-modal-aceptar {
  background-color: #bdbdbd;
  color: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
}

.button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
}

.btn {
  padding: 5px 15px;
  border: 1px solid #000000;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.btn.editar {
  background-color: #fffb18;
  border: #000 solid 3px;
  color: rgb(0, 0, 0);
}

.btn.eliminar {
  background-color: #e2e2e2;
  color: rgb(0, 0, 0);
}

.btn.eliminar-confirmar {
  background-color: #ff0000;
  color: rgb(255, 255, 255);
}

.btn:hover {
  opacity: 0.8;
  font-weight: bold;
}

.eliminando {
  transform: scale(0.95);
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
}

.badge {
  font-size: 0.7rem;
  padding: 0.25em 0.4em;
  border-radius: 0.25rem;
  font-weight: 500;
}
.numero-ganador {
  background-color: #6665DD !important; /* Verde para indicar ganador */
  color: white !important;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(106, 139, 249, 0.6);
  animation: pulse 1.5s infinite;
}
</style>