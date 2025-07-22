import { auth, db } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore'

// ==================== FUNCIONES PRIVADAS ====================

const _obtenerBancoPadre = async (usuarioId, tipoUsuario) => {
  const tiposPadre = {
    colectorPrincipal: 'bancos',
    colectores: 'colectorPrincipal',
    listeros: 'colectores'
  }

  try {
    const padreTipo = tiposPadre[tipoUsuario]
    const bancosSnapshot = await getDocs(collection(db, 'bancos'))

    for (const bancoDoc of bancosSnapshot.docs) {
      const subcoleccionPath = `bancos/${bancoDoc.id}/${padreTipo === 'colectorPrincipal' ? 'colectorPrincipal' : 'colectores'}`
      const userDocRef = doc(db, subcoleccionPath, usuarioId)
      const docSnap = await getDoc(userDocRef)

      if (docSnap.exists()) {
        return bancoDoc.id
      }

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
}

const _obtenerPadreDirecto = async (usuarioId, tipoUsuario) => {
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

// ==================== FUNCIONES PÚBLICAS ====================

export const registrarUsuarioJerarquico = async ({
  email,
  password,
  nombre,
  tipo,
  bancoId,
  creadorDirectoId,
  creadorDirectoTipo
}) => {
  try {
    const tiposPermitidos = ['admin', 'bancos', 'colectorPrincipal', 'colectores', 'listeros']
    if (!tiposPermitidos.includes(tipo)) {
      throw new Error('Tipo de usuario no válido')
    }

    if (tipo !== 'admin' && tipo !== 'bancos' && !bancoId) {
      throw new Error(`Se requiere bancoId para tipo ${tipo}`)
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    let docRef
    if (tipo === 'admin' || tipo === 'bancos') {
      docRef = doc(db, tipo, uid)
    } else {
      const subcoleccion = tipo === 'colectorPrincipal' 
        ? 'colectorPrincipal' 
        : tipo === 'colectores' 
        ? 'colectores' 
        : 'listeros'
      docRef = doc(db, `bancos/${bancoId}/${subcoleccion}/${uid}`)
    }

    const perfil = {
      uid,
      email,
      nombre,
      tipo,
      bancoId: tipo === 'bancos' ? uid : bancoId,
      creadorDirectoId: creadorDirectoId || null,
      creadorDirectoTipo: creadorDirectoTipo || null,
      fondo: 0,
      createdAt: serverTimestamp()
    }

    await setDoc(docRef, perfil)

    return { 
      success: true, 
      uid, 
      perfil,
      user: userCredential.user 
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error.message)
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code || 'REGISTER_ERROR' 
    }
  }
}

export const login = async (email, password) => {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Email es requerido',
        errorCode: 'auth/missing-email'
      }
    }

    let userCredential
    if (password) {
      userCredential = await signInWithEmailAndPassword(auth, email, password)
    } else {
      if (!auth.currentUser) throw new Error('No hay usuario autenticado')
      userCredential = { user: auth.currentUser }
    }

    const uid = userCredential.user.uid

    // 1. Buscar en bancos
    const bancoRef = doc(db, 'bancos', uid)
    const bancoSnap = await getDoc(bancoRef)
    if (bancoSnap.exists()) {
      return {
        success: true,
        user: userCredential.user,
        profile: { 
          ...bancoSnap.data(), 
          tipo: 'bancos',
          bancoId: uid
        }
      }
    }

    // 2. Buscar en otras colecciones
    const collectionsToCheck = ['admin']
    for (const collectionName of collectionsToCheck) {
      const docRef = doc(db, collectionName, uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return {
          success: true,
          user: userCredential.user,
          profile: { 
            ...docSnap.data(), 
            tipo: collectionName 
          }
        }
      }
    }

    // 3. Buscar en subcolecciones
    const bancosSnapshot = await getDocs(collection(db, 'bancos'))
    for (const bancoDoc of bancosSnapshot.docs) {
      const subcolecciones = ['colectorPrincipal', 'colectores', 'listeros']
      for (const subcoleccion of subcolecciones) {
        const docRef = doc(db, `bancos/${bancoDoc.id}/${subcoleccion}/${uid}`)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          return {
            success: true,
            user: userCredential.user,
            profile: { 
              ...data,
              tipo: subcoleccion,
              bancoId: data.bancoId || bancoDoc.id
            }
          }
        }
      }
    }

    throw new Error('Perfil no encontrado en Firestore')
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message)
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code || 'LOGIN_ERROR' 
    }
  }
}

export const getUserProfile = async (uid) => {
  try {
    const collections = [
      { name: 'bancos', isSubcollection: false },
      { name: 'admin', isSubcollection: false },
      { name: 'colectorPrincipal', isSubcollection: true },
      { name: 'colectores', isSubcollection: true },
      { name: 'listeros', isSubcollection: true }
    ]

    for (const { name, isSubcollection } of collections) {
      if (!isSubcollection) {
        const docRef = doc(db, name, uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { 
            ...docSnap.data(),
            tipo: name,
            bancoId: name === 'bancos' ? uid : docSnap.data().bancoId
          }
        }
      } else {
        const bancosSnapshot = await getDocs(collection(db, 'bancos'))
        for (const bancoDoc of bancosSnapshot.docs) {
          const docRef = doc(db, `bancos/${bancoDoc.id}/${name}/${uid}`)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            return { 
              ...docSnap.data(),
              tipo: name,
              bancoId: bancoDoc.id
            }
          }
        }
      }
    }

    throw new Error('Perfil no encontrado')
  } catch (error) {
    console.error('Error en getUserProfile:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message)
    return { success: false, error: error.message }
  }
}

// ==================== EXPORTACIONES ====================

export const AuthService = {
  registrarUsuarioJerarquico,
  login,
  logout,
  getUserProfile,
}

export default AuthService