<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 

// Opciones disponibles
const opciones = ['Día', 'Tarde', 'Noche']
const turnoSeleccionado = ref('Día')
const desplegado1 = ref(true)

// Obtenemos route y router
const route = useRoute()
const router = useRouter()

onMounted(() => {
    const savedDesplegado1 = localStorage.getItem('desplegado1');
    if (savedDesplegado1 !== null) {
        desplegado1.value = JSON.parse(savedDesplegado1);
    }
});

watch(desplegado1, (newValue) => {
    localStorage.setItem('desplegado1', JSON.stringify(newValue));
});

</script>

<template>
    <div class="col-12 mt-2 mb-3 p-0">
        <div class="col-12 p-0 mt-2 mb-2 d-flex flex-nowrap justify-content-between align-items-center border-bottom border-1 border-dark">
            <p class="title pt-1 pb-1 pe-2 text-truncate">Jugada diaria</p>
            <button class="btn btn-light m-0 p-0 flex-shrink-0 bg-transparent" @click="desplegado1 = !desplegado1">
                <i class="bi" :class="desplegado1 ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
        </div>
        <div v-if="desplegado1" class="col-12">
            <div class="col-12 p-0 mt-2 d-flex flex-nowrap align-items-center justify-content-between">
                <div class="col-5 m-0 p-0 d-flex flex-nowrap align-items-center">
                    <select v-model="turnoSeleccionado" class="form-select form-select-sm text-small border-0 p-0 bg-transparent text-dark fw-semibold" style="width: auto;">
                        <option v-for="opcion in opciones" :key="opcion" :value="opcion">{{ opcion }}</option>
                    </select>
                </div>
                <div class="col-7 m-0 p-0 d-flex justify-content-end">
                    <p class="pe-2 text-truncate">$20,000,000.00</p>
                </div>
            </div>
            <div class="col-12 row p-0 m-0 d-flex justify-content-around align-items-center">
                <div class="col-3 p-1 buttons-heith">
                    <button class="w-100 p-0 px-0 pb-1 btn border-0 d-flex flex-column align-items-center justify-content-center" @click="$router.push(`/anadirjugada/${$route.params.id}`)">
                        <i class="bi bi-plus-lg m-0 p-0"></i>
                        <span class="text-center">Añadir<br>Jugada</span>
                    </button>
                </div>
                <div class="col-3 p-1 buttons-heith">
                    <button class="w-100 p-0 px-0 pb-1 btn border-0 d-flex flex-column align-items-center justify-content-center" @click="$router.push(`/parlet/${$route.params.id}`)">
                        <i class="bi bi-plus-lg"></i>
                        <span class="text-center">Añadir<br>Parlet</span>
                    </button>
                </div>
                <div class="col-3 p-1 buttons-heith">
                    <button class="w-100 p-0 px-0 pb-1 btn border-0 d-flex flex-column align-items-center justify-content-center" @click="$router.push(`/candado/${$route.params.id}`)">
                        <i class="bi bi-plus-lg"></i>
                        <span class="text-center">Añadir<br>Candado</span>
                    </button>
                </div>
                <div class="col-3 p-1 buttons-heith">
                    <button class="w-100 p-0 px-0 pb-1 btn border-0 d-flex flex-column align-items-center justify-content-center" @click="$router.push(`/centena/${$route.params.id}`)">
                        <i class="bi bi-plus-lg"></i>
                        <span class="text-center">Añadir<br>Centena</span>
                    </button>
                </div>
            </div>
            <div class="col-12 p-0 m-0 mt-0 mb-2 d-flex justify-content-center">
                <button class="col-12 row p-1 btn-list" @click="$router.push(`/listas/${$route.params.id}`)">
                    <p class="m-1">Lista</p>
                    <i class="bi bi-card-list m-1"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.title {
    font-weight: 700;
    color: #000000;
}
.buttons-heith {
    margin: 0px;
    padding: 0px;
    height: 100%;
    width: 100px;
    transform: scale(0.9);
}
.btn-list{
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
    background-color: #ffc107; /* Color original */
    color: #000000; /* Texto negro */
}
.btn-list:hover{
    background-color: rgb(226, 226, 226);
}
.btn:hover{
    background-color: rgb(226, 226, 226);
}
.btn-list:active {
    background-color: #ffffff; /* Fondo blanco */
    color: #000000; /* Texto negro */
}
p{
    padding: 0px;
    margin: 1px;
}
span {
    font-size: 0.7rem;
}
i{
    font-size: 1.5rem;
}
button {
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>