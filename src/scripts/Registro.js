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

        // Validación consolidada
        const errors = []
        if (!nombre.value) errors.push("Nombre requerido")
        if (!email.value) errors.push("Email requerido")
        if (!password.value) errors.push("Contraseña requerida")
        if (!tipoCuenta.value) errors.push("Tipo de cuenta requerido")
        if (!isValidNombre.value) errors.push("Nombre inválido")
        if (!isValidPassword.value) errors.push("Contraseña inválida")
        
        if (errors.length > 0) {
            Swal.fire("Error", errors.join(", "), "error")
            return
        }

        try {
            isLoading.value = true
            
            // Datos mínimos necesarios
            const result = await AuthService.registrarUsuarioJerarquico({
                email: email.value,
                password: password.value,
                nombre: nombre.value,
                tipo: tipoCuenta.value,
                bancoId: authStore.profile?.bancoId,
                creadorDirectoId: authStore.user?.uid,
                creadorDirectoTipo: authStore.profile?.tipo
            })

            if (result.success) {
                Swal.fire("Éxito", "Usuario creado", "success")
                limpiarCampos()
            } else {
                throw new Error(result.error)
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