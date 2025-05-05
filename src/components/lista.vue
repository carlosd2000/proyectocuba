<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const apuestas = ref([
  {
    id_apuesta: 102,
    nombre: "Juan",
    candadoAbierto: true,
    apuesta1: { numero: 99, valor1: 2222, valor2: 331 },
    apuesta2: { numero: 2, valor1: 33, valor2: 32 },
    apuesta3: { numero: 2, valor1: 33, valor2: 32, valor3: 44 },
  },
  {
    id_apuesta: 103,
    nombre: "Carlos",
    candadoAbierto: true,
    apuesta1: { numero: 4, valor1: 15, valor2: 25 },
    apuesta2: { numero: 2, valor1: 30, valor2: 40 },
  },
])

const getApuestasKeys = (persona) => {
  return Object.keys(persona).filter((key) => key.startsWith('apuesta'))
}

// Cambiar estado del candado con confirmación si se va a cerrar
const toggleCandado = async (persona) => {
  if (persona.candadoAbierto) {
    const result = await Swal.fire({
      title: '¿Deseas cerrar la apuesta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
  }
  persona.candadoAbierto = !persona.candadoAbierto
}

// Mostrar SweetAlert al hacer clic en el cuadro (menos el candado)
const cuadroClick = (persona) => {
  if (!persona.candadoAbierto) return
  Swal.fire({
    title: '¿Qué deseas hacer?',
    icon: 'question',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Editar',
    denyButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('Editar a:', persona.nombre)
    } else if (result.isDenied) {
      console.log('Eliminar a:', persona.nombre)
    }
  })
}
</script>

<template>
  <div class="col-12 m-0 p-0">
    <div
      v-for="persona in apuestas"
      :key="persona.id_apuesta"
      class="m-0 mb-3 py-4 persona"
      @click="cuadroClick(persona)"
      style="cursor: pointer;"
    >
      <header class="col-12 row m-0 p-0">
        <div class="col-6 d-flex justify-content-start align-items-center">
          <p>{{ persona.nombre }}</p>
        </div>
        <div
          class="col-6 d-flex justify-content-end align-items-center"
          @click.stop
        >
          <i
            :class="['bi', persona.candadoAbierto ? 'bi-unlock' : 'bi-lock']"
            class="fs-4"
            style="cursor: pointer;"
            @click="toggleCandado(persona)"
          ></i>
        </div>
      </header>

      <main class="col-12 row m-0 p-0">
        <div class="col-9 apuestas d-flex flex-column justify-content-center align-items-start">
          <div class="col-12 m-0 p-0">
            <div
              v-for="key in getApuestasKeys(persona)"
              :key="key"
              class="col-12 m-0 p-0 d-flex justify-content-start align-items-center"
            >
              <div class="col-12 m-0 p-0 d-flex justify-content-start align-items-center">
                <div
                  v-for="(value, valKey) in persona[key]"
                  :key="valKey"
                  class="col-2 m-1 mr-2 p-0"
                >
                  <p
                    v-if="valKey === 'numero'"
                    class="col-12 m-0 mr-3 p-0 d-flex justify-content-center align-items-center rounded container-number"
                  >
                    {{ value }}
                  </p>
                  <p
                    v-else
                    class="col-12 m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number"
                  >
                    {{ value }}
                  </p>
                </div>
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
p {
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
  border: #000000 solid 2px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.305);
  padding: 10px;
  flex: 1 1 300px;
  min-width: 250px;
}
.apuestas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  padding: 5px;
}
</style>
