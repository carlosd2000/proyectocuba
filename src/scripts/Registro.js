import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '@/firebase/auth'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
import { db } from '@/firebase/config' // Asegúrate de importar tu instancia de Firebase
import { collection, onSnapshot } from 'firebase/firestore'

export function useRegistro() {
    const nombre = ref('')
    const email = ref('')
    const password = ref('')
    const tipoCuenta = ref('')
    const padreSeleccionado = ref('')
    const colectores = ref([])
    const mensajeNombre = ref('')
    const isValidNombre = ref(false)
    const mensajePassword = ref('')
    const isValidPassword = ref(false)
    const isLoading = ref(false)
    const creadorId = ref('')
    const tipoCreador = ref('')

    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const showSelect = computed(() => {
        const tipo = authStore.profile?.tipo
        return tipo === 'admin' || tipo === 'bancos' || tipo === 'colectores'
    })

    onMounted(() => {
        creadorId.value = route.params.id || ''
        if (route.path.includes('/bancos')) {
            tipoCreador.value = 'banco'
            const unsubscribe = cargarColectores()
            return () => {
                if (unsubscribe) unsubscribe()
            }
        }
        else if (route.path.includes('/colectores')) {
            tipoCreador.value = 'colector'
        }
    })

    const validateNombre = () => {
        const regex = /^[a-zA-Z0-9]{3,15}$/
        if (!nombre.value) {
        mensajeNombre.value = ''
        isValidNombre.value = false
        return
        }
        if (!regex.test(nombre.value)) {
        mensajeNombre.value = 'El nombre debe tener entre 3 y 15 caracteres, solo letras y números'
        isValidNombre.value = false
        } else {
        mensajeNombre.value = 'Nombre válido'
        isValidNombre.value = true
        }
    }

    const validatePassword = () => {
        if (!password.value) {
        mensajePassword.value = ''
        isValidPassword.value = false
        return
        }
        if (password.value.length < 6) {
        mensajePassword.value = 'La contraseña debe tener al menos 6 caracteres'
        isValidPassword.value = false
        } else {
        mensajePassword.value = 'Contraseña válida'
        isValidPassword.value = true
        }
    }

    const cargarColectores = async () => {
        try {
            if (authStore.profile?.tipo === 'bancos' && authStore.user?.uid) {
                const colectoresRef = collection(db, 'bancos', authStore.user.uid, 'colectores')
                const unsubscribe = onSnapshot(colectoresRef, (querySnapshot) => {
                    colectores.value = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    console.log('Colectores actualizados:', colectores.value)
                })
                return unsubscribe
            }
        } catch (error) {
            console.error("Error cargando colectores:", error)
        }
    }

    const registrarUsuario = async () => {
        if (!showSelect.value) {
            Swal.fire("Error", "No tienes permisos para crear cuentas", "error")
            return
        }
        if (!nombre.value || !email.value || !password.value || !tipoCuenta.value) {
            Swal.fire("Error", "Por favor llena todos los campos", "error")
            return
        }
        if (tipoCuenta.value === 'listeros' && !padreSeleccionado.value) {
            Swal.fire("Error", "Por favor selecciona un padre", "error")
            return
        }
        if (!isValidNombre.value || !isValidPassword.value) {
            Swal.fire("Error", "Por favor completa los campos correctamente", "error")
            return
        }
        try {
            isLoading.value = true

            let padreData = {}
            if (tipoCuenta.value === 'listeros' && padreSeleccionado.value) {
                const [tipoPadre, idPadre] = padreSeleccionado.value.split('_')
                padreData = {
                    padreTipo: tipoPadre,
                    padreId: idPadre
                }
                
                // Si el padre es un colector, también guardamos el ID del banco
                if (tipoPadre === 'colector') {
                    padreData.bancoId = authStore.user?.uid
                }
            }

            const userData = {
                nombre: nombre.value,
                tipo: tipoCuenta.value,
                creadorId: creadorId.value,
                tipoCreador: tipoCreador.value,
                // Agrega el padre seleccionado si es banco
                ...padreData
            }
            const result = await AuthService.register({
                email: email.value,
                password: password.value,
                userData
            })
            if (result.success) {
                Swal.fire("Creación exitosa", "Usuario creado correctamente", "success")
                limpiarCampos()
            } else {
                Swal.fire("Error", result.error, "error")
            }
        } 
        catch (error) {
            console.error("Error en registro:", error)
            Swal.fire("Error", "No se pudo crear el usuario", "error")
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
        console.error("Error al cerrar sesión", error)
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