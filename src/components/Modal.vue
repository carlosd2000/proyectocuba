<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase/config.js'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { database } from '../firebase/config.js'
import { ref as dbRef, set } from 'firebase/database'
import { useToastStore } from '../stores/toast.js'
import { useAuthStore } from '../stores/authStore.js'
import ButtonSend from '../components/ButtonSend.vue'
import CheckIcon from '../assets/icons/Check.svg'
import toggleon from '@/assets/icons/Toggleon.svg';
import toggleoff from '@/assets/icons/Toggleoff.svg';

const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const selectedTurno = ref('Dia') // Por defecto al "Dia"

const toastStore = useToastStore()
const authStore = useAuthStore()

const toggleActivo1 = ref(false);
const toggleActivo2 = ref(false);
const toggleActivo3 = ref(false);

const valorHoraDia = ref('');
const valorHoraTarde = ref('');
const valorHoraNoche = ref('');

const mostrarToastSave = ref(false)
const mostrarToastError = ref(false)
const mostrarToastComplete = ref(false)

const montoLimitado = ref(''); 

const emit = defineEmits(['cerrar', 'guardarLimitados']);

const props = defineProps({
    modal: {
        type: Boolean,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: null
    },
    initialData: {
        type: Object,
        default: null
    }
})

const inputsNumeros = ref([{ id: 1, value: props.title === 'Parlet' ? { primero: '', segundo: '' } : '' }]);

const agregarInput = () => {
    inputsNumeros.value.push({ 
        id: Date.now(),
        value: props.title === 'Parlet' ? { primero: '', segundo: '' } : '' 
    });
};

const originalToggles = ref({
    dia: false,
    tarde: false,
    noche: false
});
const originalHoras = ref({
    dia: '',
    tarde: '',
    noche: ''
});

const cambiarToggle = (num) => {
    if (num === 1) {
        toggleActivo1.value = !toggleActivo1.value;
    } else if (num === 2) {
        toggleActivo2.value = !toggleActivo2.value;
    } else if (num === 3) {
        toggleActivo3.value = !toggleActivo3.value;
    }
};

const disabled = computed(() => {
    const soloNumeros = /^\d+$/
    return (
        input1.value.length !== 3 || !soloNumeros.test(input1.value) ||
        input2.value.length !== 2 || !soloNumeros.test(input2.value) ||
        input3.value.length !== 2 || !soloNumeros.test(input3.value)
    )
})

const hayCambios = computed(() => {
    return (
        toggleActivo1.value !== originalToggles.value.dia ||
        toggleActivo2.value !== originalToggles.value.tarde ||
        toggleActivo3.value !== originalToggles.value.noche ||
        (toggleActivo1.value && valorHoraDia.value !== originalHoras.value.dia) ||
        (toggleActivo2.value && valorHoraTarde.value !== originalHoras.value.tarde) ||
        (toggleActivo3.value && valorHoraNoche.value !== originalHoras.value.noche)
    );
});

const completo = computed(() => {
    if (['Limitado'].includes(props.type)) {
        const montoValido = String(montoLimitado.value).trim() !== '';
        
        if (props.title === 'Parlet') {
            const algunParValido = inputsNumeros.value.some(input => {
                return input.value.primero !== '' && input.value.segundo !== '';
            });
            return montoValido && algunParValido;
        } else {
            const algunNumeroValido = inputsNumeros.value.some(input => {
                return input.value !== '' && input.value !== null && input.value !== undefined;
            });
            return montoValido && algunNumeroValido;
        }
    } else {
        if (props.title === 'Parlet') {
            return inputsNumeros.value.some(input => {
                return input.value.primero !== '' && input.value.segundo !== '';
            });
        } else {
            return inputsNumeros.value.some(input => {
                return input.value !== '' && input.value !== null && input.value !== undefined;
            });
        }
    }
});

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
        CheckIcon,
        'top'
    )
    emit('cerrar')
    input1.value = ''
    input2.value = ''
    input3.value = ''
}

const guardar = async () => {
    try {
        const cacheRaw = localStorage.getItem('horaCierreCache') ?? '{}';
        let horaCierreCache = JSON.parse(cacheRaw);
        
        const horariosRaw = localStorage.getItem('horariosCache') ?? '{}';
        let horariosCache = JSON.parse(horariosRaw);
        
        const cambios = {};
        
        // Verificar cambios en toggles
        if (toggleActivo1.value !== originalToggles.value.dia) {
            // Actualizar horaCierreCache
            horaCierreCache.dia = horaCierreCache.dia || {};
            horaCierreCache.dia.activo = toggleActivo1.value;
            
            // Actualizar horariosCache
            horariosCache.dia = horariosCache.dia || {};
            horariosCache.dia.activo = toggleActivo1.value;
            
            cambios.dia = { activo: toggleActivo1.value };
            await actualizarActivoTurno('dia', toggleActivo1.value);
        }
        
        if (toggleActivo2.value !== originalToggles.value.tarde) {
            horaCierreCache.tarde = horaCierreCache.tarde || {};
            horaCierreCache.tarde.activo = toggleActivo2.value;
            
            horariosCache.tarde = horariosCache.tarde || {};
            horariosCache.tarde.activo = toggleActivo2.value;
            
            cambios.tarde = { activo: toggleActivo2.value };
            await actualizarActivoTurno('tarde', toggleActivo2.value);
        }
        
        if (toggleActivo3.value !== originalToggles.value.noche) {
            horaCierreCache.noche = horaCierreCache.noche || {};
            horaCierreCache.noche.activo = toggleActivo3.value;
            
            horariosCache.noche = horariosCache.noche || {};
            horariosCache.noche.activo = toggleActivo3.value;
            
            cambios.noche = { activo: toggleActivo3.value };
            await actualizarActivoTurno('noche', toggleActivo3.value);
        }
        
        // Verificar cambios en horas (solo si el toggle está activo)
        if (toggleActivo1.value && valorHoraDia.value !== originalHoras.value.dia) {
            horaCierreCache.dia = horaCierreCache.dia || {};
            horaCierreCache.dia.hora = valorHoraDia.value;
            
            horariosCache.dia = horariosCache.dia || {};
            horariosCache.dia.hora = valorHoraDia.value;
            
            cambios.dia = { ...(cambios.dia || {}), hora: valorHoraDia.value };
            await guardarHoraEnFirebase('dia', valorHoraDia.value);
        }
        
        if (toggleActivo2.value && valorHoraTarde.value !== originalHoras.value.tarde) {
            horaCierreCache.tarde = horaCierreCache.tarde || {};
            horaCierreCache.tarde.hora = valorHoraTarde.value;
            
            horariosCache.tarde = horariosCache.tarde || {};
            horariosCache.tarde.hora = valorHoraTarde.value;
            
            cambios.tarde = { ...(cambios.tarde || {}), hora: valorHoraTarde.value };
            await guardarHoraEnFirebase('tarde', valorHoraTarde.value);
        }
        
        if (toggleActivo3.value && valorHoraNoche.value !== originalHoras.value.noche) {
            horaCierreCache.noche = horaCierreCache.noche || {};
            horaCierreCache.noche.hora = valorHoraNoche.value;
            
            horariosCache.noche = horariosCache.noche || {};
            horariosCache.noche.hora = valorHoraNoche.value;
            
            cambios.noche = { ...(cambios.noche || {}), hora: valorHoraNoche.value };
            await guardarHoraEnFirebase('noche', valorHoraNoche.value);
        }
        
        // Guardar en ambos caches solo si hay cambios
        if (Object.keys(cambios).length > 0) {
            localStorage.setItem('horaCierreCache', JSON.stringify(horaCierreCache));
            localStorage.setItem('horariosCache', JSON.stringify(horariosCache));
            
            // Actualizar estados originales
            originalToggles.value = {
                dia: toggleActivo1.value,
                tarde: toggleActivo2.value,
                noche: toggleActivo3.value
            };
            
            originalHoras.value = {
                dia: valorHoraDia.value,
                tarde: valorHoraTarde.value,
                noche: valorHoraNoche.value
            };
            
            mostrarToastSave.value = true;
            lanzarToast();
        }
    } catch (err) {
        console.error('Error al guardar:', err);
        mostrarToastError.value = true;
        lanzarToast();
    }
};

const guardarLimitados = () => {
    if (['Limitado'].includes(props.type)) {
        // Prepara los datos para enviar al padre
        const datosLimitados = {
            monto: montoLimitado.value,
            numeros: props.title === 'Parlet' 
                ? inputsNumeros.value
                    .filter(input => input.value.primero !== '' && input.value.segundo !== '')
                    .map(input => [input.value.primero, input.value.segundo])
                : inputsNumeros.value
                    .map(input => input.value)
                    .filter(valor => valor !== '' && valor !== null && valor !== undefined)
        };
        
        // Emite los datos al padre
        emit('guardarLimitados', datosLimitados);
        
        // Cierra el modal
        emit('cerrar');
    }
    else{
        const datosLimitados = {
            numeros: props.title === 'Parlet' 
                ? inputsNumeros.value
                    .filter(input => input.value.primero !== '' && input.value.segundo !== '')
                    .map(input => [input.value.primero, input.value.segundo])
                : inputsNumeros.value
                    .map(input => input.value)
                    .filter(valor => valor !== '' && valor !== null && valor !== undefined)
        };
        
        // Emite los datos al padre
        emit('guardarLimitados', datosLimitados);
        // Cierra el modal
        emit('cerrar');
    }
}

const actualizarActivoTurno = async (turnoNombre, estado) => {
    try {
        if (!authStore.bancoId) return;

        const docRef = doc(db, `bancos/${authStore.bancoId}/hora`, turnoNombre);
        await setDoc(docRef, { 
            activo: estado 
        }, { merge: true });
        
        console.log(`✅ Estado ${turnoNombre} actualizado en Firebase:`, estado);
    } catch (error) {
        console.error(`Error actualizando estado activo del turno ${turnoNombre}:`, error);
        throw error;
    }
};

const guardarHoraEnFirebase = async (turnoNombre, hora) => {
    try {
        if (!hora) {
            mostrarToastComplete.value = true;
            lanzarToast();
            throw new Error('Hora no especificada');
        }
        
        if (!authStore.bancoId) return;

        // Convertir la hora a Timestamp de Firebase
        const [hh, mm] = hora.split(':');
        const ahora = new Date();
        ahora.setHours(parseInt(hh), parseInt(mm), 0, 0);
        const timestampHora = Timestamp.fromDate(ahora);

        const docRef = doc(db, `bancos/${authStore.bancoId}/hora`, turnoNombre);
        await setDoc(docRef, {
            hora: timestampHora,
            activo: true
        }, { merge: true });
        
        console.log(`✅ Hora ${turnoNombre} guardada en Firebase:`, hora);
    } catch (error) {
        console.error(`Error guardando hora del turno ${turnoNombre}:`, error);
        throw error;
    }
};

const lanzarToast = () => {
    // DESPUÉS DE 3 SEGUNDOS, OCULTA EL TOAST
    emit('cerrar')
    toastStore.showToast('Guardado correctamente', 'success', 3000, CheckIcon, 'top');
};

const typeHeight = computed(() => {
    return ['Limitado', 'NoJuega'].includes(props.type);
});

onMounted(() => {
    try {
        // Cargar de ambos caches
        const horaCierreRaw = localStorage.getItem('horaCierreCache') ?? localStorage.getItem('horasCierreCache');
        const horariosRaw = localStorage.getItem('horariosCache');
        
        let horaCierreCache = {};
        let horariosCache = {};
        
        if (horaCierreRaw) horaCierreCache = JSON.parse(horaCierreRaw);
        if (horariosRaw) horariosCache = JSON.parse(horariosRaw);
        
        // Combinar datos de ambos caches (priorizando horariosCache si existe)
        const cache = {
            dia: {
                ...(horaCierreCache.dia || {}),
                ...(horariosCache.dia || {})
            },
            tarde: {
                ...(horaCierreCache.tarde || {}),
                ...(horariosCache.tarde || {})
            },
            noche: {
                ...(horaCierreCache.noche || {}),
                ...(horariosCache.noche || {})
            }
        };
        
        // Inicializar estados actuales y originales
        toggleActivo1.value = !!(cache.dia && cache.dia.activo);
        toggleActivo2.value = !!(cache.tarde && cache.tarde.activo);
        toggleActivo3.value = !!(cache.noche && cache.noche.activo);
        
        valorHoraDia.value = cache.dia?.hora ?? '';
        valorHoraTarde.value = cache.tarde?.hora ?? '';
        valorHoraNoche.value = cache.noche?.hora ?? '';
        
        // Guardar estados originales para comparación
        originalToggles.value = {
            dia: toggleActivo1.value,
            tarde: toggleActivo2.value,
            noche: toggleActivo3.value
        };
        
        originalHoras.value = {
            dia: valorHoraDia.value,
            tarde: valorHoraTarde.value,
            noche: valorHoraNoche.value
        };
        
        console.log('Datos cargados:', {
            horaCierreCache,
            horariosCache,
            cacheCombinado: cache
        });
    } catch (err) {
        console.error('Error cargando caches:', err);
    }
    if (props.initialData) {
        console.log('Datos iniciales:', props.initialData);
        if (['Limitado'].includes(props.type)) {
            montoLimitado.value = props.initialData.monto || '';
        }
        // Precargar números
        if (props.title === 'Parlet') {
            inputsNumeros.value = (props.initialData.numeros || []).map(pair => ({
                id: Date.now() + Math.random(),
                value: { primero: pair[0], segundo: pair[1] }
            }))
            if (inputsNumeros.value.length === 0) {
                inputsNumeros.value = [{ id: 1, value: { primero: '', segundo: '' } }]
            }
        } else {
            inputsNumeros.value = (props.initialData.numeros || []).map(num => ({
                id: Date.now() + Math.random(),
                value: num
            }))
            if (inputsNumeros.value.length === 0) {
                inputsNumeros.value = [{ id: 1, value: '' }]
            }
        }
    }
});
</script>
<template>
    <div v-if="type" class="modal-overlay-tiro d-flex flex-column justify-content-end align-items-center gap-2" :class="typeHeight ? 'height-all' : 'height-footer'">
        <div v-if="type === 'tiro'" class="container-tiro d-flex flex-column justify-content-center align-items-center gap-4">
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
                <option value="Dia">Dia</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
            </select>
            <div class="d-flex flex-row justify-content-between align-items-center gap-1 w-100">
                <input type="text" v-model="input1" class="label input-tiro text-center" placeholder="000" style="max-width: 105px;" />
                <p class="m-0 p-0">-</p>
                <input type="text" v-model="input2" class="label input-tiro text-center" placeholder="00" style="max-width: 80px;" />
                <input type="text" v-model="input3" class="label input-tiro text-center" placeholder="00" style="max-width: 80px;" />
            </div>
            <div class="w-100">
                <button-send title="Enviar" :disabled="disabled" @click="enviarTiro"/>
            </div>
        </div>
        <div v-if="type === 'horario'" class="container-tiro d-flex flex-column justify-content-center align-items-center gap-3">
            <div class="d-flex flex-column justify-content-center align-items-start gap-2 w-100">
                <div class="d-flex justify-content-between w-100">
                    <h2>
                        Horario
                    </h2>
                    <img src="../assets/icons/Cerrar.svg" alt="" width="20" @click="emit('cerrar')">
                </div>
                <h5 class="small">
                    Configura el horario de las tiradas
                </h5>
            </div>
            <div class="d-flex flex-column justify-content-center align-items-center gap-3 w-100">
                <div class="d-flex justify-content-between align-items-center gap-2 w-100">
                    <img src="../assets/icons/Dia.svg" alt="" width="20">
                    <h5 class="label d-flex justify-content-start w-100">
                        Mañana
                    </h5>
                    <button class="p-0 btn bg-transparent" @click="cambiarToggle(1)">
                        <img :src="toggleActivo1 ? toggleon : toggleoff" alt="Toggle" width="48" />
                    </button>
                </div>
                <div v-if="toggleActivo1" class="container-timer">
                    <img src="../assets/icons/Hora.svg" alt="" width="20">
                    <input class="btn" type="time" v-model="valorHoraDia">
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 w-100">
                    <img src="../assets/icons/Tarde.svg" alt="" width="20">
                    <h5 class="label d-flex justify-content-start w-100">
                        Tarde
                    </h5>
                    <button class="p-0 btn bg-transparent" @click="cambiarToggle(2)">
                        <img :src="toggleActivo2 ? toggleon : toggleoff" alt="Toggle" width="48" />
                    </button>
                </div>
                <div v-if="toggleActivo2" class="container-timer">
                    <img src="../assets/icons/Hora.svg" alt="" width="20">
                    <input class="btn" type="time" v-model="valorHoraTarde">
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 w-100">
                    <img src="../assets/icons/Noche.svg" alt="" width="20">
                    <h5 class="label d-flex justify-content-start w-100">
                        Noche
                    </h5>
                    <button class="p-0 btn bg-transparent" @click="cambiarToggle(3)">
                        <img :src="toggleActivo3 ? toggleon : toggleoff" alt="Toggle" width="48" />
                    </button>
                </div>
                <div v-if="toggleActivo3" class="container-timer">
                    <img src="../assets/icons/Hora.svg" alt="" width="20">
                    <input class="btn" type="time" v-model="valorHoraNoche">
                </div>
            </div>
            <ButtonSend title="Guardar" :disabled="!hayCambios" @click="guardar()"/>
        </div>
        <div v-if="['Limitado', 'NoJuega'].includes(type)" class="container-tiro d-flex flex-column justify-content-center align-items-center gap-3">
            <div v-if="type === 'Limitado'" class="d-flex flex-column justify-content-center align-items-start gap-3 w-100">
                <div class="d-flex justify-content-between gap-2 w-100">
                    <img src="../assets/icons/Alerta_ol.svg" alt="" width="20">
                    <h2 class="d-flex justify-content-start w-100">
                        {{ props.title }} limitado
                    </h2>
                    <img src="../assets/icons/Cerrar.svg" alt="" width="20" @click="emit('cerrar')">
                </div>
                <h5 class="small">
                    Configura los valores y numeros limitados
                </h5>
                <div class="input d-flex flex-row align-items-center gap-1 w-100">
                    <h5 class="input-label">
                        $
                    </h5>
                    <input v-model="montoLimitado" class="border-0 bg-transparent" placeholder="0,00" type="text" style="max-width: 90%;">
                </div>
                <div class="d-flex flex-column align-items-start gap-2 w-100">
                    <h5 class="body-bold">
                        Agregar números
                    </h5>
                    <div class="d-flex flex-row align-items-center gap-1 w-100">
                        <div class="inputs-container">
                            <div v-for="input in inputsNumeros" :key="input.id">
                                <input 
                                    v-if="props.title !== 'Parlet'"
                                    v-model="input.value" 
                                    class="circle label bg-transparent" 
                                    placeholder="-" 
                                    type="number">
                                <div v-else class="circle2 d-flex flex-row justify-content-center align-items-center gap-1">
                                    <input 
                                        v-model="input.value.primero" 
                                        class="label parlet-inputs text-center bg-transparent border-0"
                                        placeholder="00" 
                                        type="number">
                                    <p class="m-0 p-0 subtitle">-</p>
                                    <input 
                                        v-model="input.value.segundo" 
                                        class="label parlet-inputs text-center bg-transparent border-0"
                                        placeholder="00" 
                                        type="number">
                                </div>
                            </div>
                            <button 
                                class="button-plus"
                                @click="agregarInput">
                                <img src="../assets/icons/Plus.svg" alt="" style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="type === 'NoJuega'" class="d-flex flex-column justify-content-center align-items-start gap-3 w-100">
                <div class="d-flex justify-content-between gap-2 w-100">
                    <img src="../assets/icons/Alerta_ol.svg" alt="" width="20">
                    <h2 class="d-flex justify-content-start w-100">
                        No juegan
                    </h2>
                    <img src="../assets/icons/Cerrar.svg" alt="" width="20" @click="emit('cerrar')">
                </div>
                <h5 class="small">
                    Selecciona uno o mas numeros que no jugaran en las proximas tiradas
                </h5>
                <div class="d-flex flex-column align-items-start gap-2 w-100">
                    <div class="d-flex flex-row align-items-center gap-1 w-100">
                        <div class="inputs-container">
                            <div v-for="input in inputsNumeros" :key="input.id">
                                <input 
                                    v-if="props.title !== 'Parlet'"
                                    v-model="input.value" 
                                    class="circle label bg-transparent" 
                                    placeholder="-" 
                                    type="number">
                                <div v-else class="circle2 d-flex flex-row justify-content-center align-items-center gap-1">
                                    <input 
                                        v-model="input.value.primero" 
                                        class="label parlet-inputs text-center bg-transparent border-0"
                                        placeholder="00" 
                                        type="number">
                                    <p class="m-0 p-0 subtitle">-</p>
                                    <input 
                                        v-model="input.value.segundo" 
                                        class="label parlet-inputs text-center bg-transparent border-0"
                                        placeholder="00" 
                                        type="number">
                                </div>
                            </div>
                            <button 
                                class="button-plus"
                                @click="agregarInput">
                                <img src="../assets/icons/Plus.svg" alt="" style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ButtonSend :title="type === 'Limitado' ? 'Aplicar limitados' : 'Aplicar numeros'" :disabled="!completo" @click="guardarLimitados()"/>
        </div>
    </div>
</template>
<style scoped>
.modal-overlay-tiro {
    position: fixed;
    width: 100%;
     /* Asume que el footer mide 64px */
    box-sizing: border-box;
    background: rgba(253, 254, 242, 0.4);
    /* Accent/Mindaro 10 */
    border: 0.5px solid #FDFEF2;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 15px 10px;
    flex: none;
    flex-grow: 0;
    z-index: 3;
}
.height-footer{
    height: calc(100% - 140px);
}
.height-all{
    height: calc(100% - 50px);
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
    height: 48px;
    width: 100%;
    padding: 8px 24px !important;
    gap: 12px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    letter-spacing: 6px !important;
    flex: none;
    flex-grow: 1;
}
.container-timer{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 12px 8px 16px;
    gap: 12px;
    width: 100%;
    height: 48px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
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
.circle{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    gap: 10px;
    width: 70px;
    height: 48px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
    text-align: center;
    font-size: 14px;
}
.circle2{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 12px 8px 16px;
    gap: 12px;
    width: 148px;
    height: 48px;
    border: 1px solid #CDCDD1;
    border-radius: 30px;
    flex: none;
    order: 0;
    flex-grow: 0;
}
.button-plus{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    gap: 10px;
    width: 48px;
    height: 48px;
    background: #C2C1F1;
    border: 1px solid #F3F3F3;
    border-radius: 30px;
    flex: none;
    grid-column: -1;
    flex-grow: 0;
}
.inputs-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
}
.parlet-inputs{
    max-width: 60px;
    color: #9B9BA2;
}
input::placeholder {
  color: #9B9BA2; /* O cualquier color */
  opacity: 1; /* Asegura que el color se vea */
}

</style>