<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import { onSnapshot, collection } from 'firebase/firestore'
import { db } from '../firebase/config'

const apuestas = ref([])

// Cargar apuestas desde Firebase al montar el componente
onMounted(() => {
  const unsubscribe = onSnapshot(collection(db, 'apuestas'), (querySnapshot) => {
    apuestas.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      candadoAbierto: true
    }))
  })

  // Si quieres limpiar cuando el componente se desmonta (buena práctica)
  // import { onUnmounted } from 'vue'
  onUnmounted(() => unsubscribe())
})


const getApuestasKeys = (persona) => {
  return Object.keys(persona).filter((key) => key.startsWith('apuesta'))
}

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
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('Editar a:', persona.nombre)
    } else if (result.isDenied) {
      console.log('Eliminar a:', persona.nombre)
    }
  })
}

const extraerHora = (textoFecha) => {
  if (!textoFecha) return ''

  // Si es un Timestamp de Firebase, convertirlo a una fecha JS
  const fecha = textoFecha.toDate ? textoFecha.toDate() : textoFecha

  // Convertir a string legible con hora en formato de 12 horas
  const opciones = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  const horaFormateada = fecha.toLocaleTimeString('es-CO', opciones) // o 'es-ES'
  return horaFormateada
}

const obtenerIconoEstado = (persona) => {
  if (persona.estado === 'Cargado') {
    return 'bi bi-cloud-check text-success'
  } else if (persona.estado === 'Pendiente') {
    return 'bi bi-cloud-slash text-danger'
  } else if (persona.estado === 'EnTiempo') {
    return 'bi bi-stopwatch text-success'
  } else if (persona.estado === 'FueraDeTiempo') {
    return 'bi bi-stopwatch text-danger'
  } else {
    return 'bi bi-exclamation-lg text-primary'
  }
}

</script>


<template>
  <div class="col-12 m-0 p-0">
    <div
      v-for="persona in apuestas"
      :key="persona.id_apuesta"
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
                <!-- Mostrar primero el cuadrado (si existe) -->
                <div v-if="'cuadrado' in mapa" class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded container-number">
                    {{ mapa['cuadrado'] }}
                  </p>
                </div>

                <!-- Luego los círculos (solo si existen) -->
                <div
                  v-if="'circulo1' in mapa"
                  class="col-3 m-0 p-0 d-flex justify-content-center align-items-center"
                >
                  <p
                    class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number"
                  >
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
                  <p class="m-1">{{ persona.totalGlobal  }}</p>
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
  border: #000000 solid 2px;
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
