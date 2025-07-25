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

    // Determinar la ruta donde se guardará el perfil
    let docRef, userPath
    if (tipo === 'admin' || tipo === 'bancos') {
      docRef = doc(db, tipo, uid)
      userPath = `${tipo}/${uid}`
    } else {
      const subcoleccion = tipo === 'colectorPrincipal' 
        ? 'colectorPrincipal' 
        : tipo === 'colectores' 
        ? 'colectores' 
        : 'listeros'
      docRef = doc(db, `bancos/${bancoId}/${subcoleccion}/${uid}`)
      userPath = `bancos/${bancoId}/${subcoleccion}/${uid}`
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

    // Crear el perfil en su ubicación específica
    await setDoc(docRef, perfil)
    
    // Registrar en la colección usuarios
    const userRef = doc(db, 'usuarios', uid)
    await setDoc(userRef, {
      uid,
      path: userPath,
      createdAt: serverTimestamp()
    })

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

    // 1. Buscar en la colección usuarios
    const userRef = doc(db, 'usuarios', uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      throw new Error('Usuario no encontrado en la base de datos')
    }

    const userData = userSnap.data()
    
    // 2. Obtener el perfil completo desde la ruta almacenada
    const profileRef = doc(db, userData.path)
    const profileSnap = await getDoc(profileRef)
    
    if (!profileSnap.exists()) {
      throw new Error('Perfil no encontrado en la ruta especificada')
    }

    return {
      success: true,
      user: userCredential.user,
      profile: {
        ...profileSnap.data(),
        bancoId: profileSnap.data().bancoId || (profileSnap.data().tipo === 'bancos' ? uid : null)
      }

    }
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
    const userRef = doc(db, 'usuarios', uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) throw new Error('Usuario no encontrado')

    const userData = userSnap.data()
    const profileRef = doc(db, userData.path)
    const profileSnap = await getDoc(profileRef)
    if (!profileSnap.exists()) throw new Error('Perfil no encontrado')

    const data = profileSnap.data()

    // Normalizamos: aseguramos que existan todos los campos esperados
    const isBanco = data.tipo === 'bancos'

    return {
      uid: data.uid || uid,
      email: data.email || '',
      nombre: data.nombre || '',
      tipo: data.tipo || null,
      bancoId: isBanco ? uid : (data.bancoId || null),
      creadorDirectoId: data.creadorDirectoId || null,
      creadorDirectoTipo: data.creadorDirectoTipo || null,
      fondo: data.fondo ?? 0,
      createdAt: data.createdAt || null
    }

  } catch (error) {
    console.error('Error en getUserProfile:', error)
    throw error
  }
}

// (Las demás funciones permanecen igual)
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