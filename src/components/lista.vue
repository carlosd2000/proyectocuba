<script setup>
import { onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import {
  apuestas,
  obtenerApuestas,
  eliminarApuesta,
  editarApuesta
} from '../scripts/CRUDlistas.js'

let unsubscribe = null

onMounted(() => {
  unsubscribe = obtenerApuestas()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

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
  }).then(async (result) => {
    if (result.isConfirmed) {
      console.log('Editar a:', persona.nombre)
      // Ejemplo de uso:
      // await editarApuesta(persona.id, { nombre: 'Nuevo nombre' })
    } else if (result.isDenied) {
      const confirmDelete = await Swal.fire({
        title: '¿Confirmas eliminar?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (confirmDelete.isConfirmed) {
        await eliminarApuesta(persona.id)
      }
    }
  })
}

const extraerHora = (textoFecha) => {
  if (!textoFecha) return ''
  const fecha = textoFecha.toDate ? textoFecha.toDate() : textoFecha
  const opciones = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }
  return fecha.toLocaleTimeString('es-CO', opciones)
}

const obtenerIconoEstado = (persona) => {
  if (persona.estado === 'Cargado') return 'bi bi-cloud-check text-success'
  if (persona.estado === 'Pendiente') return 'bi bi-cloud-slash text-danger'
  if (persona.estado === 'EnTiempo') return 'bi bi-stopwatch text-success'
  if (persona.estado === 'FueraDeTiempo') return 'bi bi-stopwatch text-danger'
  return 'bi bi-exclamation-lg text-primary'
}
</script>

<template>
  <div class="col-12 m-0 p-0">
    <div
      v-for="persona in apuestas"
      :key="persona.id"
      class="m-0 mb-2 p-1 py-4 persona"
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
        <div class="col-6 m-0 p-0 apuestas d-flex flex-column justify-content-center align-items-start">
          <div class="col-12 m-0 p-0">
            <div v-for="(mapa, index) in persona.datos" :key="index" class="my-3">
              <div class="m-0 p-0 d-flex align-items-center flex-wrap">
                <div v-if="'cuadrado' in mapa" class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded container-number">
                    {{ mapa['cuadrado'] }}
                  </p>
                </div>
                <div v-if="'circulo1' in mapa" class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                    {{ mapa['circulo1'] }}
                  </p>
                </div>
                <div v-if="'circulo2' in mapa" class="col-3 m-0 p-0">
                  <div class="col-12 m-0 p-0 d-flex justify-content-center align-items-center">
                    <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                      {{ mapa['circulo2'] }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-2 m-0 p-0 d-flex justify-content-center align-items-center">
          <div class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
            {{ persona.circuloSolo }}
          </div>
        </div>
        <div class="col-4 m-0 p-0 d-flex justify-content-center align-items-center">
          <div class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
            <div class="col-12 m-0 p-0 d-flex justify-content-around align-items-center">
              <div class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                <i class="bi bi-coin m-1"></i>
              </div>
              <div class="col-6 m-0 p-0 d-flex justify-content-start align-items-center">
                <p class="m-1">9</p>
              </div>
            </div>
            <div class="col-12 m-0 p-0 flex d-flex flex-column justify-content-center align-items-center">
              <div class="col-12 m-0 p-0 d-flex justify-content-around align-items-center">
                <div class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                  <i class="bi bi-award-fill"></i>
                </div>
                <div class="col-6 m-0 p-0 d-flex justify-content-start align-items-center">
                  <p class="m-1">{{ persona.totalGlobal }}</p>
                </div>
              </div>
            </div>
            <div class="col-12 m-0 p-0 d-flex justify-content-end align-items-center">
              <p class="hora-text">{{ extraerHora(persona.creadoEn) }}</p>
              <i :class="obtenerIconoEstado(persona)"></i>
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
  width: 30px;
  height: 30px;
  background-color: #f1f1f1;
}
.persona {
  background: white;
  border-radius: 10px;
  border: #000 solid 2px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.305);
  padding: 10px;
  flex: 1 1 300px;
  min-width: 250px;
}
.apuestas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}
.hora-text {
  font-size: 0.7rem;
}
</style>
