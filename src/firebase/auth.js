import { auth, db } from './config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export const AuthService = {
  capitalizeUsername(username) {
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
  },

  async isUsernameTaken(nombre) {
    try {
      const capitalizedNombre = this.capitalizeUsername(nombre)
      const tiposRaiz = ['admin', 'bancos']
      const subcolecciones = [
        { padre: 'bancos', hijo: 'colectorPrincipal' },
        { padre: 'bancos', hijo: 'colectores' },
        { padre: 'bancos', hijo: 'listeros' },
        { padre: 'colectorPrincipal', hijo: 'colectores' },
        { padre: 'colectorPrincipal', hijo: 'listeros' },
        { padre: 'colectores', hijo: 'listeros' }
      ]

      for (const tipo of tiposRaiz) {
        const ref = collection(db, tipo)
        const q = query(ref, where('nombre', '==', capitalizedNombre))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) return true
      }

      for (const path of subcolecciones) {
        const padresSnapshot = await getDocs(collection(db, path.padre))
        for (const padreDoc of padresSnapshot.docs) {
          const refSub = collection(db, `${path.padre}/${padreDoc.id}/${path.hijo}`)
          const qSub = query(refSub, where('nombre', '==', capitalizedNombre))
          const subSnapshot = await getDocs(qSub)
          if (!subSnapshot.empty) return true
        }
      }

      return false
    } catch (error) {
      console.error('Error verificando nombre:', error)
      throw error
    }
  },

  async isEmailTaken(email) {
    try {
      const tiposRaiz = ['admin', 'bancos']
      const subcolecciones = [
        { padre: 'bancos', hijo: 'colectorPrincipal' },
        { padre: 'bancos', hijo: 'colectores' },
        { padre: 'bancos', hijo: 'listeros' },
        { padre: 'colectorPrincipal', hijo: 'colectores' },
        { padre: 'colectorPrincipal', hijo: 'listeros' },
        { padre: 'colectores', hijo: 'listeros' }
      ]

      for (const tipo of tiposRaiz) {
        const ref = collection(db, tipo)
        const q = query(ref, where('email', '==', email))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) return true
      }

      for (const path of subcolecciones) {
        const padresSnapshot = await getDocs(collection(db, path.padre))
        for (const padreDoc of padresSnapshot.docs) {
          const refSub = collection(db, `${path.padre}/${padreDoc.id}/${path.hijo}`)
          const qSub = query(refSub, where('email', '==', email))
          const subSnapshot = await getDocs(qSub)
          if (!subSnapshot.empty) return true
        }
      }

      return false
    } catch (error) {
      console.error('Error verificando email:', error)
      throw error
    }
  },

  async register({ email, password, userData }) {
    try {
      const capitalizedName = this.capitalizeUsername(userData.nombre)

      if (await this.isUsernameTaken(userData.nombre)) {
        return { success: false, error: 'Este nombre de usuario ya está en uso', code: 'name-already-in-use' }
      }
      if (await this.isEmailTaken(email)) {
        return { success: false, error: 'Este correo ya está vinculado a otra cuenta', code: 'email-already-used-custom' }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUserId = userCredential.user.uid

      const userProfileData = {
        ...userData,
        nombre: capitalizedName,
        email,
        uid: newUserId,
        wallet: 0, // Campo wallet para todos los usuarios
        createdAt: new Date().toISOString()
      }

      await this.createUserProfile(newUserId, userProfileData)

      return { user: userCredential.user, success: true }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userProfile = await this.getUserProfile(userCredential.user.uid)

      return { user: userCredential.user, profile: userProfile, success: true }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  async createUserProfile(userId, userData) {
    try {
      const tipo = userData.tipo
      const bancoId = userData.bancoId

      // Base de datos para todos los tipos de usuario
      const baseProfileData = {
        ...userData,
        wallet: 0 // Aseguramos que wallet esté presente
      }

      if (tipo === 'admin' || tipo === 'bancos') {
        await setDoc(doc(db, tipo, userId), baseProfileData)
      } 
      else if (tipo === 'colectorPrincipal') {
        if (!userData.creadorDirectoId || !userData.creadorDirectoTipo || !bancoId) {
          throw new Error("Falta información para colectorPrincipal")
        }
        await setDoc(doc(db, `bancos/${bancoId}/colectorPrincipal/${userId}`), baseProfileData)
      }
      else if (tipo === 'colectores') {
        if (!userData.creadorDirectoId || !userData.creadorDirectoTipo || !bancoId) {
          throw new Error("Falta información para colectores")
        }
        await setDoc(doc(db, `bancos/${bancoId}/colectores/${userId}`), baseProfileData)
      } 
      else if (tipo === 'listeros') {
        if (!userData.creadorDirectoId || !userData.creadorDirectoTipo || !bancoId) {
          throw new Error("Falta información para listeros")
        }
        await setDoc(doc(db, `bancos/${bancoId}/listeros/${userId}`), baseProfileData)
      } 
      else {
        throw new Error("Tipo de usuario inválido")
      }

      return { success: true }
    } catch (error) {
      console.error('Error creando perfil:', error)
      throw error
    }
  },

  async getUserProfile(userId) {
    try {
      // Buscar en colecciones raíz (admin/bancos)
      const tiposRaiz = ['admin', 'bancos']
      for (const tipo of tiposRaiz) {
        const docRef = doc(db, tipo, userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { ...docSnap.data(), tipo }
        }
      }

      // Buscar en subcolecciones de bancos
      const bancosSnapshot = await getDocs(collection(db, 'bancos'))
      for (const bancoDoc of bancosSnapshot.docs) {
        const bancoId = bancoDoc.id
        const subcolecciones = ['colectorPrincipal', 'colectores', 'listeros']

        for (const subcoleccion of subcolecciones) {
          const docRef = doc(db, `bancos/${bancoId}/${subcoleccion}/${userId}`)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            return { ...docSnap.data(), tipo: subcoleccion }
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      throw error
    }
  },

  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Contraseña inválida o correo incorrecto',
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