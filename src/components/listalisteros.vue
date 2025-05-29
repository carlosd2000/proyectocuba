<script setup>
import { ref } from 'vue'

// Datos simulados
const listeros = ref([
  { id: 1, nombre: 'Listero A', fondoCobrado: 5000, fondoPorCobrar: 5000 },
  { id: 2, nombre: 'Listero B', fondoCobrado: 7000, fondoPorCobrar: 8000 },
  { id: 3, nombre: 'Listero C', fondoCobrado: -10000, fondoPorCobrar: -10000 },
  { id: 4, nombre: 'Listero D', fondoCobrado: 2000, fondoPorCobrar: 3000 },
  { id: 5, nombre: 'Listero E', fondoCobrado: -1500, fondoPorCobrar: -1500 },
  { id: 6, nombre: 'Listero F', fondoCobrado: 6000, fondoPorCobrar: 6000 },
  { id: 7, nombre: 'Listero G', fondoCobrado: 20000, fondoPorCobrar: 20000 },
  { id: 8, nombre: 'Listero H', fondoCobrado: 0, fondoPorCobrar: 0 },
  { id: 9, nombre: 'Listero I', fondoCobrado: -2000, fondoPorCobrar: -2000 },
  { id: 10, nombre: 'Listero J', fondoCobrado: 10000, fondoPorCobrar: 10000 },
  { id: 11, nombre: 'Listero K', fondoCobrado: 20000, fondoPorCobrar: 20000 },
  { id: 12, nombre: 'Listero L', fondoCobrado: -3000, fondoPorCobrar: -3000 },
  { id: 13, nombre: 'Listero M', fondoCobrado: 4000, fondoPorCobrar: 4000 },
  { id: 14, nombre: 'Listero N', fondoCobrado: 5000, fondoPorCobrar: 5000 },
  { id: 15, nombre: 'Listero O', fondoCobrado: 6000, fondoPorCobrar: 6000 },
  { id: 16, nombre: 'Listero P', fondoCobrado: 7000, fondoPorCobrar: 7000 },
  { id: 17, nombre: 'Listero Q', fondoCobrado: 8000, fondoPorCobrar: 8000 },
  { id: 18, nombre: 'Listero R', fondoCobrado: 9000, fondoPorCobrar: 9000 },
  { id: 19, nombre: 'Listero S', fondoCobrado: 10000, fondoPorCobrar: 10000 },
  { id: 20, nombre: 'Listero T', fondoCobrado: 11000, fondoPorCobrar: 11000 }
])

// Estado reactivo para detalles abiertos por id
const detallesAbiertos = ref([])

function toggleDetails(id) {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter(openId => openId !== id)
  } 
  else {
    detallesAbiertos.value.push(id)
  }
}
</script>

<template>
  <div class="contenedor">
    <ul>
      <li v-for="listero in listeros" :key="listero.id"  @click="toggleDetails(listero.id)" class="listero my-1 px-2 py-1 d-flex justify-content-between align-items-center">
        <div class="col-12 m-0 p-0 d-flex flex-column">
          <div class="col-12 m-0 p-0 container row">
            <div class="col-6 container row m-0 px-1">
              <i class="bi bi-person mx-2"></i>
              <h5 class="ngt">{{ listero.nombre }}</h5>
            </div>
            <div class="col-6 container row m-0 p-0 justify-content-end align-items-center">
              <h5 class="ngt" :class="(listero.fondoCobrado + listero.fondoPorCobrar) >= 0 ? 'text-success' : 'text-danger'">
                ${{ (listero.fondoCobrado + listero.fondoPorCobrar).toLocaleString() }}
              </h5>
              <i class="detalles mx-2" :class="detallesAbiertos.includes(listero.id) ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
            </div>
          </div>
          <div v-if="detallesAbiertos.includes(listero.id)" class="container">
            <div class="detalles-container px-3">
              <div class="container row m-0 my-1 p-0 justify-content-between align-items-center">
                <p>Fondo cobrado</p>
                <p :class="listero.fondoCobrado >= 0 ? 'text-success2' : 'text-danger2'">
                  ${{ listero.fondoCobrado }}
                </p>
              </div>
              <div class="container row m-0 my-1 p-0 justify-content-between align-items-center">
                <p>Fondo por cobrar</p>
                <p :class="listero.fondoPorCobrar >= 0 ? 'text-success2' : 'text-danger2'">
                  ${{ listero.fondoPorCobrar }}
                </p>
              </div>
            </div>
            <div class="my-2">
              <h5 class="ngt detalles-h5">Detalles</h5>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.contenedor {
  max-width: 600px;
  margin: auto;
  font-family: Arial, sans-serif;
}
.contenedor h5 {
  margin: 0;
  font-size: 0.7rem;
}
h5{
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

p{
  margin: 0;
  padding: 0;
  font-size: 0.7rem;
  color: #6e6e6e;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

i{
  margin: 0px;
  font-size: 1.3rem;
  text-shadow: 0 0 1.0px #000;
}
i.bi-chevron-up, i.bi-chevron-down {
  font-size: 0.9rem;
  text-shadow: 0 0 1.0px #000;
}

.listero {
  background-color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  position: relative;
}

.detalles-container {
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
}

h5.detalles-h5{
  font-size: 0.7rem;
}

.text-success2 {
  color: #28a746c9;
}
.text-danger2 {
  color: #dc3546ba;
}
</style>
