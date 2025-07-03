import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '@/firebase/auth'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
import { db } from '@/firebase/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

export function useRegistro() {
    // Estados reactivos
    const nombre = ref('')
    const email = ref('')
    const password = ref('')
    const tipoCuenta = ref('')
    const padreSeleccionado = ref('')
    const colectores = ref([])
    const colectoresPrincipales = ref([])
    const listeros = ref([])
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

    const tiposPermitidos = computed(() => {
        const tipoUsuario = authStore.profile?.tipo
        switch (tipoUsuario) {
            case 'admin':
                return ['bancos', 'colectorPrincipal', 'colectores', 'listeros']
            case 'bancos':
                return ['colectorPrincipal', 'colectores', 'listeros']
            case 'colectorPrincipal':
                return ['colectores', 'listeros']
            case 'colectores':
                return ['listeros']
            default:
                return []
        }
    })

    // Hooks
    onMounted(() => {
        if (['bancos', 'colectorPrincipal', 'colectores'].includes(authStore.profile?.tipo)) {
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
            const tipoUsuario = authStore.profile?.tipo
            const bancoId = authStore.contextoJerarquico.bancoId
            
            if (tipoUsuario === 'bancos' && bancoId) {
                // Cargar Colectores Principales para bancos
                const cpUnsubscribe = onSnapshot(
                    collection(db, 'bancos', bancoId, 'colectorPrincipal'),
                    (snapshot) => {
                        colectoresPrincipales.value = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                    }
                )

                // Cargar Colectores para bancos
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
            } else if (tipoUsuario === 'colectorPrincipal' && bancoId) {
                // Cargar solo los colectores de este CP
                const q = query(
                    collection(db, 'bancos', bancoId, 'colectores'),
                    where('creadorDirectoId', '==', authStore.user.uid)
                )
                
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    colectores.value = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                })
                
                return unsubscribe
            } else if (tipoUsuario === 'colectores' && bancoId) {
                // Cargar listeros para este colector
                const q = query(
                    collection(db, 'bancos', bancoId, 'listeros'),
                    where('creadorDirectoId', '==', authStore.user.uid)
                )
                
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    listeros.value = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                })
                
                return unsubscribe
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

        if (!tiposPermitidos.value.includes(tipoCuenta.value)) {
            Swal.fire("Error", "No tienes permiso para crear este tipo de cuenta", "error")
            return
        }

        try {
            isLoading.value = true
            const currentUserId = authStore.user?.uid
            const currentUserTipo = authStore.profile?.tipo
            const bancoId = authStore.contextoJerarquico.bancoId

            // Validar bancoId para roles que lo requieren
            if (['colectorPrincipal', 'colectores', 'listeros'].includes(currentUserTipo) && !bancoId) {
                throw new Error("No se pudo determinar el banco padre")
            }

            // Configuración automática para ColectorPrincipal
            let padreData = {}
            if (currentUserTipo === 'colectorPrincipal') {
                if (tipoCuenta.value === 'colectores') {
                    // ColectorPrincipal creando Colector (asignación automática)
                    padreData = {
                        creadorDirectoId: currentUserId,
                        creadorDirectoTipo: 'colectorPrincipal',
                        bancoId: bancoId
                    }
                } else if (tipoCuenta.value === 'listeros') {
                    // ColectorPrincipal creando Listero (puede elegir padre)
                    if (!padreSeleccionado.value) {
                        // Por defecto el CP es el padre
                        padreData = {
                            creadorDirectoId: currentUserId,
                            creadorDirectoTipo: 'colectorPrincipal',
                            bancoId: bancoId
                        }
                    } else {
                        // O puede asignar un Colector como padre
                        const [tipoPadre, idPadre] = padreSeleccionado.value.split('_')
                        padreData = {
                            creadorDirectoId: idPadre,
                            creadorDirectoTipo: tipoPadre,
                            bancoId: bancoId
                        }
                    }
                }
            } 
            // Configuración para Colectores
            else if (currentUserTipo === 'colectores') {
                if (tipoCuenta.value === 'listeros') {
                    // Colector creando Listero (asignación automática)
                    padreData = {
                        creadorDirectoId: currentUserId,
                        creadorDirectoTipo: 'colectores',
                        bancoId: bancoId
                    }
                } else {
                    Swal.fire("Error", "Solo puedes crear listeros", "error")
                    return
                }
            }
            // Configuración para Bancos
            else if (currentUserTipo === 'bancos') {
                if (tipoCuenta.value === 'colectorPrincipal') {
                    padreData = {
                        creadorDirectoId: currentUserId,
                        creadorDirectoTipo: 'banco',
                        bancoId: currentUserId
                    }
                } else if (['colectores', 'listeros'].includes(tipoCuenta.value) && !padreSeleccionado.value) {
                    Swal.fire("Error", `Selecciona un padre para el ${tipoCuenta.value}`, "error")
                    return
                } else if (padreSeleccionado.value) {
                    const [tipoPadre, idPadre] = padreSeleccionado.value.split('_')
                    padreData = {
                        creadorDirectoId: idPadre,
                        creadorDirectoTipo: tipoPadre,
                        bancoId: bancoId
                    }
                }
            }
            // Configuración para Admin
            else if (currentUserTipo === 'admin') {
                padreData = {
                    creadorDirectoId: currentUserId,
                    creadorDirectoTipo: 'admin',
                    bancoId: tipoCuenta.value === 'bancos' ? null : bancoId
                }
            }

            const userData = {
                nombre: nombre.value,
                email: email.value,
                tipo: tipoCuenta.value,
                ...padreData
            }

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
        listeros,
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