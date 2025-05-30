<script setup>
import { ref } from 'vue'

const toggleSeleccion = ref(true) // true o false según el estado inicial
const fondoSeleccionado = ref(null)
const deudaSeleccionado = ref(null)
const activarModal = ref(false)

const opcionesFondos = ref([
    { value: 'opcion1', text: 'Recogida de fondo' },
    { value: 'opcion2', text: 'Cobro de ganancia' },
    { value: 'opcion3', text: 'Deposito de fondo' },
    { value: 'opcion4', text: 'Retiro de la app' },
])
const opcionesDeuda = ref([
    { value: 'opcion1', text: 'Añadir deuda' },
    { value: 'opcion2', text: 'Pagar deuda' },
])

function cambiarSeleccion(nuevoValor) {
    if (toggleSeleccion.value !== nuevoValor) {
        toggleSeleccion.value = nuevoValor
    }
}

function mostrarModal() {
    activarModal.value = true
}
function cerrarModal() {
    activarModal.value = false
}
</script>
<template>
    <div class="container py-5 px-3">
        <div class="d-flex flex-column justify-content-center align-items-center">   
            <header class="col-12">
                <h1 class="border-bottom mb-3">
                    Transfiere
                </h1>
            </header>
            <main class="col-12">
                <div class="col-12 my-1 p-2 bg-inputs">
                    <div class="border-button-me d-flex justify-content-between align-items-center">
                        <input type="text" placeholder="Buscar colaborador" class="border-0 bg-transparent" style="width: 100%;" />
                        <i class="bi bi-person-add"></i>
                    </div>
                </div>
                <div class="col-12 my-2 p-1 d-flex flex-column">
                    <div class="col-12 m-0 my-2 p-0 row d-flex justify-content-between align-items-center border-bottom border-2">
                        <h5>
                            Fondos
                        </h5>
                        <i :class="toggleSeleccion ? 'bi bi-toggle-on' : 'bi bi-toggle-off'" style="cursor:pointer" @click="cambiarSeleccion(true)"></i>
                    </div>
                    <div v-if="toggleSeleccion" class="col-12 m-0 my-1 p-0 px-2">
                        <div v-for="opcion in opcionesFondos" :key="opcion.value" class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                :id="'fondo-' + opcion.value"
                                name="fondos"
                                v-model="fondoSeleccionado"
                                :value="opcion.value"
                            />
                            <label class="form-check-label" :for="'fondo-' + opcion.value">
                                {{ opcion.text }}
                            </label>
                        </div>
                    </div>
                    <div class="col-12 m-0 my-2 p-0 row d-flex justify-content-between align-items-center border-bottom border-2">
                        <h5>
                            Deuda
                        </h5>
                        <i :class="!toggleSeleccion ? 'bi bi-toggle-on' : 'bi bi-toggle-off'" style="cursor:pointer" @click="cambiarSeleccion(false)"></i>
                    </div>
                    <div v-if="!toggleSeleccion" class="col-12 m-0 my-1 p-0 px-2">
                        <div v-for="opcion in opcionesDeuda" :key="opcion.value" class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                :id="'fondo-' + opcion.value"
                                name="fondos"
                                v-model="deudaSeleccionado"
                                :value="opcion.value"
                            />
                            <label class="form-check-label" :for="'fondo-' + opcion.value">
                                {{ opcion.text }}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="col-12 my-2 p-2 bg-inputs">
                    <div class="border-button-me d-flex justify-content-between align-items-center">
                        <input type="text" placeholder="Monto de la transferencia" class="border-0 bg-transparent" style="width: 100%;" />
                        <i class="bi bi-currency-dollar"></i>
                    </div>
                </div>
            </main>
            <footer class="col-12 py-2 d-flex justify-content-end align-items-center">
                <div class="d-flex justify-content-between align-items-center" style="width: 100%;">
                    <div></div>
                    <div></div>
                    <button @click="$router.push(`/monitoreolisteros/${$route.params.id}`)" class="m-0 p-0 bg-transparent border-0">
                        <p class="border-button-me">Cancelar</p>
                    </button>
                    <button class="btn-page p-2 px-3" @click="mostrarModal()">
                        Enviar
                    </button>
                </div>
            </footer>
        </div>
        <!-- Modal personalizado -->
        <div v-if="activarModal" class="custom-modal-backdrop" @click="cerrarModal">
            <div class="custom-modal" @click.stop>
                <div class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
                    <div class="col-12 m-0 p-0 border-button-me d-flex justify-content-start align-items-center">
                        <h3>
                            Enviar tiro
                        </h3>
                    </div>
                    <div class="col-12 m-0 my-3 p-0">
                        <div class="col-12 m-0 p-0 row">
                            <div class="col-4 m-0 p-0">
                                <input class="bg-inputs border" type="text" style="width: 100%; height: 100%;">
                            </div>
                            <div class="col-2 m-0 p-0 d-flex justify-content-center align-items-center">
                                <i class="bi bi-dash ngt"></i>
                            </div>
                            <div class="col-6 m-0 p-0 row d-flex justify-content-between align-items-center">
                                <input class="bg-inputs border" type="text" style="width: 45%; height: 100%;">
                                <input class="bg-inputs border" type="text" style="width: 45%; height: 100%;">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 m-0 p-0 d-flex justify-content-between align-items-center">
                        <div class="m-0 p-0"></div>
                        <div class="m-0 p-0"></div>
                        <button @click="cerrarModal()" class="m-0 p-0 bg-transparent border-0">
                            <p class="border-button-me">Cancelar</p>
                        </button>
                        <button class="btn-page m-0 p-2 px-3" @click="mostrarModal()">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    h1 {
        margin: 0;
        padding: 0;
    }
    h5{
        margin: 0;
        padding: 0;
        font-weight: bold;
    }
    i{
        margin: 0;
        padding: 0;
        font-size: 1.3rem;
        cursor: pointer;
    }
    p{
        margin: 0;
        padding: 0;
    }
    input{
        margin: 0;
        padding: 0;
    }
    i.bi-dash {
        font-size: 1.9rem;
        color: #000;
    }
    .tamaño {
        width: 100%;
        height: 100%;
    }
    .btn-page{
        border: 3px solid #000000;
    }
    .bg-inputs {
        background-color: #f3f3f3;
        border-radius: 5px;
    }
    .border-button-me {
        border-bottom: 2px solid #bdbdbd;
    }
    .custom-modal-backdrop{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .custom-modal{
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        height: 210px;
        width: 80%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
</style>