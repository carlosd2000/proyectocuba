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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
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

        // Usamos el email del usuario ya autenticado
        const result = await authService.login(this.user.email, '')
        
        if (result.success) {
          this.profile = result.profile
          
          // Obtener contexto jerárquico
          this.contextoJerarquico = await authService.obtenerContextoJerarquico(
            this.user.uid,
            this.profile.tipo,
            this.profile.bancoId
          )
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
      this.contextoJerarquico = { bancoId: null, rutaCompleta: [] }
      this.loading = false
      this.error = null
      localStorage.removeItem('userProfile')
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    userType: (state) => state.profile?.tipo,
    userId: (state) => state.user?.uid,
    bancoId: (state) => state.contextoJerarquico.bancoId,
    rutaJerarquica: (state) => state.contextoJerarquico.rutaCompleta,
    isLoading: (state) => state.loading,
    currentError: (state) => state.error
  }
})