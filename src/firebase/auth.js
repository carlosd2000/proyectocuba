import { auth, db } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'

export const AuthService = {
  // Capitaliza el nombre del usuario
  capitalizeUsername(username) {
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
  },

  // Verificar si el nombre ya está en uso en cualquiera de las colecciones
  async isUsernameTaken(username) {
    try {
      const nombre = this.capitalizeUsername(username)
      const tipos = ['listeros', 'colectores', 'bancos']

      for (const tipo of tipos) {
        const ref = collection(db, tipo)
        const q = query(ref, where('nombre', '==', nombre))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error verificando nombre de usuario:', error)
      throw error
    }
  },

  // Verificar si el correo ya está en uso en cualquiera de las colecciones
  async isEmailTaken(email) {
    try {
      const tipos = ['listeros', 'colectores', 'bancos']

      for (const tipo of tipos) {
        const ref = collection(db, tipo)
        const q = query(ref, where('email', '==', email))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error verificando correo electrónico:', error)
      throw error
    }
  },

  // Registro de usuario
  async register({ email, password, userData }) {
    try {
      const capitalizedName = this.capitalizeUsername(userData.nombre)

      // Verificar duplicado por nombre
      const isNameTaken = await this.isUsernameTaken(userData.nombre)
      if (isNameTaken) {
        return {
          success: false,
          error: 'Este nombre de usuario ya está en uso',
          code: 'name-already-in-use'
        }
      }

      // Verificar duplicado por correo
      const isEmailTaken = await this.isEmailTaken(email)
      if (isEmailTaken) {
        return {
          success: false,
          error: 'Este correo ya está vinculado a otra cuenta',
          code: 'email-already-used-custom'
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      await this.createUserProfile(userCredential.user.uid, {
        ...userData,
        nombre: capitalizedName,
        email
      })

      return {
        user: userCredential.user,
        success: true
      }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  // Login
  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      const userId = userCredential.user.uid
      const userProfile = await this.getUserProfile(userId)

      return {
        user: userCredential.user,
        profile: userProfile,
        success: true
      }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  // Cerrar sesión
  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  // Crear perfil en la colección correspondiente
  async createUserProfile(userId, userData) {
    try {
      if (!userData.tipo) {
        throw new Error("Debe seleccionarse un tipo de cuenta (bancos, colectores o listeros)")
      }

      const collectionName = userData.tipo

      await setDoc(doc(db, collectionName, userId), {
        ...userData,
        createdAt: new Date().toISOString()
      })

      return { success: true }
    } catch (error) {
      console.error('Error creando perfil de usuario:', error)
      throw error
    }
  },

  // Obtener perfil de usuario desde cualquier colección
  async getUserProfile(userId) {
    try {
      const tipos = ['listeros', 'colectores', 'bancos']

      for (const tipo of tipos) {
        const docRef = doc(db, tipo, userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return docSnap.data()
        }
      }

      return null
    } catch (error) {
      console.error('Error obteniendo perfil del usuario:', error)
      throw error
    }
  },

  // Manejo de errores de autenticación
  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'name-already-in-use': 'Este nombre de usuario ya está en uso',
      'email-already-used-custom': 'Este correo ya está vinculado a otra cuenta'
    }

    return {
      success: false,
      error: errorMessages[error.code] || error.message || 'Error en la autenticación',
      code: error.code || 'unknown'
    }
  }
}
