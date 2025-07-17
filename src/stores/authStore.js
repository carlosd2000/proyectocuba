import { defineStore } from 'pinia'
import { auth, db } from '@/firebase/config'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import authService from '@/firebase/auth'
import WalletService from '@/firebase/walletService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    profile: JSON.parse(localStorage.getItem('userProfile')) || null,
    wallet: JSON.parse(localStorage.getItem('userWallet')) || null,
    loading: false,
    error: null,
    contextoJerarquico: JSON.parse(localStorage.getItem('jerarquia')) || {
      bancoId: null,
      rutaCompleta: []
    },
    isInitialized: false
  }),

  actions: {
    async loadUserProfile(skipCache = false) {
      if (!this.user?.email) return null

      try {
        this.loading = true
        
        if (!skipCache && this.profile) {
          return this.profile
        }

        try {
          const result = await authService.login(this.user.email, '')
          if (result.success) {
            this.profile = result.profile
            this.contextoJerarquico = await authService.obtenerContextoJerarquico(
              this.user.uid,
              this.profile.tipo,
              this.profile.bancoId
            )

            if (this.bancoId) {
              await WalletService.crearOActualizarWallet({
                userId: this.user.uid,
                bancoId: this.bancoId,
                userType: this.profile.tipo
              })
              this.wallet = await WalletService.obtenerWallet(this.user.uid, this.bancoId)
            }

            this.persistToCache()
          }
        } catch (onlineError) {
          console.log("Modo offline, usando datos cacheados", onlineError)
          if (!this.profile) throw onlineError
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

    persistToCache() {
      if (this.user) localStorage.setItem('user', JSON.stringify(this.user))
      if (this.profile) localStorage.setItem('userProfile', JSON.stringify(this.profile))
      if (this.contextoJerarquico) localStorage.setItem('jerarquia', JSON.stringify(this.contextoJerarquico))
      if (this.wallet) localStorage.setItem('userWallet', JSON.stringify(this.wallet))
    },

    async initializeAuthListener() {
      if (this.isInitialized) return
      this.isInitialized = true

      if (this.user && this.profile) {
        console.log("Usuario autenticado desde caché")
        return
      }

      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user
            await this.loadUserProfile()
          } else {
            this.clearAuth()
          }
          resolve()
        }, (error) => {
          console.error("Error en auth listener:", error)
          resolve()
        })
      })
    },

    async login(email, password) {
      try {
        this.loading = true
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        await this.loadUserProfile(true)
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
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
      localStorage.removeItem('user')
      localStorage.removeItem('userProfile')
      localStorage.removeItem('jerarquia')
      localStorage.removeItem('userWallet')
    },

    async actualizarFondos({ tipo, monto, movimiento }) {
      if (!this.user?.uid || !this.bancoId) return
      
      try {
        await WalletService.actualizarFondos({
          userId: this.user.uid,
          bancoId: this.bancoId,
          tipo,
          monto,
          movimiento
        })
        
        this.wallet = await WalletService.obtenerWallet(this.user.uid, this.bancoId)
        this.persistToCache()
      } catch (error) {
        console.error("Error actualizando fondos:", error)
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
    fondoRecaudado: (state) => state.wallet?.fondo_recaudado || 0
  }
})