<template>
  <div class="container d-flex justify-content-center align-items-center container-login">
    <div class="container col-12 col-sm-8 py-4 my-3 box-shadow">
      <header class="text-center mb-3">
        <h2>Iniciar Sesión</h2>
      </header>
      <main class="d-flex flex-column align-items-center">
        <form @submit.prevent="handleSubmit" class="col-12 col-md-10">
          <!-- Alerta de error -->
          <div v-if="error" class="alert alert-danger mb-3" role="alert">
            {{ error }}
          </div>

          <!-- Campo de correo -->
          <div class="mb-3">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="formData.correo"
              required
            />
          </div>

          <!-- Campo de contraseña -->
          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="formData.contrasena"
              required
            />
          </div>

          <!-- Botón de iniciar sesión -->
          <button type="submit" class="btn btn-enter w-100" :disabled="loading">
            <span v-if="loading">
              <i class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i> Cargando...
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/firebase/auth';

const router = useRouter();

const formData = reactive({
  correo: '',
  contrasena: ''
});

const loading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { success, profile, user, error: loginError } = await AuthService.login({
      email: formData.correo,
      password: formData.contrasena
    });

    if (!success) throw new Error(loginError || 'Error al iniciar sesión');

    const { tipo } = profile || {};
    const userId = user?.uid;

    if (!tipo || !userId) throw new Error('No se encontró tipo o usuario válido');

    localStorage.setItem('userProfile', JSON.stringify(profile));
    router.push(tipo === 'admin' ? `/adminview/${userId}` : `/${tipo}/${userId}`);
  } catch (e) {
    error.value = e.message || 'Error inesperado. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.box-shadow {
  border-radius: 6px;
  border: 2px solid #000000;
  background-color: #f4f4f4;
  box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.85);
}

.btn-enter {
  border: 2px solid #000000;
  box-shadow: 2px 2px 2px #000000;
  border-radius: 6px;
  background-color: #ffc107;
  color: #000000;
}

.container-login {
  height: 100vh;
  width: 100%;
}
</style>