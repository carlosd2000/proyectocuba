<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)
const isOnline = ref(navigator.onLine)

// Verificar conexión a internet
onMounted(() => {
  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)
})

const handleSubmit = async () => {
  // Verificar conexión antes de intentar login
  if (!isOnline.value) {
    error.value = 'No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.'
    return
  }

  // Validación básica de campos
  if (!formData.email.trim() || !formData.password.trim()) {
    error.value = 'Por favor, completa todos los campos.'
    return
  }

  // Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    error.value = 'Por favor, ingresa un correo electrónico válido.'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const result = await authStore.login(formData.email, formData.password)
    
    if (result.success) {
      // Mostrar feedback al usuario
      await Swal.fire({
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })

      // Redirección basada en el tipo de usuario según tu router
      let redirectPath = '/'
      
      switch(authStore.userType) {
        case 'admin':
          redirectPath = `/adminview/${authStore.userId}`
          break
        case 'bancos':
          redirectPath = `/bancos/${authStore.userId}`
          break
        case 'colectorPrincipal':
          redirectPath = `/colectorprincipal/${authStore.userId}`
          break
        case 'colectores':
          redirectPath = `/colectores/${authStore.userId}`
          break
        case 'listeros':
          redirectPath = `/listeros/${authStore.userId}`
          break
        default:
          redirectPath = `/usuario/${authStore.userId}`
      }

      router.push(redirectPath)
    } else {
      // Mapeo de errores específicos
      switch (result.errorCode) {
        case 'auth/user-not-found':
          error.value = 'No existe una cuenta con este correo electrónico.'
          break
        case 'auth/wrong-password':
          error.value = 'Contraseña incorrecta. Por favor, intenta nuevamente.'
          break
        case 'auth/too-many-requests':
          error.value = 'Demasiados intentos fallidos. Tu cuenta ha sido temporalmente bloqueada.'
          break
        case 'auth/invalid-email':
          error.value = 'El formato del correo electrónico no es válido.'
          break
        case 'LOGIN_ERROR':
        default:
          if (result.error.includes('Perfil no encontrado')) {
            error.value = 'Usuario autenticado pero perfil no configurado. Contacta al administrador.'
          } else {
            error.value = result.error || 'Error al iniciar sesión. Por favor, intenta nuevamente.'
          }
      }
    }
  } catch (e) {
    console.error('Error inesperado:', e)
    
    if (e.name === 'TypeError' && e.message.includes('Failed to fetch')) {
      error.value = 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
    } else {
      error.value = 'Error inesperado. Intenta nuevamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <header class="login-header">
        <h2>Iniciar Sesión</h2>
        <p>Accede a tu cuenta para continuar</p>
      </header>

      <main class="login-main">
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- Alerta de error -->
          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-circle"></i>
            {{ error }}
          </div>
          
          <!-- Notificación cuando está offline -->
          <div v-if="!isOnline" class="alert alert-warning">
            <i class="bi bi-wifi-off"></i>
            Estás trabajando sin conexión a internet.
          </div>
          
          <!-- Campo de correo -->
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              required
              :disabled="loading"
              placeholder="ejemplo@dominio.com"
              class="form-control"
            />
          </div>

          <!-- Campo de contraseña -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              required
              :disabled="loading"
              placeholder="Ingresa tu contraseña"
              class="form-control"
            />
          </div>

          <!-- Botón de iniciar sesión -->
          <button 
            type="submit" 
            class="login-button"
            :disabled="loading || !isOnline"
          >
            <span v-if="loading" class="loading-spinner">
              <span class="spinner"></span>
              Procesando...
            </span>
            <span v-else>
              <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
            </span>
          </button>
        </form>
      </main>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.alert-warning {
  background-color: #fef3c7;
  color: #b45309;
  border: 1px solid #fcd34d;
}

.login-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 576px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>