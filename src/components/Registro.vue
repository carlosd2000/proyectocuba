<template>
  <div class="container vh-100 d-flex justify-content-center align-items-center container-register">
    <div class="container col-12 col-sm-8 py-3 my-3 box-shadow">
      <header class="col-12 m-1 p-1 d-flex justify-content-center align-items-center">
        <h2 class="text-center m-0 p-0">Crear Cuenta</h2>
      </header>
      <main class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
        <div class="col-12 m-3 d-flex justify-content-center">
          <form @submit.prevent="registrarUsuario" class="col-12 col-md-10">
            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre completo</label>
              <input
                v-model="nombre"
                type="text"
                class="form-control"
                id="nombre"
                placeholder="Tu nombre"
                @input="validateNombre"
              />
              <p class="text-danger mt-1" v-if="nombre && !isValidNombre">{{ mensajeNombre }}</p>
              <p class="text-success mt-1" v-if="isValidNombre">{{ mensajeNombre }}</p>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Correo electrónico</label>
              <input v-model="email" type="email" class="form-control" id="email" placeholder="correo@ejemplo.com" />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                v-model="password"
                type="password"
                class="form-control"
                id="password"
                placeholder="********"
                @input="validatePassword"
              />
              <p class="text-danger mt-1" v-if="password && !isValidPassword">{{ mensajePassword }}</p>
              <p class="text-success mt-1" v-if="isValidPassword">{{ mensajePassword }}</p>
            </div>

            <div class="mb-3" v-if="showSelect">
              <label for="opciones" class="form-label">Tipo de cuenta</label>
              <select v-model="tipoCuenta" class="form-select" id="opciones">
                <option disabled value="">Seleccionar</option>
                <option v-if="userProfile?.tipo === 'admin'" value="bancos">Banco</option>
                <option v-if="userProfile?.tipo === 'bancos'" value="colectores">Colector</option>
                <option v-if="['bancos', 'colectores'].includes(userProfile?.tipo)" value="listeros">Listero</option>
              </select>
            </div>

            <button
              type="submit"
              class="col-12 btn btn-page"
              :disabled="!showSelect || isLoading"
            >
              <span v-if="isLoading">
                <i class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i> Cargando...
              </span>
              <span v-else>Crear</span>
            </button>

            <div class="text-end mt-2">
              <button @click="cerrarSesion" type="button" class="btn btn-link text-danger p-0">Cerrar sesión</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '@/firebase/auth'
import { auth } from '@/firebase/config'
import { signOut } from 'firebase/auth'
import Swal from 'sweetalert2'

const nombre = ref('')
const email = ref('')
const password = ref('')
const tipoCuenta = ref('')
const mensajeNombre = ref('')
const isValidNombre = ref(false)
const mensajePassword = ref('')
const isValidPassword = ref(false)
const userProfile = ref(null)
const isLoading = ref(false)

const creadorId = ref('')
const tipoCreador = ref('')

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const saved = localStorage.getItem('userProfile')
  if (saved) {
    userProfile.value = JSON.parse(saved)
  }

  // Detectar creadorId y tipoCreador desde la URL
  creadorId.value = route.params.id || ''

  if (route.path.includes('/bancos')) {
    tipoCreador.value = 'banco'
  } else if (route.path.includes('/colectores')) {
    tipoCreador.value = 'colector'
  }
})

const showSelect = computed(() => {
  const tipo = userProfile.value?.tipo
  return tipo === 'admin' || tipo === 'bancos' || tipo === 'colectores'
})

const validateNombre = () => {
  const regex = /^[a-zA-Z0-9]{3,15}$/
  if (!nombre.value) {
    mensajeNombre.value = ''
    isValidNombre.value = false
    return
  }

  if (!regex.test(nombre.value)) {
    mensajeNombre.value = 'El nombre debe tener entre 3 y 15 caracteres, solo letras y números'
    isValidNombre.value = false
  } else {
    mensajeNombre.value = 'Nombre válido'
    isValidNombre.value = true
  }
}

const validatePassword = () => {
  if (!password.value) {
    mensajePassword.value = ''
    isValidPassword.value = false
    return
  }

  if (password.value.length < 6) {
    mensajePassword.value = 'La contraseña debe tener al menos 6 caracteres'
    isValidPassword.value = false
  } else {
    mensajePassword.value = 'Contraseña válida'
    isValidPassword.value = true
  }
}

const registrarUsuario = async () => {
  if (!showSelect.value) {
    Swal.fire("Error", "No tienes permisos para crear cuentas", "error")
    return
  }

  if (!nombre.value || !email.value || !password.value || !tipoCuenta.value) {
    Swal.fire("Error", "Por favor llena todos los campos", "error")
    return
  }

  if (!isValidNombre.value || !isValidPassword.value) {
    Swal.fire("Error", "Por favor completa los campos correctamente", "error")
    return
  }

  try {
    isLoading.value = true

    const userData = {
      nombre: nombre.value,
      tipo: tipoCuenta.value,
      creadorId: creadorId.value,
      tipoCreador: tipoCreador.value
    }

    const result = await AuthService.register({
      email: email.value,
      password: password.value,
      userData
    })

    if (result.success) {
      Swal.fire("Creación exitosa", "Usuario creado correctamente", "success")
      limpiarCampos()
    } else {
      Swal.fire("Error", result.error, "error")
    }
  } catch (error) {
    console.error("Error en registro:", error)
    Swal.fire("Error", "No se pudo crear el usuario", "error")
  } finally {
    isLoading.value = false
  }
}

const limpiarCampos = () => {
  nombre.value = ''
  email.value = ''
  password.value = ''
  tipoCuenta.value = ''
  mensajeNombre.value = ''
  mensajePassword.value = ''
  isValidNombre.value = false
  isValidPassword.value = false
}

const cerrarSesion = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem('userProfile')
    router.push('/')
  } catch (error) {
    console.error("Error al cerrar sesión", error)
    Swal.fire("Error", "No se pudo cerrar sesión", "error")
  }
}
</script>

<style scoped>
.box-shadow {
  border-radius: 6px;
  border: 2px solid #000000;
  background-color: #f4f4f4;
  box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.853);
}

.container-register {
  height: 100vh;
  width: 100%;
}
</style>
