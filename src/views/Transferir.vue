<script setup>
import { ref, computed } from 'vue';
import { useFondoCreador } from '../scripts/useFondoCreador'
import { useFondo } from '../scripts/useFondo';
import Header from '../components/Header.vue';
import CardPrice from '../components/CardPrice.vue';
import SelectorId from '../components/SelectorId.vue';
import FilterOpcionsButtons from '../components/FilterOpcionsButtons.vue';
import ButtonDouble from '../components/ButtonDouble.vue';

const { agregarCambioFondo, cambiosLocales, fondosLocales } = useFondoCreador()
const { agregarCambioLocal } = useFondo();

const usuarioSeleccionado = ref('')
const seleccion = ref("Depositar")
const inputValor = ref(0)
const transferenciaSend = ref(false)

const textoPrimario = computed(() => 
  transferenciaSend.value ? 'Ir a fondo' : 'Cancelar'
)

const textoSecundario = computed(() => 
  transferenciaSend.value ? 'Nueva transferencia' : 'Crear transacción'
)

const fondoActual = computed(() => {
    if (!usuarioSeleccionado.value) return 0

    const uid = usuarioSeleccionado.value.uid
    const fondoBase = fondosLocales.value?.[uid] ?? usuarioSeleccionado.value.fondo ?? 0
    const cambios = cambiosLocales.value?.[uid] ?? []

    const sumaCambios = cambios.reduce((total, cambio) => total + cambio.valor, 0)

    return fondoBase + sumaCambios
})


function handleSeleccion(valor) {
    seleccion.value = valor
}
function newTransferencia() {
    transferenciaSend.value = false
    usuarioSeleccionado.value = ''
    inputValor.value = 0
    seleccion.value = 'Depositar'
}
async function crearTransaccion() {
    if (transferenciaSend.value === false) {
        const usuario = usuarioSeleccionado.value

        if (!usuario) return

        const tipoUsuario = usuario.tipo
        const uid = usuario.uid
        const valor = Math.abs(inputValor.value)
        if (seleccion.value === 'Depositar') {
            await agregarCambioFondo(uid, 'creador-agrega', tipoUsuario, valor)
            await agregarCambioLocal('deposito-creador', -valor)
        } else if (seleccion.value === 'Recolectar') {
            await agregarCambioFondo(uid, 'creador-quita', tipoUsuario, -valor)
            await agregarCambioLocal('recolecta-creador', valor)
        }

        transferenciaSend.value = true
    }
    else {
        newTransferencia()
    }
}
</script>
<template>
    <div class="container-login d-flex flex-column align-items-center">
        <header>
            <Header/>
        </header>
        <main v-if="!transferenciaSend" class="container-main d-flex flex-column align-items-center gap-3">
            <CardPrice/>
            <div class="d-flex flex-row justify-content-start align-items-center w-100">
                <h1>
                    Transferir
                </h1>
            </div>
            <SelectorId text="Seleciona el ID del listero e ingresa el valor que vas a depositar" type="ID" @update:id="usuarioSeleccionado = $event"/>
            <div class="line"></div>
            <div class="d-flex flex-column justify-content-center align-items-center gap-2 w-100">
                <div class="d-flex flex-column justify-content-center align-items-start gap-1 w-100">
                    <div class="d-flex flex-row justify-content-start align-items-center gap-2 w-100">
                        <img src="../assets/icons/Ganancia.svg" alt="">
                        <h5 class="small">
                            Fondo Recaudado
                        </h5>
                    </div>
                    <h1>
                        ${{ fondoActual.toLocaleString() }}
                    </h1>
                    <div class="d-flex flex-row justify-content-start align-items-center gap-2 w-100">
                        <h5 class="small" style="color: #696974;">
                            Ganancia
                        </h5>
                        <h5 class="body-bold" style="color: #696974;">
                            $16500
                        </h5>
                    </div>
                </div>
                <div class="d-flex flex-row justify-content-between align-items-center gap-2 w-100">
                    <FilterOpcionsButtons :titles="['Depositar!!Deposito', 'Recolectar!!Retiro', 'Ganancia']" :img="true" width="24" @update:seleccion="handleSeleccion"/>
                </div>
                <div class="container-selector d-flex flex-row justify-content-between align-items-center">
                    <img src="../assets/icons/Ganancia.svg" alt="">
                    <div style="flex: 1;">
                        <input v-model.number="inputValor" type="number" placeholder="$0.000.00" class="border-0 w-100">
                    </div>
                </div>
            </div>
        </main>
        <main v-else class="container-main d-flex flex-column align-items-start gap-4" style="max-width: 400px;">
            <img src="../assets/img/Ilustracion.svg" alt="">
            <h1>
                Transferencia lista!
            </h1>
            <h5 class="body">
                tu resumen de transferencia
            </h5>
            <div class="d-flex flex-row justify-content-start align-items-center gap-2 w-100">
                <img src="../assets/icons/User.svg" alt="" width="24">
                <h5 class="body">
                    {{ usuarioSeleccionado?.tipo || 'No seleccionado' }} ID
                </h5>
                <h5 class="body-bold">
                    #{{ usuarioSeleccionado?.uid || 'No seleccionado' }}
                </h5>
            </div>
            <div class="d-flex flex-row justify-content-start align-items-center gap-2 w-100">
                <img src="../assets/icons/Deposito.svg" alt="" width="24">
                <h5 class="body">
                    Valor 
                </h5>
                <h5 class="body-bold">
                    ${{ inputValor }}
                </h5>
            </div>
        </main>
        <footer>
            <ButtonDouble :fistbutton="textoPrimario" :secondbutton="textoSecundario" :isEnabled="!!usuarioSeleccionado  && inputValor > 0 && !!seleccion" @accionSegundoBoton="crearTransaccion"/>
        </footer>
    </div>
</template>
<style scoped>
.container-main {
    padding: 0px 16px 24px 16px;
    width: 100%;
    max-width: 400px;
    height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
    overflow-y: auto;
}
.line{
    width: 100%;
    height: 2px;
    border: 1px solid #CDCDD1;
    flex: none;
    flex-grow: 0;
}
.container-selector {
    box-sizing: border-box;
    padding: 8px 12px 8px 16px;
    gap: 10px;
    width: 100%;
    height: 48px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    cursor: pointer;
    background-color: transparent;
}
</style>