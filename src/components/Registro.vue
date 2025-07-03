<template>
  <div class="container vh-100 d-flex justify-content-center align-items-center container-register">
    <div class="container col-12 col-sm-8 py-3 my-3 box-shadow">
      <header class="col-12 m-0 p-0 d-flex justify-content-center align-items-center">
        <h2 class="text-center m-0 p-0">Crear Cuenta</h2>
      </header>

      <!-- Notificación de contexto -->
      <div v-if="authStore.contextoJerarquico.bancoId && authStore.profile?.tipo !== 'admin'" 
     class="alert alert-info mx-3 mb-3 py-2">
    <i class="bi bi-info-circle me-2"></i>
    <span v-if="authStore.profile?.tipo === 'bancos'">
        Registrarás usuarios en tu banco: <strong>{{ authStore.contextoJerarquico.bancoId }}</strong>
    </span>
    <span v-else-if="authStore.profile?.tipo === 'colectorPrincipal'">
        Usuarios se crearán bajo tu cargo en el banco: <strong>{{ authStore.contextoJerarquico.bancoId }}</strong>
    </span>
    <span v-else-if="authStore.profile?.tipo === 'colectores'">
        Usuarios se crearán bajo tu cargo en el banco: <strong>{{ authStore.contextoJerarquico.bancoId }}</strong>
    </span>
      </div>
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
                :disabled="!showSelect || isLoading"
              />
              <p class="text-danger mt-1" v-if="nombre && !isValidNombre">{{ mensajeNombre }}</p>
              <p class="text-success mt-1" v-if="isValidNombre">{{ mensajeNombre }}</p>
            </div>

            <div class="mb-1">
              <label for="email" class="form-label">Correo electrónico</label>
              <input 
                v-model="email" 
                type="email" 
                class="form-control" 
                id="email" 
                placeholder="correo@ejemplo.com"
                :disabled="!showSelect || isLoading"
              />
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
                :disabled="!showSelect || isLoading"
              />
              <p class="text-danger mt-1" v-if="password && !isValidPassword">{{ mensajePassword }}</p>
              <p class="text-success mt-1" v-if="isValidPassword">{{ mensajePassword }}</p>
            </div>

            <!-- Selector de tipo de cuenta -->
            <div class="my-1 col-12 p-0" v-if="showSelect">
              <label for="opciones" class="col-12 m-0 p-1 form-label">Tipo de cuenta</label>
              <select 
                v-model="tipoCuenta" 
                class="col-12 m-0 p-1 form-select" 
                id="opciones"
                :disabled="isLoading"
                @change="padreSeleccionado = ''"
              >
                <option disabled value="">Seleccionar</option>
                <option v-if="authStore.profile?.tipo === 'admin'" value="bancos">Banco</option>
                <option v-if="authStore.profile?.tipo === 'bancos'" value="colectorPrincipal">Colector Principal</option>
                <option v-if="['bancos', 'colectorPrincipal'].includes(authStore.profile?.tipo)" value="colectores">Colector</option>
                <option v-if="['bancos', 'colectorPrincipal', 'colectores'].includes(authStore.profile?.tipo)" 
                        value="listeros">Listero</option>
              </select>
            </div>

            <!-- Mensaje para Colector Principal creando Colectores -->
            <div v-if="authStore.profile?.tipo === 'colectorPrincipal' && tipoCuenta === 'colectores'"
                 class="alert alert-warning my-2 py-2">
              <i class="bi bi-exclamation-circle me-2"></i>
              Los colectores se crearán automáticamente bajo tu cargo
            </div>

            <!-- Selector de padre para Bancos creando Colectores -->
            <div class="my-1 col-12 p-0" 
                 v-if="authStore.profile?.tipo === 'bancos' && tipoCuenta === 'colectores'">
              <label for="padreColector" class="col-12 m-0 p-1 form-label">Padre al que pertenece</label>
              <div class="col-12 m-0 p-0 custom-select-wrapper">
                <select 
                  v-model="padreSeleccionado" 
                  class="form-select custom-select" 
                  id="padreColector"
                  size="1"
                  @focus="expandSelect"
                  @change="shrinkSelect"
                  :disabled="isLoading"
                >
                  <option disabled value="">Seleccionar</option>
                  <option :value="`banco_${authStore.user?.uid}`">
                    Banco ({{ authStore.profile?.nombre }})
                  </option>
                  <option v-for="colectorPrincipal in colectoresPrincipales" 
                          :key="colectorPrincipal.id" 
                          :value="`colectorPrincipal_${colectorPrincipal.id}`">
                    Colector Principal: {{ colectorPrincipal.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Selector de padre para Colector Principal creando Listeros -->
            <div class="my-1 col-12 p-0" 
                 v-if="authStore.profile?.tipo === 'colectorPrincipal' && tipoCuenta === 'listeros'">
              <label for="padreListeroCP" class="col-12 m-0 p-1 form-label">Asignar a:</label>
              <div class="col-12 m-0 p-0 custom-select-wrapper">
                <select 
                  v-model="padreSeleccionado" 
                  class="form-select custom-select" 
                  id="padreListeroCP"
                  size="1"
                  @focus="expandSelect"
                  @change="shrinkSelect"
                  :disabled="isLoading"
                >
                  <option :value="`colectorPrincipal_${authStore.user?.uid}`">
                    Mi cargo (Colector Principal)
                  </option>
                  <option v-for="colector in colectores" 
                          :key="colector.id" 
                          :value="`colector_${colector.id}`">
                    Colector: {{ colector.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Selector de padre para Bancos creando Listeros -->
            <div class="my-1 col-12 p-0" 
                 v-if="authStore.profile?.tipo === 'bancos' && tipoCuenta === 'listeros'">
              <label for="padreListero" class="col-12 m-0 p-1 form-label">Padre al que pertenece</label>
              <div class="col-12 m-0 p-0 custom-select-wrapper">
                <select 
                  v-model="padreSeleccionado" 
                  class="form-select custom-select" 
                  id="padreListero"
                  size="1"
                  @focus="expandSelect"
                  @change="shrinkSelect"
                  :disabled="isLoading"
                >
                  <option disabled value="">Seleccionar</option>
                  <option :value="`banco_${authStore.user?.uid}`">
                    Banco ({{ authStore.profile?.nombre }})
                  </option>
                  <option v-for="colectorPrincipal in colectoresPrincipales" 
                          :key="colectorPrincipal.id" 
                          :value="`colectorPrincipal_${colectorPrincipal.id}`">
                    Colector Principal: {{ colectorPrincipal.nombre }}
                  </option>
                  <option v-for="colector in colectores" 
                          :key="colector.id" 
                          :value="`colector_${colector.id}`">
                    Colector: {{ colector.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              class="col-12 my-1 btn btn-page"
              :disabled="!showSelect || isLoading || (!authStore.contextoJerarquico.bancoId && authStore.profile?.tipo !== 'admin')"
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
  e.target.size = 5
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
  colectoresPrincipales,
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
  max-height: 200px;
  overflow-y: auto;
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

.btn-page {
  background-color: #000000;
  color: white;
  border-radius: 6px;
  border: 2px solid #000000;
  font-weight: bold;
}

.btn-page:hover {
  background-color: #333333;
  color: white;
}

.btn-page:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
  color: #666666;
}

.alert-info {
  background-color: #e7f4ff;
  border: 1px solid #86b7fe;
  color: #084298;
  border-radius: 6px;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffecb5;
  color: #664d03;
  border-radius: 6px;
}

.bi {
  display: inline-block;
  vertical-align: -.125em;
}
</style>