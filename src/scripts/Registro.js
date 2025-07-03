import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '@/firebase/auth'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
import { db } from '@/firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'

export function useRegistro() {
    // Estados reactivos
    const nombre = ref('')
    const email = ref('')
    const password = ref('')
    const tipoCuenta = ref('')
    const padreSeleccionado = ref('')
    const colectores = ref([])
    const colectoresPrincipales = ref([])
    const mensajeNombre = ref('')
    const isValidNombre = ref(false)
    const mensajePassword = ref('')
    const isValidPassword = ref(false)
    const isLoading = ref(false)

    // Router y Store
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    // Computed
    const showSelect = computed(() => {
        const tipo = authStore.profile?.tipo
        return tipo === 'admin' || tipo === 'bancos' || tipo === 'colectorPrincipal' || tipo === 'colectores'
    })

    // Hooks
    onMounted(() => {
        if (route.path.includes('/bancos')) {
            const unsubscribe = cargarSubordinados()
            return () => unsubscribe && unsubscribe()
        }
    })

    // Métodos
    const validateNombre = () => {
        const regex = /^[a-zA-Z0-9]{3,15}$/
        if (!nombre.value) {
            mensajeNombre.value = ''
            isValidNombre.value = false
            return
        }
        isValidNombre.value = regex.test(nombre.value)
        mensajeNombre.value = isValidNombre.value 
            ? 'Nombre válido' 
            : 'El nombre debe tener entre 3 y 15 caracteres alfanuméricos'
    }

    const validatePassword = () => {
        isValidPassword.value = password.value.length >= 6
        mensajePassword.value = isValidPassword.value
            ? 'Contraseña válida'
            : 'La contraseña debe tener al menos 6 caracteres'
    }

    const cargarSubordinados = () => {
        try {
            if (authStore.profile?.tipo === 'bancos' && authStore.user?.uid) {
                const bancoId = authStore.user.uid
                
                // Cargar Colectores Principales
                const cpUnsubscribe = onSnapshot(
                    collection(db, 'bancos', bancoId, 'colectorPrincipal'),
                    (snapshot) => {
                        colectoresPrincipales.value = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                    }
                )

                // Cargar Colectores
                const cUnsubscribe = onSnapshot(
                    collection(db, 'bancos', bancoId, 'colectores'),
                    (snapshot) => {
                        colectores.value = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                    }
                )

                return () => {
                    cpUnsubscribe()
                    cUnsubscribe()
                }
            }
        } catch (error) {
            console.error("Error cargando subordinados:", error)
            Swal.fire("Error", "No se pudieron cargar los subordinados", "error")
        }
    }

    const registrarUsuario = async () => {
        // Validaciones básicas
        if (!showSelect.value) {
            Swal.fire("Error", "No tienes permisos para crear cuentas", "error")
            return
        }

        if (!nombre.value || !email.value || !password.value || !tipoCuenta.value) {
            Swal.fire("Error", "Por favor completa todos los campos", "error")
            return
        }

        if (!isValidNombre.value || !isValidPassword.value) {
            Swal.fire("Error", "Por favor corrige los campos inválidos", "error")
            return
        }

        // Validaciones específicas para bancos
        if (authStore.profile?.tipo === 'bancos') {
            if ((tipoCuenta.value === 'colectores' || tipoCuenta.value === 'listeros') && !padreSeleccionado.value) {
                Swal.fire("Error", `Selecciona un padre para el ${tipoCuenta.value}`, "error")
                return
            }
        }

        try {
            isLoading.value = true

            // *** ÚNICO CAMBIO REALIZADO *** (Manteniendo toda tu lógica intacta)
            const currentUserId = authStore.user?.uid
            const currentUserTipo = authStore.profile?.tipo
            
            // Obtener bancoId basado en el path de la ruta
            const bancoId = route.path.split('/')[2] || 
                             (currentUserTipo === 'bancos' ? currentUserId : authStore.profile?.bancoId)

            // Verificación crítica del bancoId
            if (!bancoId) {
                throw new Error("No se encontró el ID del banco padre")
            }

            // Configurar datos del padre según tipo de usuario (todo esto se mantiene igual)
            let padreData = {}
            if (currentUserTipo === 'bancos') {
                if (tipoCuenta.value === 'colectorPrincipal') {
                    padreData = {
                        creadorDirectoId: currentUserId,
                        creadorDirectoTipo: 'banco',
                        bancoId: bancoId
                    }
                } else if (padreSeleccionado.value) {
                    const [tipoPadre, idPadre] = padreSeleccionado.value.split('_')
                    padreData = {
                        creadorDirectoId: idPadre,
                        creadorDirectoTipo: tipoPadre,
                        bancoId: bancoId
                    }
                }
            } else {
                padreData = {
                    creadorDirectoId: currentUserId,
                    creadorDirectoTipo: currentUserTipo,
                    bancoId: bancoId
                }
            }

            // Crear objeto de usuario (todo esto igual)
            const userData = {
                nombre: nombre.value,
                email: email.value,
                tipo: tipoCuenta.value,
                ...padreData
            }

            // Registrar en Firebase (igual)
            const result = await AuthService.register({
                email: email.value,
                password: password.value,
                userData
            })

            if (result.success) {
                Swal.fire("Éxito", "Usuario creado correctamente", "success")
                limpiarCampos()
            } else {
                Swal.fire("Error", result.error, "error")
            }
        } catch (error) {
            console.error("Error en registro:", error)
            Swal.fire("Error", `Error al crear el usuario: ${error.message}`, "error")
        } finally {
            isLoading.value = false
        }
    }

    const limpiarCampos = () => {
        nombre.value = ''
        email.value = ''
        password.value = ''
        tipoCuenta.value = ''
        padreSeleccionado.value = ''
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
    }
}