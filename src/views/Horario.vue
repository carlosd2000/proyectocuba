<script setup>
import { ref, onMounted, watch } from 'vue';
import { Timestamp } from 'firebase/firestore'
import Header from '../components/Header.vue';
import Hora from '../components/hora.vue';
import { db } from '../firebase/config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Añadimos getDoc para leer datos

import mostrarhora from '../components/mostrarhora.vue';
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js'
import { obtenerHorasTurnos } from '../scripts/obtenerHorasTurnos.js'
import toggleon from '@/assets/icons/Toggleon.svg';
import toggleoff from '@/assets/icons/Toggleoff.svg';

const turno = ref('Dia');

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

const bancoPadreId = ref('');

const dbHoradia = ref(null)
const dbHoratarde = ref(null)
const dbHoranoche = ref(null)

const horaInputDia = ref('')
const horaInputTarde = ref(null)
const horaInputNoche = ref(null)

const valorHoraDia = ref('');
const valorHoraTarde = ref('');
const valorHoraNoche = ref('');

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

// Modifica cargarDatos para usar la subcolección
const cargarDatos = async () => {
    try {
        if (!bancoPadreId.value) {
            bancoPadreId.value = await obtenerBancoPadre();
        }
        if (!bancoPadreId.value) return;

        const horarios = ['dia', 'tarde', 'noche'];

        for (const turno of horarios) {
            const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turno);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (turno === 'dia') toggleActivo1.value = !!data.activo;
                if (turno === 'tarde') toggleActivo2.value = !!data.activo;
                if (turno === 'noche') toggleActivo3.value = !!data.activo;
            }
        }

        // También cargar los datos de hora actuales
        const horaDoc = await getDoc(doc(db, `bancos/${bancoPadreId.value}/hora`, turno.value.toLowerCase()));
        if (horaDoc.exists()) {
            const data = horaDoc.data();
            dbHoras.value = data.hh ?? '';
            dbMinutos.value = data.mm ?? '';
            dbSegundos.value = data.ss ?? '';
        }

    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
};

const guardarHora = async (turnoNombre, horaSeleccionada) => {
  try {
    if (!horaSeleccionada) {
      mostrarToastComplete.value = true
      lanzarToast()
      return
    }

    // Obtener fecha de hoy y combinar con la hora ingresada
    const [hh, mm] = horaSeleccionada.split(':')
    const ahora = new Date()
    ahora.setHours(parseInt(hh), parseInt(mm), 0, 0)

    const timestampHora = Timestamp.fromDate(ahora)

    if (!bancoPadreId.value) {
      bancoPadreId.value = await obtenerBancoPadre()
    }
    if (!bancoPadreId.value) return

    const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turnoNombre)
    await setDoc(docRef, {
      hora: timestampHora,
      activo: true
    }, { merge: true })

    mostrarToastSave.value = true
    lanzarToast()
  } catch (err) {
    console.error('Error al guardar hora:', err)
    mostrarToastError.value = true
    lanzarToast()
  }
}

// Cargar datos cuando cambie el turno
onMounted(async () => {
    bancoPadreId.value = await obtenerBancoPadre()
    await cargarDatos()
    if (!bancoPadreId.value) return

    const horas = await obtenerHorasTurnos(bancoPadreId.value)
    dbHoradia.value = horas.dia
    dbHoratarde.value = horas.tarde
    dbHoranoche.value = horas.noche
})
watch(turno, cargarDatos); // Cargar cuando cambie el turno

// FUNCIÓN PARA MOSTRAR EL TOAST
const lanzarToast = () => {
    // DESPUÉS DE 3 SEGUNDOS, OCULTA EL TOAST
    setTimeout(() => {
        mostrarToastSave.value = false;
        mostrarToastError.value = false;
        mostrarToastComplete.value = false;
    }, 3000);
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
                <div class="col-12 d-flex flex-column">
                    <div class="d-flex flex-row justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            Tiro del dia
                        </h6>
                        <button class="btn bg-transparent p-1" @click="cambiarToggle(1)">
                            <img :src="toggleActivo1 ? toggleon : toggleoff" alt="Toggle" width="24" />
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            {{ dbHoradia }}
                        </h6>
                        <input type="time" v-model="valorHoraDia">
                        <button class="btn bg-transparent p-1" @click="guardarHora('dia', valorHoraDia)">
                            <img src="@/assets/icons/Timer.svg" alt="">
                        </button>
                    </div>
                </div>
                <div class="col-12 d-flex flex-column">
                    <div class="d-flex flex-row justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            Tiro de la tarde
                        </h6>
                        <button class="btn bg-transparent p-1" @click="cambiarToggle(2)">
                            <img :src="toggleActivo2 ? toggleon : toggleoff" alt="Toggle" width="24" />
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            {{ dbHoratarde }}
                        </h6>
                        <input type="time" v-model="valorHoraTarde">
                        <button class="btn bg-transparent p-1" @click="guardarHora('tarde', valorHoraTarde)">
                            <img src="@/assets/icons/Timer.svg" alt="">
                        </button>
                    </div>
                </div>
                <div class="col-12 d-flex flex-column">
                    <div class="d-flex flex-row justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            Tiro de  la noche
                        </h6>
                        <button class="btn bg-transparent p-1" @click="cambiarToggle(3)">
                            <img :src="toggleActivo3 ? toggleon : toggleoff" alt="Toggle" width="24" />
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="m-0 p-0">
                            {{ dbHoranoche }}
                        </h6>
                        <input type="time" v-model="valorHoraNoche">
                        <button class="btn bg-transparent p-1" @click="guardarHora('noche', valorHoraNoche)">
                            <img src="@/assets/icons/Timer.svg" alt="">
                        </button>
                    </div>
                </div>
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