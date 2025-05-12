import { defineStore } from 'pinia';
import { auth } from '@/firebase/config';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { AuthService } from '@/firebase/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    tipo: null,
    loading: false,
    error: null
  }),

  actions: {
    // Método para cargar el perfil (reemplaza loadProfile)
    async loadUserProfile() {
      if (this.user && !this.profile) {
        try {
          this.loading = true;
          this.profile = await AuthService.getUserProfile(this.user.uid);
          
          // Guardar en localStorage para persistencia
          if (this.profile) {
            localStorage.setItem('userProfile', JSON.stringify(this.profile));
          }
          
          return this.profile;
        } catch (error) {
          console.error("Error cargando perfil:", error);
          throw error;
        } finally {
          this.loading = false;
        }
      }
      return this.profile;
    },

    // Método de login
    async login(email, password) {
      try {
        this.loading = true;
        this.error = null;
        
        const result = await AuthService.login({ email, password });
        if (!result.success) throw new Error(result.error);
        
        this.user = result.user;
        this.profile = result.profile;
        
        // Guardar en localStorage
        if (result.profile) {
          localStorage.setItem('userProfile', JSON.stringify(result.profile));
        }
        
        return { success: true };
      } catch (error) {
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    // Listener de autenticación
    async initializeAuthListener() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user;
            // Intentar cargar de cache primero
            const cachedProfile = localStorage.getItem('userProfile');
            if (cachedProfile) {
              this.profile = JSON.parse(cachedProfile);
            }
            // Luego actualizar desde Firestore
            try {
              await this.loadUserProfile();
            } catch (error) {
              console.error("Error actualizando perfil:", error);
            }
          } else {
            this.user = null;
            this.profile = null;
            localStorage.removeItem('userProfile');
          }
          resolve();
        });
      });
    },

    // Método de logout
    async logout() {
      try {
        await AuthService.logout();
        this.clearAuth();
        return { success: true };
      } catch (error) {
        this.error = error.message;
        return { success: false, error: error.message };
      }
    },

    // Limpiar autenticación
    clearAuth() {
      this.user = null;
      this.profile = null;
      this.error = null;
      localStorage.removeItem('userProfile');
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    userType: (state) => state.profile?.tipo,
    userId: (state) => state.user?.uid
  }
});