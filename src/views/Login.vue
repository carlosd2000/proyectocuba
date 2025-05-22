<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref(null);
const isOnline = ref(navigator.onLine);

// Verificar conexión a internet
onMounted(() => {
  window.addEventListener('online', () => isOnline.value = true);
  window.addEventListener('offline', () => isOnline.value = false);
});

const handleSubmit = async () => {
  // Verificar conexión antes de intentar login
  if (!isOnline.value) {
    error.value = 'No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.';
    return;
  }

  // Validación básica de campos
  if (!formData.email.trim() || !formData.password.trim()) {
    error.value = 'Por favor, completa todos los campos.';
    return;
  }

  // Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    error.value = 'Por favor, ingresa un correo electrónico válido.';
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const result = await authStore.login(formData.email, formData.password);
    
    if (result.success) {
      // Redirección basada en el tipo de usuario
      const redirectPath = authStore.userType === 'admin' 
        ? `/adminview/${authStore.userId}`
        : `/${authStore.userType}/${authStore.userId}`;
      
      router.push(redirectPath);
    } else {
      // Mapeo de errores específicos del backend
      switch (result.errorCode) {
        case 'USER_NOT_FOUND':
          error.value = 'No existe una cuenta con este correo electrónico.';
          break;
        case 'INVALID_PASSWORD':
          error.value = 'Contraseña incorrecta. Por favor, intenta nuevamente.';
          break;
        case 'ACCOUNT_LOCKED':
          error.value = 'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente más tarde.';
          break;
        case 'ACCOUNT_DISABLED':
          error.value = 'Tu cuenta ha sido desactivada. Por favor, contacta al administrador.';
          break;
        case 'EMAIL_NOT_VERIFIED':
          error.value = 'Tu correo electrónico no ha sido verificado. Por favor, revisa tu bandeja de entrada.';
          break;
        case 'SERVER_ERROR':
          error.value = 'Error en el servidor. Por favor, intenta más tarde.';
          break;
        case 'NETWORK_ERROR':
          error.value = 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
          break;
        case 'TIMEOUT':
          error.value = 'El servidor está tardando demasiado en responder. Por favor, intenta nuevamente.';
          break;
        default:
          error.value = result.error || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      }
    }
  } catch (e) {
    console.error('Error inesperado:', e);
    
    // Manejo de diferentes tipos de errores
    if (e.name === 'TypeError' && e.message.includes('Failed to fetch')) {
      error.value = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    } else if (e.response && e.response.status === 429) {
      error.value = 'Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente.';
    } else if (e.response && e.response.status >= 500) {
      error.value = 'Error en el servidor. Por favor, intenta más tarde.';
    } else if (e.response && e.response.status === 401) {
      error.value = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
    } else {
      error.value = 'Error inesperado. Intenta nuevamente.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

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
          <!-- Notificación cuando está offline -->
          <div v-if="!isOnline" class="alert alert-warning mb-3" role="alert">
            <i class="bi bi-wifi-off me-2"></i>
            Estás trabajando sin conexión a internet. Algunas funciones pueden no estar disponibles.
          </div>
          <!-- Campo de correo -->
          <div class="mb-3">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="formData.email"
              required
              :disabled="loading"
            />
          </div>

          <!-- Campo de contraseña -->
          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="formData.password"
              required
              :disabled="loading"
            />
          </div>

          <!-- Botón de iniciar sesión -->
          <button type="submit" class="btn btn-enter w-100" :disabled="loading || !isOnline">
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
.alert {
  border-radius: 6px;
  font-size: 0.7rem;
}
</style>