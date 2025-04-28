<script setup>
import { ref } from 'vue';
import Header from '../components/Header.vue';
import Hora from '../components/hora.vue';
import { db } from '../firebase/config.js';
import { doc, setDoc } from 'firebase/firestore';

import mostrarhora from '../components/mostrarhora.vue';

const turno = ref('Dia');
const horas = ref('');
const minutos = ref('');
const segundos = ref('');

const guardarHora = async () => {
    try {
        // Validaciones básicas
        if (!horas.value || !minutos.value || !segundos.value) {
        alert('Por favor complete todos los campos');
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
        alert('Hora guardada exitosamente!');
        
        // Limpiar los campos
        horas.value = '';
        minutos.value = '';
        segundos.value = '';
        
    } catch (error) {
        console.error('Error al guardar la hora:', error);
        alert('Ocurrió un error al guardar la hora');
    }
};
</script>

<template>
    <div>
        <div>
            <Header/>
        </div>
        <div class="col-12 m-0 p-2 container-login">
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
                        <input v-model="horas" type="text" class="form-control" placeholder="hh" maxlength="2"/>
                        </div>
                        <div class="col-4">
                        <input v-model="minutos" type="text" class="form-control" placeholder="mm" maxlength="2"/>
                        </div>
                        <div class="col-4">
                        <input v-model="segundos" type="text" class="form-control" placeholder="ss" maxlength="2"/>
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
    </div>
</template>
<style scoped>
</style>