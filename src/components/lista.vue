<script setup>
// Datos reactivos (simulando props o estado)
import { ref } from 'vue';

const apuestas = ref([
    {
        id_apuesta: 102,
        nombre: "Juan",
        apuesta1: { numero:99, valor1: 2222, valor2: 331 },
        apuesta2: { numero:2, valor1: 33, valor2: 32 },
        apuesta3: { numero:2, valor1: 33, valor2: 32 , valor3: 44},
        apuesta4: { numero:2, valor1: 33, valor2: 32 },
        apuesta5: { numero:2, valor1: 33, valor2: 32 },
        apuesta6: { numero:2, valor1: 33, valor2: 32 },
        apuesta7: { numero:2, valor1: 33, valor2: 32 },
        apuesta8: { numero:2, valor1: 33, valor2: 32 },
    },
    {
        id_apuesta: 103,
        nombre: "Carlos",
        apuesta1: { numero:4, valor1: 15, valor2: 25},
        apuesta2: { numero:2, valor1: 30, valor2: 40},
        apuesta3: { numero:5, valor1: 10, valor2: 20, valor3: 35  },
        apuesta4: { numero:2, valor1: 33, valor2: 32 },
        apuesta5: { numero:2, valor1: 33, valor2: 32 },
    },
    {
        id_apuesta: 103,
        nombre: "Tinoco",
        apuesta1: { numero:4, valor1: 15, valor2: 25},
        apuesta2: { numero:2, valor1: 30, valor2: 40 },
        apuesta3: { numero:4, valor1: 15, valor2: 25, valor3: 35 },
        apuesta4: { numero:2, valor1: 33, valor2: 32 },
        apuesta5: { numero:2, valor1: 33, valor2: 32 },
    },
]);

// Función para filtrar las claves que son apuestas (apuesta1, apuesta2, etc.)
const getApuestasKeys = (persona) => {
    return Object.keys(persona).filter(key => key.startsWith('apuesta'));
};
</script>

<template>
    <div class="col-12 m-0 p-0">
        <!-- Iterar sobre cada persona -->
        <div v-for="persona in apuestas" :key="persona.id_apuesta" class="mb-3 persona border border-2 border-dark shadow-lg">
            <header class="col-12 row m-0 p-0">
                <div class="col-6 d-flex justify-content-start align-items-center">
                    <p>{{ persona.nombre }}</p>
                </div>
                <div class="col-6 d-flex justify-content-end align-items-center">
                    <i class="bi bi-unlock"></i>
                </div>
            </header>
            <!-- Contenedor de apuestas -->
            <main class="col-12 row m-0 p-0">
                <div class="col-9 apuestas d-flex flex-column justify-content-center align-items-start">
                    <div class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-start">
                        <!-- Iterar sobre las apuestas de la persona -->
                        <div v-for="key in getApuestasKeys(persona)" :key="key" class="m-0 p-0 d-flex justify-content-start align-items-center">
                            <!-- Iterar sobre los valores de la apuesta -->
                            <div v-for="(value, valKey) in persona[key]" :key="valKey" class="m-1 p-0">
                                <!-- Primer valor (numero) como CUADRADO -->
                                <p v-if="valKey === 'numero'" class="m-0 mr-3 p-0 d-flex justify-content-center align-items-center rounded container-number">
                                    {{ value }}
                                </p>
                                <!-- Resto de valores (valor1, valor2, etc.) como CÍRCULOS -->
                                <p v-else class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                                    {{ value }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                    <div class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
                        <div class="col-12 m-0 p-0 d-flex justify-content-around align-items-center">
                            <div class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                                <i class="bi bi-coin m-1"></i>
                            </div>
                            <div class="col-6 m-0 p-0 d-flex justify-content-start align-items-center">
                                <p class="m-1">9</p>
                            </div>
                        </div>
                        <div class="col-12 m-0 p-0 d-flex justify-content-around align-items-center">
                            <div class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                                <i class="bi bi-award-fill"></i>
                            </div>
                            <div class="col-6 m-0 p-0 d-flex justify-content-start align-items-center">
                                <p class="m-1">9999</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
p{
    margin: 0px;
    padding: 0px;
    font-size: 0.9rem; 
}
.container-number {
    width: 35px; 
    height: 35px;
    background-color: #f1f1f1;
}
.persona {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    flex: 1 1 300px;
    min-width: 250px;
}

.persona h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
}

.apuestas {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
}

.apuesta {
    background: #e9f7fe;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
}

.apuesta p {
    margin: 5px 0;
}
</style>