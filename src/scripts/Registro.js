import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/firebase/auth' // Named import
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'

export function useRegistro() {
    const nombre = ref('')
    const email = ref('')
    const password = ref('')
    const tipoCuenta = ref('')
    const mensajeNombre = ref('')
    const isValidNombre = ref(false)
    const mensajePassword = ref('')
    const isValidPassword = ref(false)
    const isLoading = ref(false)

    const router = useRouter()
    const authStore = useAuthStore()

    const showSelect = computed(() => {
        const tipo = authStore.profile?.tipo
        return tipo === 'admin' || tipo === 'bancos' || tipo === 'colectorPrincipal' || tipo === 'colectores'
    })

    const tiposPermitidos = computed(() => {
        const tipoUsuario = authStore.profile?.tipo
        switch (tipoUsuario) {
            case 'admin': return ['bancos']
            case 'bancos': return ['colectorPrincipal', 'colectores', 'listeros']
            case 'colectorPrincipal': return ['colectores', 'listeros']
            case 'colectores': return ['listeros']
            default: return []
        }
    })

    const validateNombre = () => {
        const regex = /^[a-zA-Z0-9]{3,15}$/
        isValidNombre.value = regex.test(nombre.value)
        mensajeNombre.value = isValidNombre.value 
            ? 'Nombre válido' 
            : '3-15 caracteres alfanuméricos'
    }

    const validatePassword = () => {
        isValidPassword.value = password.value.length >= 6
        mensajePassword.value = isValidPassword.value
            ? 'Contraseña válida'
            : 'Mínimo 6 caracteres'
    }

    const registrarUsuario = async () => {
        if (!showSelect.value) {
            Swal.fire("Error", "No tienes permisos", "error")
            return
        }

        if (!nombre.value || !email.value || !password.value || !tipoCuenta.value) {
            Swal.fire("Error", "Completa todos los campos", "error")
            return
        }

        if (!isValidNombre.value || !isValidPassword.value) {
            Swal.fire("Error", "Corrige los campos inválidos", "error")
            return
        }

        try {
            isLoading.value = true
            const currentUser = authStore.user
            const currentProfile = authStore.profile

            const userData = {
                nombre: nombre.value,
                tipo: tipoCuenta.value,
                bancoId: currentProfile?.bancoId || (tipoCuenta.value === 'bancos' ? null : currentProfile?.bancoId),
                creadorDirectoId: currentUser?.uid,
                creadorDirectoTipo: currentProfile?.tipo === 'bancos' ? 'banco' : 
                                  currentProfile?.tipo === 'colectorPrincipal' ? 'colector principal' : 
                                  currentProfile?.tipo === 'colectores' ? 'colector' : 'admin'
            }

            const result = await AuthService.registrarUsuarioJerarquico({
                email: email.value,
                password: password.value,
                ...userData
            })

            if (result.success) {
                Swal.fire("Éxito", "Usuario creado", "success")
                limpiarCampos()
            } else {
                Swal.fire("Error", result.error, "error")
            }
        } catch (error) {
            console.error("Error:", error)
            Swal.fire("Error", error.message, "error")
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
            await authStore.logout()
            router.push('/')
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
            Swal.fire("Error", "No se pudo cerrar sesión", "error")
        }
    }

    return {
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
        tiposPermitidos,
        validateNombre,
        validatePassword,
        registrarUsuario,
        limpiarCampos,
        cerrarSesion,
        authStore
    }
}