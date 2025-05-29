<template>
  <div class="container vh-100 d-flex justify-content-center align-items-center container-register">
    <div class="container col-12 col-sm-8 py-3 my-3 box-shadow">
      <header class="col-12 m-0 p-0 d-flex justify-content-center align-items-center">
        <h2 class="text-center m-0 p-0">Crear Cuenta</h2>
      </header>
      <main class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
        <div class="col-12 m-2 d-flex justify-content-center">
          <form @submit.prevent="registrarUsuario" class="col-12 col-md-10">
            <div class="mb-1">
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

            <div class="mb-1">
              <label for="email" class="form-label">Correo electrónico</label>
              <input v-model="email" type="email" class="form-control" id="email" placeholder="correo@ejemplo.com" />
            </div>

            <div class="mb-1">
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

            <div class="my-1 col-12 p-0" v-if="showSelect">
              <label for="opciones" class="col-12 m-0 p-1 form-label">Tipo de cuenta</label>
              <select v-model="tipoCuenta" class="col-12 m-0 p-1 form-select" id="opciones">
                <option disabled value="">Seleccionar</option>
                <option v-if="authStore.profile?.tipo === 'admin'" value="bancos">Banco</option>
                <option v-if="authStore.profile?.tipo === 'bancos'" value="colectores">Colector</option>
                <option v-if="['bancos', 'colectores'].includes(authStore.profile?.tipo)" value="listeros">Listero</option>
              </select>
            </div>

            <div class="my-1 col-12 p-0" v-if="authStore.profile?.tipo === 'bancos' && tipoCuenta === 'listeros'">
              <label for="padre" class="col-12 m-0 p-1 form-label">Padre al que pertenece</label>
              <div class="col-12 m-0 p-0 custom-select-wrapper">
                <select 
                  v-model="padreSeleccionado" 
                  class="form-select custom-select" 
                  id="padre"
                  size="1"
                  @focus="expandSelect"
                  @change="shrinkSelect"
                >
                  <option disabled value="">Seleccionar</option>
                  <option :value="`banco_${authStore.user?.uid}`">
                    Banco ({{ authStore.profile?.nombre }})
                  </option>
                  <option v-for="colector in colectores" :key="colector.id" :value="`colector_${colector.id}`">
                    Colector: {{ colector.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              class="col-12 my-1 btn btn-page"
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

const expandSelect = (e) => {
  e.target.size = 5 // Muestra 5 opciones a la vez
}

const shrinkSelect = (e) => {
  e.target.size = 1
}

const {
  nombre,
  email,
  password,
  tipoCuenta,
  padreSeleccionado,
  colectores,
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
.form-select {
  background-color: #f4f4f4;
  border: 2px solid #000000;
  border-radius: 6px;
  max-height: 200px; /* Altura máxima antes de mostrar scroll */
  overflow-y: auto; /* Habilitar scroll vertical */
}

.custom-select-wrapper {
  position: relative;
  min-height: 40px;
}

.custom-select {
  height: auto;
  min-height: 30px;
  overflow-y: hidden;
  transition: all 0.3s ease;
}

.custom-select:focus {
  position: absolute;
  z-index: 1000;
  width: 100%;
  height: auto;
  max-height: 150px;
  overflow-y: auto;
}
</style>