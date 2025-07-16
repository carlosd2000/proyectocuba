import { defineStore } from 'pinia'
import { 
  auth,
  db
} from '@/firebase/config'
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore'
import authService from '@/firebase/auth'
import WalletService from '@/firebase/walletService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
    wallet: null, // Nuevo estado para almacenar datos de la wallet
    contextoJerarquico: {
      bancoId: null,
      rutaCompleta: []
    }
  }),

  actions: {
    async loadUserProfile() {
      if (!this.user?.email) {
        console.log("No hay usuario autenticado para cargar perfil")
        return null
      }

      try {
        this.loading = true
        this.error = null

        // 1. Autenticación y carga de perfil
        const result = await authService.login(this.user.email, '')
        
        if (result.success) {
          this.profile = result.profile
          
          // 2. Obtener contexto jerárquico
          this.contextoJerarquico = await authService.obtenerContextoJerarquico(
            this.user.uid,
            this.profile.tipo,
            this.profile.bancoId
          )

          // 3. Crear/Actualizar wallet del usuario
          if (this.bancoId) { // Solo si no es admin
            await WalletService.crearOActualizarWallet({
              userId: this.user.uid,
              bancoId: this.bancoId,
              userType: this.profile.tipo
            })

            // 4. Cargar datos de la wallet
            this.wallet = await WalletService.obtenerWallet(
              this.user.uid, 
              this.bancoId
            )
          }
          
          localStorage.setItem('userProfile', JSON.stringify(this.profile))
        }
        return this.profile
      } catch (error) {
        console.error("Error cargando perfil:", error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      try {
        this.loading = true
        this.error = null

        // Validación básica
        if (!email || !password) {
          throw new Error('Email y contraseña son requeridos')
        }

        // 1. Autenticación con Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        const uid = userCredential.user.uid

        // 2. Buscar perfil en Firestore
        // Primero en colección 'bancos'
        const bancoRef = doc(db, 'bancos', uid)
        const bancoSnap = await getDoc(bancoRef)
        
        if (bancoSnap.exists()) {
          this.profile = { 
            ...bancoSnap.data(), 
            tipo: 'bancos',
            bancoId: uid
          }
          this.contextoJerarquico = {
            bancoId: uid,
            rutaCompleta: [uid]
          }

          // Crear/actualizar wallet para banco
          await WalletService.crearOActualizarWallet({
            userId: uid,
            bancoId: uid,
            userType: 'bancos'
          })
          
          localStorage.setItem('userProfile', JSON.stringify(this.profile))
          return { success: true }
        }

        // Si no es banco, buscar en otras colecciones
        const collectionsToCheck = ['admin', 'hora']
        for (const collectionName of collectionsToCheck) {
          const docRef = doc(db, collectionName, uid)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            this.profile = { 
              ...docSnap.data(), 
              tipo: collectionName 
            }
            
            // Obtener contexto jerárquico para no-bancos
            if (collectionName !== 'admin') {
              this.contextoJerarquico = await authService.obtenerContextoJerarquico(
                uid,
                collectionName,
                this.profile.bancoId
              )

              // Crear/actualizar wallet si no es admin
              if (this.bancoId) {
                await WalletService.crearOActualizarWallet({
                  userId: uid,
                  bancoId: this.bancoId,
                  userType: collectionName
                })
              }
            }
            
            localStorage.setItem('userProfile', JSON.stringify(this.profile))
            return { success: true }
          }
        }

        // Si no se encontró en colecciones principales
        // Buscar en subcolecciones de bancos
        const bancosSnapshot = await getDocs(collection(db, 'bancos'))
        for (const bancoDoc of bancosSnapshot.docs) {
          const subcolecciones = ['colectorPrincipal', 'colectores', 'listeros']
          
          for (const subcoleccion of subcolecciones) {
            const docRef = doc(db, `bancos/${bancoDoc.id}/${subcoleccion}/${uid}`)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
              const data = docSnap.data()
              this.profile = { 
                ...data,
                tipo: subcoleccion,
                bancoId: data.bancoId || bancoDoc.id
              }
              
              this.contextoJerarquico = await authService.obtenerContextoJerarquico(
                uid,
                subcoleccion,
                this.profile.bancoId
              )
              
              // Crear/actualizar wallet para usuarios jerárquicos
              await WalletService.crearOActualizarWallet({
                userId: uid,
                bancoId: this.bancoId,
                userType: subcoleccion
              })
              
              localStorage.setItem('userProfile', JSON.stringify(this.profile))
              return { success: true }
            }
          }
        }

        throw new Error('Perfil no encontrado en Firestore')
        
      } catch (error) {
        console.error('Error en login:', error)
        this.error = error.message
        return { 
          success: false, 
          error: error.message,
          errorCode: error.code || 'LOGIN_ERROR' 
        }
      } finally {
        this.loading = false
      }
    },

    async initializeAuthListener() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user && user.email) {
            this.user = user

            // Intentar cargar perfil desde cache
            const cachedProfile = localStorage.getItem('userProfile')
            if (cachedProfile) {
              try {
                this.profile = JSON.parse(cachedProfile)
                this.contextoJerarquico = await authService.obtenerContextoJerarquico(
                  user.uid,
                  this.profile.tipo,
                  this.profile.bancoId
                )

                // Cargar wallet desde cache o servidor
                if (this.bancoId) {
                  this.wallet = await WalletService.obtenerWallet(
                    user.uid,
                    this.bancoId
                  )
                }
              } catch (e) {
                console.error("Error parseando perfil cacheado:", e)
                localStorage.removeItem('userProfile')
              }
            }

            // Cargar perfil fresco si no hay cache o falló
            if (!this.profile) {
              try {
                await this.loadUserProfile()
              } catch (error) {
                console.error("Error actualizando perfil:", error)
              }
            }
          } else {
            this.clearAuth()
          }
          resolve()
        })
      })
    },

    async logout() {
      try {
        await signOut(auth)
        this.clearAuth()
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    clearAuth() {
      this.user = null
      this.profile = null
      this.wallet = null
      this.contextoJerarquico = { bancoId: null, rutaCompleta: [] }
      this.loading = false
      this.error = null
      localStorage.removeItem('userProfile')
    },

    // Nueva acción para actualizar fondos
    async actualizarFondosWallet({ tipo, monto, movimiento }) {
      if (!this.user?.uid || !this.bancoId) {
        throw new Error('Usuario no autenticado o sin banco asociado')
      }

      try {
        const result = await WalletService.actualizarFondos({
          userId: this.user.uid,
          bancoId: this.bancoId,
          tipo,
          monto,
          movimiento
        })

        // Refrescar datos de la wallet
        this.wallet = await WalletService.obtenerWallet(
          this.user.uid,
          this.bancoId
        )

        return result
      } catch (error) {
        console.error('Error actualizando fondos:', error)
        throw error
      }
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    userType: (state) => state.profile?.tipo,
    userId: (state) => state.user?.uid,
    bancoId: (state) => state.contextoJerarquico.bancoId,
    rutaJerarquica: (state) => state.contextoJerarquico.rutaCompleta,
    isLoading: (state) => state.loading,
    currentError: (state) => state.error,
    // Nuevo getter para el fondo recaudado
    fondoRecaudado: (state) => state.wallet?.fondo_recaudado || 0
  }
})