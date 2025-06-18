<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '../components/Header.vue';
import Hora from '../components/hora.vue';
import { db } from '../firebase/config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Añadimos getDoc para leer datos

import mostrarhora from '../components/mostrarhora.vue';
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js'
import toggleon from '../assets/type=Toggle on.svg';
import toggleoff from '../assets/type=Toggle off.svg';

const turno = ref('Dia');
const horas = ref('');
const minutos = ref('');
const segundos = ref('');

// Valores de la base de datos para los placeholders
const dbHoras = ref('');
const dbMinutos = ref('');
const dbSegundos = ref('');

// CONTROLA SI EL TOAST ESTÁ VISIBLE
const mostrarToastSave = ref(false);
const mostrarToastError = ref(false);
const mostrarToastComplete = ref(false);

const toggleActivo1 = ref(false);
const toggleActivo2 = ref(false);
const toggleActivo3 = ref(false);

const cambiarToggle = async (num) => {
    let estadoNuevo;

    if (num === 1) {
        toggleActivo1.value = !toggleActivo1.value;
        estadoNuevo = toggleActivo1.value;
        await actualizarActivoTurno('dia', estadoNuevo);
    } else if (num === 2) {
        toggleActivo2.value = !toggleActivo2.value;
        estadoNuevo = toggleActivo2.value;
        await actualizarActivoTurno('tarde', estadoNuevo);
    } else if (num === 3) {
        toggleActivo3.value = !toggleActivo3.value;
        estadoNuevo = toggleActivo3.value;
        await actualizarActivoTurno('noche', estadoNuevo);
    }
};



// Nueva función para validar y formatear los inputs
const handleInput = (value, type) => {
    // Eliminar cualquier caracter que no sea número
    let numericValue = value.replace(/[^0-9]/g, '');
    
    // Limitar a 2 dígitos
    if (numericValue.length > 2) {
        numericValue = numericValue.slice(0, 2);
    }
    
    // Asignar el valor formateado
    if (type === 'hora') horas.value = numericValue;
    else if (type === 'minuto') minutos.value = numericValue;
    else if (type === 'segundo') segundos.value = numericValue;
};

// Agrega una variable reactiva para el banco padre
const bancoPadreId = ref(null)

// FUNCIÓN PARA CARGAR LOS DATOS DE FIRESTORE
const cargarDatos = async () => {
    try {
        const docDia = await getDoc(doc(db, `bancos/${bancoPadreId.value}/hora`, 'dia'));
        if (docDia.exists()) {
            toggleActivo1.value = !!docDia.data().activo;
        }
        const docTarde = await getDoc(doc(db, `bancos/${bancoPadreId.value}/hora`, 'tarde'));
        if (docTarde.exists()) {
            toggleActivo2.value = !!docTarde.data().activo;
        }
        const docNoche = await getDoc(doc(db, `bancos/${bancoPadreId.value}/hora`, 'noche'));
        if (docNoche.exists()) {
            toggleActivo3.value = !!docNoche.data().activo;
        }
        if (!bancoPadreId.value) {
            bancoPadreId.value = await obtenerBancoPadre()
        }
        if (!bancoPadreId.value) return

        const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turno.value.toLowerCase())
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
            const data = docSnap.data()
            dbHoras.value = data.hh !== undefined ? data.hh.toString() : ''
            dbMinutos.value = data.mm !== undefined ? data.mm.toString() : ''
            dbSegundos.value = data.ss !== undefined ? data.ss.toString() : ''
        } else {
            dbHoras.value = ''
            dbMinutos.value = ''
            dbSegundos.value = ''
        }
    } catch (error) {
        console.error('Error al cargar datos:', error)
    }
};

// Cargar datos cuando cambie el turno
onMounted(async () => {
    bancoPadreId.value = await obtenerBancoPadre()
    await cargarDatos()
})
watch(turno, cargarDatos)

// FUNCIÓN PARA MOSTRAR EL TOAST
const lanzarToast = () => {
    // DESPUÉS DE 3 SEGUNDOS, OCULTA EL TOAST
    setTimeout(() => {
        mostrarToastSave.value = false;
        mostrarToastError.value = false;
        mostrarToastComplete.value = false;
    }, 3000);
};

const guardarHora = async () => {
    try {
        if (!horas.value || !minutos.value || !segundos.value) {
            mostrarToastComplete.value = true
            lanzarToast()
            return
        }
        if (isNaN(horas.value) || isNaN(minutos.value) || isNaN(segundos.value)) {
            mostrarToastError.value = true
            lanzarToast()
            return
        }
        if (!bancoPadreId.value) {
            bancoPadreId.value = await obtenerBancoPadre()
        }
        if (!bancoPadreId.value) return

        const horaData = {
            hh: horas.value.padStart(2, '0'),
            mm: minutos.value.padStart(2, '0'),
            ss: segundos.value.padStart(2, '0'),
            timestamp: new Date().toISOString()
        }

        const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turno.value.toLowerCase())
        await setDoc(docRef, horaData, { merge: false })

        mostrarToastSave.value = true
        lanzarToast()
        dbHoras.value = horaData.hh
        dbMinutos.value = horaData.mm
        dbSegundos.value = horaData.ss
        horas.value = ''
        minutos.value = ''
        segundos.value = ''
    } catch (error) {
        console.error('Error al guardar la hora:', error)
        mostrarToastError.value = true
        lanzarToast()
    }
};
const actualizarActivoTurno = async (turnoNombre, estado) => {
    try {
        if (!bancoPadreId.value) {
            bancoPadreId.value = await obtenerBancoPadre();
        }
        if (!bancoPadreId.value) return;

        const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turnoNombre);
        await setDoc(docRef, { activo: estado }, { merge: true }); // merge: true para conservar hora anterior
    } catch (error) {
        console.error(`Error actualizando estado activo del turno ${turnoNombre}:`, error);
    }
};

</script>

<template>
    <div class="container-login position-relative h-100">
        <header>
            <Header/>
        </header>
        <div class="col-12 m-0 p-2">
            <div class="col-12 m-0 mt-2 p-3 d-flex flex-column align-items-center justify-content-center border-3 box-shadow">
                <header class="d-flex flex-column align-items-center justify-content-center">
                    <h3 class="text-center border-bottom border-3">Horario de cierre</h3>
                </header>
                <div class="col-12">
                    <div class="row d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            Tiro del dia
                        </h6>
                        <button class="btn bg-transparent p-1" @click="cambiarToggle(1)">
                            <img :src="toggleActivo1 ? toggleon : toggleoff" alt="Toggle" width="24" />
                        </button>
                    </div>
                    <div class="row d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            {{ dbHoranoche }}
                        </h6>
                        <button class="btn bg-transparent p-1" @click="activarHorario">
                            <img src="../assets/type=Timer.svg" alt="">
                        </button>
                    </div>
                </div>
                <div class="col-12">
                    <div class="row d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            Tiro de la tarde
                        </h6>
                        <button class="btn bg-transparent p-1" @click="cambiarToggle(2)">
                            <img :src="toggleActivo2 ? toggleon : toggleoff" alt="Toggle" width="24" />
                        </button>
                    </div>
                    <div class="row d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            {{ dbHoratarde }}
                        </h6>
                        <button class="btn bg-transparent p-1">
                            <img src="../assets/type=Timer.svg" alt="">
                        </button>
                    </div>
                </div>
                <div class="col-12">
                    <div class="row d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            Tiro de  la noche
                        </h6>
                        <button class="btn bg-transparent p-1" @click="cambiarToggle(3)">
                            <img :src="toggleActivo3 ? toggleon : toggleoff" alt="Toggle" width="24" />
                        </button>
                    </div>
                    <div class="row d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            {{ dbHoranoche }}
                        </h6>
                        <button class="btn bg-transparent p-1">
                            <img src="../assets/type=Timer.svg" alt="">
                        </button>
                    </div>
                </div>
                <main class="p-0 pb-1">
                    <div class="col-12 row m-0 p-3">
                        <Hora v-model="turno"/>
                    </div>
                    <div class="col-12 row m-0 p-0 d-flex justify-content-center align-items-center">
                        <div class="col-4">
                            <input v-model="horas" type="text" class="form-control" :placeholder="dbHoras || 'hh'" maxlength="2"/>
                        </div>
                        <div class="col-4">
                            <input v-model="minutos" type="text" class="form-control" :placeholder="dbMinutos || 'mm'" maxlength="2"/>
                        </div>
                        <div class="col-4">
                            <input v-model="segundos" type="text" class="form-control" :placeholder="dbSegundos || 'ss'" maxlength="2"/>
                        </div>
                    </div>
                    <div class="col-12 row m-0 p-0 d-flex justify-content-center align-items-center mt-3">
                        <button @click="guardarHora" class="p-1 btn-page">
                            <i class="bi bi-clock-history m-2 p-0"></i>
                            <span class="m-2">Guardar</span>
                        </button>
                    </div>
                </main>
                <mostrarhora/>
            </div>
        </div>
        <div v-if="mostrarToastSave" class="toast-container">
            <div class="toast show w-100 rounded-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="p-3 d-flex justify-content-center">
                    <i class="mx-2 bi bi-check-circle-fill text-success"></i>
                    ¡Hora guardada exitosamente!
                </div>
            </div>
        </div>
        <div v-if="mostrarToastError" class="toast-container">
            <div class="toast show w-100 rounded-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="p-3 d-flex justify-content-center">
                    <i class="mx-2 bi bi-exclamation-circle text-danger"></i>
                    ¡Error al guardar!
                </div>
            </div>
        </div>
        <div v-if="mostrarToastComplete" class="toast-container">
            <div class="toast show w-100 rounded-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="p-3 d-flex justify-content-center">
                    <i class="mx-2 bi bi-cursor-fill text-warning"></i>
                    ¡Complete los campos!
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed; /* Fijo en la pantalla */
    bottom: 0; /* Siempre en la parte inferior */
    left: 0;
    width: 100%; /* Ocupa todo el ancho */
    z-index: 1055; /* Encima de todo */
    border: 1px solid #000000c6;
    box-shadow: 1px -2px 1px #00000064;
    border-radius: 8px;
    background-color: rgb(235, 235, 235);
}

</style>