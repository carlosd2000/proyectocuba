import { defineStore } from 'pinia'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { AuthService } from '@/firebase/auth' // Importa solo AuthService

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
      if (this.user && !this.profile) {
        try {
          this.loading = true
          this.profile = await AuthService.getUserProfile(this.user.uid)
          
          // Actualización: Usa AuthService.JerarquiaService
          if (this.profile) {
            this.contextoJerarquico = await AuthService.JerarquiaService.obtenerContexto(
              this.user.uid,
              this.profile.tipo,
              this.profile.bancoId
            )
            localStorage.setItem('userProfile', JSON.stringify(this.profile))
          }

          return this.profile
        } catch (error) {
          console.error("Error cargando perfil:", error)
          throw error
        } finally {
          this.loading = false
        }
      }
      return this.profile
    },

    async login(email, password) {
      try {
        this.loading = true
        this.error = null

        const result = await AuthService.login({ email, password })
        if (!result.success) throw new Error(result.error)

        this.user = result.user
        this.profile = result.profile

        if (result.profile) {
          // Accede a JerarquiaService a través de AuthService
          this.contextoJerarquico = await AuthService.JerarquiaService.obtenerContexto(
            result.user.uid,
            result.profile.tipo,
            result.profile.bancoId
          )
          localStorage.setItem('userProfile', JSON.stringify(result.profile))
        }

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // ... (mantén igual initializeAuthListener, logout y clearAuth)
    async initializeAuthListener() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user

            const cachedProfile = localStorage.getItem('userProfile')
            if (cachedProfile) {
              this.profile = JSON.parse(cachedProfile)
              // Actualiza contexto desde cache
              this.contextoJerarquico = await AuthService.JerarquiaService.obtenerContexto(
                user.uid,
                this.profile.tipo,
                this.profile.bancoId
              )
            }

            try {
              await this.loadUserProfile()
            } catch (error) {
              console.error("Error actualizando perfil:", error)
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
        await AuthService.logout()
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
    rutaJerarquica: (state) => state.contextoJerarquico.rutaCompleta
  }
})