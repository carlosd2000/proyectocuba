<template>
  <div class="container d-flex justify-content-center align-items-center container-login">
    <div class="container col-12 col-sm-8 py-3 my-3 box-shadow">
      <header class="col-12 m-1 p-1 d-flex justify-content-center align-items-center">
        <h2 class="text-center m-0 p-0">Iniciar Sesión</h2>
      </header>
      <main class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
        <div class="col-12 m-3 d-flex justify-content-center">
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
            <button type="submit" class="col-12 btn btn-enter" :disabled="loading">
              <span v-if="loading">
                <i class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i> Cargando...
              </span>
              <span v-else>Iniciar Sesión</span>
            </button>

            <!-- Link a registro (a listeros por ahora) -->
            <div class="text-end mt-2">
              <RouterLink to="/listeros" class="text-primary">Ir a Listeros</RouterLink>
            </div>

          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/firebase/auth'
import Swal from 'sweetalert2'

const router = useRouter()

const formData = reactive({
  correo: '',
  contrasena: ''
})

const loading = ref(false)
const error = ref(null)

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await AuthService.login({
      email: formData.correo,
      password: formData.contrasena
    })

    if (result.success) {
      const tipo = result.profile?.tipo
      const userId = result.user.uid

      localStorage.setItem('userProfile', JSON.stringify(result.profile))

      console.log("Tipo de cuenta detectado:", tipo)

      // Redirigir a la ruta dinámica tipo/uid
      if (tipo && userId) {
        router.push(`/${tipo}/${userId}`)
      } else {
        Swal.fire('Error', 'No se encontró tipo o usuario válido', 'error')
      }
    } else {
      error.value = result.error || 'Error al iniciar sesión'
    }
  } catch (e) {
    console.error("Error en login:", e)
    error.value = "Error inesperado. Intenta nuevamente."
  } finally {
    loading.value = false
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

.btn-enter {
  border: #000000 solid 2px;
  box-shadow: #000000 2px 2px 2px;
  border-radius: 6px;
  background-color: #ffc107;
  color: #000000;
}

.container-login {
  height: 100vh;
  width: 100%;
}
</style>
