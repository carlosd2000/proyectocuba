import { auth, db } from './config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'

// ==================== JERARQUIA SERVICE ====================
const JerarquiaService = {
  async obtenerContexto(usuarioId, tipoUsuario, bancoIdFromProfile = null) {
    const contexto = { 
      bancoId: null, 
      rutaCompleta: [] 
    }

    try {
      switch (tipoUsuario) {
        case 'admin':
          contexto.bancoId = null
          break

        case 'bancos':
          contexto.bancoId = usuarioId
          contexto.rutaCompleta = [usuarioId]
          break

        case 'colectorPrincipal':
          contexto.bancoId = bancoIdFromProfile || await this._obtenerBancoPadre(usuarioId, 'colectorPrincipal')
          if (contexto.bancoId) {
            contexto.rutaCompleta = [contexto.bancoId, usuarioId]
          }
          break

        case 'colectores':
          contexto.bancoId = bancoIdFromProfile || await this._obtenerBancoPadre(usuarioId, 'colectores')
          if (contexto.bancoId) {
            const colectorPrincipalId = await this._obtenerPadreDirecto(usuarioId, 'colectores')
            contexto.rutaCompleta = [
              contexto.bancoId, 
              colectorPrincipalId, 
              usuarioId
            ].filter(Boolean)
          }
          break

        case 'listeros':
          contexto.bancoId = bancoIdFromProfile || await this._obtenerBancoPadre(usuarioId, 'listeros')
          if (contexto.bancoId) {
            const colectorId = await this._obtenerPadreDirecto(usuarioId, 'listeros')
            contexto.rutaCompleta = [
              contexto.bancoId, 
              colectorId, 
              usuarioId
            ].filter(Boolean)
          }
          break
      }
    } catch (error) {
      console.error("Error obteniendo contexto jerárquico:", error)
    }

    return contexto
  },

  async _obtenerBancoPadre(usuarioId, tipoUsuario) {
    const tiposPadre = {
      colectorPrincipal: 'bancos',
      colectores: 'colectorPrincipal',
      listeros: 'colectores'
    }

    try {
      const padreTipo = tiposPadre[tipoUsuario]
      const bancosSnapshot = await getDocs(collection(db, 'bancos'))

      for (const bancoDoc of bancosSnapshot.docs) {
        // Buscar en la subcolección correspondiente
        const subcoleccionPath = `bancos/${bancoDoc.id}/${padreTipo === 'colectorPrincipal' ? 'colectorPrincipal' : 'colectores'}`
        const userDocRef = doc(db, subcoleccionPath, usuarioId)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
          return bancoDoc.id
        }

        // Buscar también en la colección de listeros por si acaso
        if (tipoUsuario === 'listeros') {
          const listerosPath = `bancos/${bancoDoc.id}/listeros`
          const listeroDocRef = doc(db, listerosPath, usuarioId)
          const listeroDocSnap = await getDoc(listeroDocRef)
          if (listeroDocSnap.exists()) {
            return bancoDoc.id
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error obteniendo banco padre:", error)
      return null
    }
  },

  async _obtenerPadreDirecto(usuarioId, tipoUsuario) {
    const tiposPadre = {
      colectores: 'colectorPrincipal',
      listeros: 'colectores'
    }

    try {
      const padreTipo = tiposPadre[tipoUsuario]
      const q = query(
        collection(db, 'bancos'),
        where(`${padreTipo}.${usuarioId}`, '!=', null)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.empty ? null : querySnapshot.docs[0].id
    } catch (error) {
      console.error("Error obteniendo padre directo:", error)
      return null
    }
  }
}

// ==================== AUTH SERVICE ====================
const AuthService = {
  JerarquiaService,

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

      // Verificar en colecciones raíz
      for (const tipo of tiposRaiz) {
        const ref = collection(db, tipo)
        const q = query(ref, where('nombre', '==', capitalizedNombre))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) return true
      }

      // Verificar en subcolecciones
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
        return { 
          success: false, 
          error: 'Este nombre de usuario ya está en uso', 
          code: 'name-already-in-use' 
        }
      }

      if (await this.isEmailTaken(email)) {
        return { 
          success: false, 
          error: 'Este correo ya está vinculado a otra cuenta', 
          code: 'email-already-used-custom' 
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUserId = userCredential.user.uid

      const userProfileData = {
        ...userData,
        nombre: capitalizedName,
        email,
        uid: newUserId,
        wallet: 0,
        createdAt: new Date().toISOString()
      }

      await this.createUserProfile(newUserId, userProfileData)

      return { 
        user: userCredential.user, 
        success: true 
      }
    } catch (error) {
      return this.handleAuthError(error)
    }
  },

  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userProfile = await this.getUserProfile(userCredential.user.uid)
      
      if (userProfile) {
        const contexto = await JerarquiaService.obtenerContexto(
          userCredential.user.uid,
          userProfile.tipo,
          userProfile.bancoId
        )
        userProfile.bancoId = contexto.bancoId
        userProfile.rutaJerarquica = contexto.rutaCompleta
      }

      return { 
        user: userCredential.user, 
        profile: userProfile, 
        success: true 
      }
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

      const baseProfileData = {
        ...userData,
        wallet: 0
      }

      if (tipo === 'admin' || tipo === 'bancos') {
        await setDoc(doc(db, tipo, userId), baseProfileData)
      } 
      else if (tipo === 'colectorPrincipal') {
        if (!bancoId) throw new Error("Falta bancoId para colectorPrincipal")
        await setDoc(doc(db, `bancos/${bancoId}/colectorPrincipal/${userId}`), baseProfileData)
      }
      else if (tipo === 'colectores') {
        if (!bancoId) throw new Error("Falta bancoId para colectores")
        await setDoc(doc(db, `bancos/${bancoId}/colectores/${userId}`), baseProfileData)
      } 
      else if (tipo === 'listeros') {
        if (!bancoId) throw new Error("Falta bancoId para listeros")
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
      // 1. Buscar en colecciones raíz
      const tiposRaiz = ['admin', 'bancos']
      for (const tipo of tiposRaiz) {
        const docRef = doc(db, tipo, userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { ...docSnap.data(), tipo }
        }
      }

      // 2. Buscar en subcolecciones de bancos
      const bancosSnapshot = await getDocs(collection(db, 'bancos'))
      for (const bancoDoc of bancosSnapshot.docs) {
        const subcolecciones = ['colectorPrincipal', 'colectores', 'listeros']
        
        for (const subcoleccion of subcolecciones) {
          const docRef = doc(db, `bancos/${bancoDoc.id}/${subcoleccion}/${userId}`)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            return { 
              ...data,
              tipo: subcoleccion,
              bancoId: data.bancoId || bancoDoc.id
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      throw error
    }
  },

  //MODIFICADO ===========================
  // NUEVO: Actualizar el campo wallet del usuario
  async updateUserWallet(userId, bancoId, tipo, nuevoWallet) {
    try {
      let docRef = null
      if (tipo === 'admin' || tipo === 'bancos') {
        docRef = doc(db, tipo, userId)
      } else if (tipo === 'colectorPrincipal') {
        docRef = doc(db, `bancos/${bancoId}/colectorPrincipal/${userId}`)
      } else if (tipo === 'colectores') {
        docRef = doc(db, `bancos/${bancoId}/colectores/${userId}`)
      } else if (tipo === 'listeros') {
        docRef = doc(db, `bancos/${bancoId}/listeros/${userId}`)
      } else {
        throw new Error('Tipo de usuario inválido')
      }
      await updateDoc(docRef, { wallet: nuevoWallet })
      return { success: true }
    } catch (error) {
      console.error('Error actualizando wallet:', error)
      return { success: false, error }
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

// Exportación unificada
export { 
  AuthService,
  JerarquiaService 
}