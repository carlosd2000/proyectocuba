<script setup>
import { ref, computed } from 'vue'
import { database } from '../firebase/config.js'
import { ref as dbRef, set } from 'firebase/database'
import { useToastStore } from '../stores/toast'
import { useAuthStore } from '../stores/authStore'
import ButtonSend from '../components/ButtonSend.vue'
import CheckIcon from '../assets/icons/Check.svg'

const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const selectedTurno = ref('Dia') // Por defecto al "Dia"
const toastStore = useToastStore()
const authStore = useAuthStore()

const props = defineProps({
    modalTiro: {
        type: Boolean,
        default: ''
    }
})

const emit = defineEmits(['cerrar'])

const disabled = computed(() => {
    const soloNumeros = /^\d+$/
    return (
        input1.value.length !== 3 || !soloNumeros.test(input1.value) ||
        input2.value.length !== 2 || !soloNumeros.test(input2.value) ||
        input3.value.length !== 2 || !soloNumeros.test(input3.value)
    )
})

function enviarTiro() {
    console.log('Tiro enviado:', input1.value, input2.value, input3.value)
    const tiro = `${input1.value}-${input2.value}-${input3.value}`
    const turno = selectedTurno.value
    
    const ruta = dbRef(database, `tirosPorBanco/${authStore.bancoId}/${selectedTurno.value}`)
    const timestamp = new Date().toISOString()

    // 1. Guardar en Firebase
    set(ruta, {
        tiro,
        timestamp
    })
    // 2. Guardar en localStorage
    const hoy = timestamp.slice(0, 10) // "YYYY-MM-DD"
    const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}')

    if (!tirosLocales[hoy]) {
        tirosLocales[hoy] = {}
    }

    tirosLocales[hoy][turno] = {
        tiro,
        timestamp
    }

    localStorage.setItem('tirosLocales', JSON.stringify(tirosLocales))
    console.log(`📦 Tiro guardado localmente [${turno}]:`, tiro)

    toastStore.showToast(
        'Tiro enviado con exito',
        'success', 
        3000, 
        CheckIcon
    )
    emit('cerrar')
    input1.value = ''
    input2.value = ''
    input3.value = ''
}

</script>
<template>
    <div v-if="modalTiro" class="modal-overlay-tiro d-flex flex-column justify-content-end align-items-center gap-2">
        <div class="container-tiro d-flex flex-column justify-content-center align-items-center gap-4">
            <div class="d-flex flex-column justify-content-center align-items-center gap-2 w-100">
                <div class="d-flex justify-content-between align-items-center gap-3 w-100">
                    <img src="../assets/icons/Tarde.svg" alt="" width="20">
                    <div class="d-flex justify-content-start align-items-center w-100">
                        <h2>
                            Enviar tiro
                        </h2>
                    </div>
                    <img src="../assets/icons/Cerrar.svg" alt="" width="20" @click="emit('cerrar')">
                </div>
                <div class="d-flex justify-content-start align-items-center w-100">
                    <h3 class="small" style="color: #373745;">
                    Ingresa el numero ganador
                    </h3>
                </div>
            </div>
            <select v-model="selectedTurno" class="select-turno">
                <option value="1">Dia</option>
                <option value="2">Tarde</option>
                <option value="3">Noche</option>
            </select>
            <div class="d-flex flex-row justify-content-between align-items-center gap-1 w-100">
                <input type="text" v-model="input1" class="input-tiro text-center" style="max-width: 105px;" />
                <p class="m-0 p-0">-</p>
                <input type="text" v-model="input2" class="input-tiro text-center" style="max-width: 80px;" />
                <input type="text" v-model="input3" class="input-tiro text-center" style="max-width: 80px;" />
            </div>
            <div class="w-100">
                <button-send title="Enviar" :disabled="disabled" @click="enviarTiro"/>
            </div>
        </div>
    </div>
</template>
<style scoped>
.modal-overlay-tiro {
    position: fixed;
    width: 100%;
    height: calc(100% - 140px); /* Asume que el footer mide 64px */
    box-sizing: border-box;
    background: rgba(253, 254, 242, 0.4);
    /* Accent/Mindaro 10 */
    border: 0.5px solid #FDFEF2;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 10px;
    flex: none;
    flex-grow: 0;
    z-index: 3;
}
.container-tiro{
    padding: 24px 20px;
    gap: 24px;
    max-width: 343px;
    width: 100%;
    background: #F8FBFE;
    box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    flex: none;
    flex-grow: 0;
    z-index: 5;
}
.input-tiro {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: transparent;
    width: 100%;
    padding: 8px 24px;
    gap: 12px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    letter-spacing: 6px;
    flex: none;
    flex-grow: 1;
}
</style>