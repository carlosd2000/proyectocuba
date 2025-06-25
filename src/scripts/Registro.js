import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '@/firebase/auth'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
import { db } from '@/firebase/config'
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'

export function useRegistro() {
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
    const creadorId = ref('')
    const tipoCreador = ref('')

    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const showSelect = computed(() => {
        const tipo = authStore.profile?.tipo
        return tipo === 'admin' || tipo === 'bancos' || tipo === 'colectorPrincipal' || tipo === 'colectores'
    })

    onMounted(async () => {
        creadorId.value = route.params.id || ''
        if (route.path.includes('/bancos')) {
            tipoCreador.value = 'banco'
            const unsubscribe = cargarSubordinados()
            return () => {
                if (unsubscribe) unsubscribe()
            }
        }
        else if (route.path.includes('/colectorPrincipal')) {
            tipoCreador.value = 'colectorPrincipal'
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

    const cargarSubordinados = async () => {
        try {
            if (authStore.profile?.tipo === 'bancos' && authStore.user?.uid) {
                // Cargar colectores principales
                const colectoresPrincipalesRef = collection(db, 'bancos', authStore.user.uid, 'colectorPrincipal')
                const unsubscribeColectoresPrincipales = onSnapshot(colectoresPrincipalesRef, (snapshot) => {
                    colectoresPrincipales.value = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                })

                // Cargar colectores normales
                const colectoresRef = collection(db, 'bancos', authStore.user.uid, 'colectores')
                const unsubscribeColectores = onSnapshot(colectoresRef, (snapshot) => {
                    colectores.value = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                })

                return () => {
                    unsubscribeColectoresPrincipales()
                    unsubscribeColectores()
                }
            }
        } catch (error) {
            console.error("Error cargando subordinados:", error)
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
        
        if (authStore.profile?.tipo === 'bancos') {
            if (tipoCuenta.value === 'listeros' && !padreSeleccionado.value) {
                Swal.fire("Error", "Por favor selecciona un padre para el listero", "error")
                return
            }
            if (tipoCuenta.value === 'colectores' && !padreSeleccionado.value) {
                Swal.fire("Error", "Por favor selecciona un padre para el colector", "error")
                return
            }
        }
        
        if (!isValidNombre.value || !isValidPassword.value) {
            Swal.fire("Error", "Por favor completa los campos correctamente", "error")
            return
        }

        try {
            isLoading.value = true
            let padreData = {}
            const currentUserId = authStore.user?.uid
            const currentUserTipo = authStore.profile?.tipo
            const bancoId = authStore.profile?.tipo === 'colectorPrincipal' 
                ? authStore.profile?.creadorId 
                : authStore.user?.uid

            if (currentUserTipo === 'bancos') {
                if (['colectores', 'listeros'].includes(tipoCuenta.value) && padreSeleccionado.value) {
                    const [tipoPadre, idPadre] = padreSeleccionado.value.split('_')
                    padreData = {
                        creadorId: idPadre,
                        tipoCreador: tipoPadre,
                        bancoId: bancoId
                    }
                } else if (tipoCuenta.value === 'colectorPrincipal') {
                    padreData = {
                        creadorId: currentUserId,
                        tipoCreador: 'banco',
                        bancoId: bancoId
                    }
                }
            } 
            else if (currentUserTipo === 'colectorPrincipal') {
                padreData = {
                    creadorId: currentUserId,
                    tipoCreador: 'colectorPrincipal',
                    bancoId: bancoId
                }
            }
            else if (currentUserTipo === 'colectores') {
                padreData = {
                    creadorId: currentUserId,
                    tipoCreador: 'colector',
                    bancoId: bancoId
                }
            }

            const userData = {
                nombre: nombre.value,
                tipo: tipoCuenta.value,
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
        } catch (error) {
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
            console.error("Error al cerrar sesión", error)
            Swal.fire("Error", "No se pudo cerrar sesión", "error")
        }
    }

    // Buscar banco padre y traer info de un listero por su id
    const buscarBancoYDatosListero = async (idBancoPadre, idListero) => {
        try {
            if (!idBancoPadre || !idListero) {
                throw new Error('ID de banco o listero no definido');
            }

            // Buscar banco padre
            const bancoRef = doc(db, 'bancos', idBancoPadre)
            const bancoSnap = await getDoc(bancoRef)
            let bancoData = null
            if (bancoSnap.exists()) {
                bancoData = { id: bancoSnap.id, ...bancoSnap.data() }
            }

            // Buscar listero
            const listeroRef = doc(db, 'listeros', idListero)
            const listeroSnap = await getDoc(listeroRef)
            let listeroData = null
            if (listeroSnap.exists()) {
                listeroData = { id: listeroSnap.id, ...listeroSnap.data() }
            }

            // Unificar datos en una sola variable
            const resultado = {
                banco: bancoData,
                listero: listeroData
            }
            return resultado
        } catch (error) {
            console.error("Error buscando banco y listero:", error)
            return null
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
        buscarBancoYDatosListero,
        authStore
    }
}