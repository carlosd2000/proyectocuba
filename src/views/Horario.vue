<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '../components/Header.vue';
import Hora from '../components/hora.vue';
import { db } from '../firebase/config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Añadimos getDoc para leer datos

import mostrarhora from '../components/mostrarhora.vue';

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

// FUNCIÓN PARA CARGAR LOS DATOS DE FIRESTORE
const cargarDatos = async () => {
    try {
        const docRef = doc(db, 'hora', turno.value.toLowerCase());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            dbHoras.value = data.hh || '';
            dbMinutos.value = data.mm || '';
            dbSegundos.value = data.ss || '';
        } else {
            // Si no existe el documento, limpiamos los placeholders
            dbHoras.value = '';
            dbMinutos.value = '';
            dbSegundos.value = '';
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
};

// Cargar datos cuando cambie el turno
onMounted(cargarDatos); // Cargar al inicio
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

const guardarHora = async () => {
    try {
        // Validaciones básicas
        if (!horas.value || !minutos.value || !segundos.value) {
            mostrarToastComplete.value = true;
            lanzarToast();
        return;
        }

        // Crear el objeto con los datos
        const horaData = {
        hh: horas.value,
        mm: minutos.value,
        ss: segundos.value,
        timestamp: new Date().toISOString()
        };

        // Referencia al documento según el turno seleccionado
        const docRef = doc(db, 'hora', turno.value.toLowerCase()); // Convierte a minúsculas para coincidir con los nombres de documento
        
        // Guardar o sobrescribir los datos en Firestore
        await setDoc(docRef, horaData, { merge: false }); // merge: false para sobrescribir completamente

        console.log('Hora guardada correctamente para el turno:', turno.value);
        mostrarToastSave.value = true;
        lanzarToast();
        
        // Actualizar los placeholders con los nuevos valores
        dbHoras.value = horas.value;
        dbMinutos.value = minutos.value;
        dbSegundos.value = segundos.value;

        // Limpiar los campos
        horas.value = '';
        minutos.value = '';
        segundos.value = '';
        
    } catch (error) {
        console.error('Error al guardar la hora:', error);
        mostrarToastError.value = true;
        lanzarToast();
    }
};
</script>

<template>
    <div class="container-login position-relative">
        <div>
            <Header/>
        </div>
        <div class="col-12 m-0 p-2">
            <div class="col-12 m-0 mt-2 p-3 d-flex flex-column align-items-center justify-content-center border-3 box-shadow">
                <header class="d-flex flex-column align-items-center justify-content-center">
                    <h1 class="text-center">Horario</h1>
                    <div class="col-12">
                        <p class="text-center">Aquí puedes ingresar la cuenta regresiva para dar los resultados de las apuestas.</p>
                    </div>
                </header>
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