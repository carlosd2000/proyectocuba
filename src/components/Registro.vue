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
                  <option v-if="authStore.profile?.tipo === 'admin'" value="bancos">Banco</option>
                  <option v-if="authStore.profile?.tipo === 'bancos'" value="colectores">Colector</option>
                  <option v-if="['bancos', 'colectores'].includes(authStore.profile?.tipo)" value="listeros">Listero</option>
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
import { useRegistro } from '../scripts/Registro.js'

const {
  nombre,
  email,
  password,
  tipoCuenta,
  mensajeNombre,
  isValidNombre,
  mensajePassword,
  isValidPassword,
  isLoading,
  showSelect,
  validateNombre,
  validatePassword,
  registrarUsuario,
  limpiarCampos,
  cerrarSesion,
  authStore
} = useRegistro()
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