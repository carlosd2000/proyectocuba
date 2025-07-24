<template>
  <div class="container">
    <h2>Gestión de Fondos</h2>
    
    <div v-if="usuariosHijos.length > 0" class="selector-destinatario">
      <label>Seleccionar usuario:</label>
      <select v-model="destinatarioSeleccionado" class="select-usuario">
        <option 
          v-for="usuario in usuariosHijos" 
          :key="usuario.id" 
          :value="usuario"
        >
          {{ usuario.nombre }} ({{ usuario.tipo }})
        </option>
      </select>
    </div>
    <div v-else class="info-no-usuarios">
      <p>No hay usuarios disponibles para transacciones</p>
    </div>

    <div class="input-group">
      <label>Monto:</label>
      <input 
        v-model.number="valor" 
        type="number" 
        placeholder="Ingrese cantidad" 
        min="0" 
        class="input-monto"
        @keyup.enter="realizarOperacion"
      />
    </div>

    <!-- Botones para bancos, colectores principales y colectores -->
    <div class="button-group" v-if="esUsuarioConAmbosBotones">
      <button 
        @click="realizarOperacion('deposito')" 
        class="btn-deposito"
        :disabled="procesando || !destinatarioSeleccionado || valor <= 0"
      >
        <i class="fas fa-arrow-up"></i> 
        Depositar
      </button>
      
      <button 
        @click="realizarOperacion('retiro')" 
        class="btn-retiro"
        :disabled="procesando || !destinatarioSeleccionado || valor <= 0"
      >
        <i class="fas fa-arrow-down"></i> Retirar
      </button>
    </div>

    <!-- Solo para listeros -->
    <div class="button-group" v-else-if="userType === 'listeros' && tienePadre">
      <button 
        @click="realizarOperacion('deposito')" 
        class="btn-deposito"
        :disabled="procesando || valor <= 0"
      >
        <i class="fas fa-arrow-up"></i> 
        Enviar a Padre
      </button>
    </div>

    <div class="info-section">
      <div class="saldo-info">
        <span class="saldo-label">Fondo disponible:</span>
        <span class="saldo-valor" :class="{ 'saldo-negativo': fondoActual < 0 }">
          {{ formatoMoneda(fondoActual) }}
          <span v-if="fondoActual < 0"> (pendiente)</span>
        </span>
      </div>
    </div>

    <div v-if="mensaje" class="mensaje-alerta" :class="{'error': mensajeError}">
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFondo } from '@/scripts/useFondo'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const valor = ref(0)
const destinatarioSeleccionado = ref(null)
const mensaje = ref('')
const mensajeError = ref(false)
const procesando = ref(false)

const { 
  fondoBase, 
  fondoActual, 
  usuariosHijos, 
  cargarUsuariosHijos,
  realizarTransferencia
} = useFondo()

// Tipos de usuario que pueden ver ambos botones
const usuariosConAmbosBotones = ['bancos', 'colectorPrincipal', 'colectores']
const userType = computed(() => authStore.userType)
const esUsuarioConAmbosBotones = computed(() => usuariosConAmbosBotones.includes(userType.value))
const tienePadre = computed(() => authStore.profile?.creadorDirectoId && authStore.profile?.creadorDirectoTipo)

const formatoMoneda = (valor) => {
  const valorAbsoluto = Math.abs(valor)
  const simbolo = valor < 0 ? '-$' : '$'
  return `${simbolo}${valorAbsoluto.toLocaleString()}`
}

onMounted(async () => {
  await cargarUsuariosHijos()
  if (usuariosHijos.length > 0) {
    destinatarioSeleccionado.value = usuariosHijos[0]
  }
})

const mostrarMensaje = (texto, esError = false) => {
  mensaje.value = texto
  mensajeError.value = esError
  setTimeout(() => {
    mensaje.value = ''
    mensajeError.value = false
  }, 5000)
}

const realizarOperacion = async (tipo) => {
  if (procesando.value) return
  if (valor.value <= 0) {
    mostrarMensaje('Ingrese un monto válido', true)
    return
  }

  procesando.value = true
  mensaje.value = 'Procesando transacción...'
  mensajeError.value = false

  try {
    let destinatarioId, destinatarioTipo
    let operacionReal = tipo

    // Lógica para listeros enviando a padre
    if (userType.value === 'listeros' && tipo === 'deposito') {
      destinatarioId = authStore.profile?.creadorDirectoId
      destinatarioTipo = authStore.profile?.creadorDirectoTipo
    } 
    // Lógica para retiros (padre retirando de hijo)
    else if (tipo === 'retiro' && destinatarioSeleccionado.value) {
      destinatarioId = destinatarioSeleccionado.value.id
      destinatarioTipo = destinatarioSeleccionado.value.tipo
    } 
    // Lógica normal para depósitos
    else if (destinatarioSeleccionado.value) {
      destinatarioId = destinatarioSeleccionado.value.id
      destinatarioTipo = destinatarioSeleccionado.value.tipo
    }

    if (!destinatarioId || !destinatarioTipo) {
      throw new Error('No se ha seleccionado un destinatario válido')
    }

    const result = await realizarTransferencia({
      destinatarioId,
      tipo: operacionReal,
      monto: valor.value,
      destinatarioTipo
    })

    if (result.success) {
      mostrarMensaje(
        tipo === 'deposito' 
          ? `$${valor.value.toLocaleString()} enviados correctamente` 
          : `$${valor.value.toLocaleString()} retirados correctamente`
      )
      valor.value = 0
    } else {
      mostrarMensaje(result.error, true)
    }
  } catch (error) {
    console.error('Error en transacción:', error)
    mostrarMensaje(error.message, true)
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  color: #343a40;
  margin-bottom: 20px;
}

.selector-destinatario {
  margin-bottom: 20px;
}

.select-usuario {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ced4da;
  background-color: white;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-monto {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ced4da;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.button-group button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.button-group button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-deposito {
  background-color: #28a745;
  color: white;
}

.btn-deposito:hover:not(:disabled) {
  background-color: #218838;
}

.btn-retiro {
  background-color: #dc3545;
  color: white;
}

.btn-retiro:hover:not(:disabled) {
  background-color: #c82333;
}

.info-section {
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.saldo-info {
  display: flex;
  justify-content: space-between;
}

.saldo-label {
  font-weight: bold;
}

.saldo-valor {
  font-weight: bold;
  color: #007bff;
}

.saldo-negativo {
  color: #dc3545;
}

.mensaje-alerta {
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  text-align: center;
  animation: fadeIn 0.3s;
}

.mensaje-alerta.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info-no-usuarios {
  text-align: center;
  padding: 15px;
  background-color: #fff3cd;
  border-radius: 5px;
  margin-bottom: 20px;
  color: #856404;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>