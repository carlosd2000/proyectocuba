import { auth, db } from './config' // <-- Esta línea ya importa auth configurado
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export const AuthService = {
  // Capitaliza el nombre
  capitalizeUsername(username) {
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  },

  // Verificar si el nombre ya existe
  async isUsernameTaken(nombre) {
    try {
      const capitalizedNombre = this.capitalizeUsername(nombre);
      const tiposRaiz = ['admin', 'bancos'];
      const subcolecciones = [
        { padre: 'bancos', hijo: 'colectores' },
        { padre: 'bancos', hijo: 'listeros' },
        { padre: 'colectores', hijo: 'listeros' }
      ];

      for (const tipo of tiposRaiz) {
        const ref = collection(db, tipo);
        const q = query(ref, where('nombre', '==', capitalizedNombre));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return true;
      }

      for (const path of subcolecciones) {
        const padresSnapshot = await getDocs(collection(db, path.padre));
        for (const padreDoc of padresSnapshot.docs) {
          const refSub = collection(db, `${path.padre}/${padreDoc.id}/${path.hijo}`);
          const qSub = query(refSub, where('nombre', '==', capitalizedNombre));
          const subSnapshot = await getDocs(qSub);
          if (!subSnapshot.empty) return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verificando nombre:', error);
      throw error;
    }
  },

  // Verificar si el correo ya existe
  async isEmailTaken(email) {
    try {
      const tiposRaiz = ['admin', 'bancos'];
      const subcolecciones = [
        { padre: 'bancos', hijo: 'colectores' },
        { padre: 'bancos', hijo: 'listeros' },
        { padre: 'colectores', hijo: 'listeros' }
      ];

      for (const tipo of tiposRaiz) {
        const ref = collection(db, tipo);
        const q = query(ref, where('email', '==', email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return true;
      }

      for (const path of subcolecciones) {
        const padresSnapshot = await getDocs(collection(db, path.padre));
        for (const padreDoc of padresSnapshot.docs) {
          const refSub = collection(db, `${path.padre}/${padreDoc.id}/${path.hijo}`);
          const qSub = query(refSub, where('email', '==', email));
          const subSnapshot = await getDocs(qSub);
          if (!subSnapshot.empty) return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verificando email:', error);
      throw error;
    }
  },

  // Registro
  async register({ email, password, userData }) {
    try {
      const capitalizedName = this.capitalizeUsername(userData.nombre);

      if (await this.isUsernameTaken(userData.nombre)) {
        return { success: false, error: 'Este nombre de usuario ya está en uso', code: 'name-already-in-use' };
      }
      if (await this.isEmailTaken(email)) {
        return { success: false, error: 'Este correo ya está vinculado a otra cuenta', code: 'email-already-used-custom' };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUserId = userCredential.user.uid;

      const userProfileData = {
        ...userData,
        nombre: capitalizedName,
        email,
        uid: newUserId,
        createdAt: new Date().toISOString()
      };

      await this.createUserProfile(newUserId, userProfileData);

      return { user: userCredential.user, success: true };
    } catch (error) {
      return this.handleAuthError(error);
    }
  },

  // Login
  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);

      return { user: userCredential.user, profile: userProfile, success: true };
    } catch (error) {
      return this.handleAuthError(error);
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return this.handleAuthError(error);
    }
  },

// Crear perfil correctamente según tipo
async createUserProfile(userId, userData) {
  try {
    const tipo = userData.tipo;
    const creadorId = userData.creadorId || null;
    const tipoCreador = userData.tipoCreador || null;

    if (tipo === 'bancos' || tipo === 'admin') {
      await setDoc(doc(db, tipo, userId), userData);
    } 
    else if (tipo === 'colectores') {
      if (!creadorId || !tipoCreador) throw new Error("Falta creadorId o tipoCreador para colectores");
      await setDoc(doc(db, `bancos/${creadorId}/colectores/${userId}`), userData);
    } 
    else if (tipo === 'listeros') {
      if (!creadorId || !tipoCreador) throw new Error("Falta creadorId o tipoCreador para listeros");

      // Determinar el ID del banco padre
      let bancoId = null;

      if (tipoCreador === 'banco') {
        bancoId = creadorId;
      } 
      else if (tipoCreador === 'colector') {
        // Buscar el banco padre del colector
        const bancosSnapshot = await getDocs(collection(db, 'bancos'));
        for (const bancoDoc of bancosSnapshot.docs) {
          const colectorRef = doc(db, `bancos/${bancoDoc.id}/colectores/${creadorId}`);
          const colectorSnap = await getDoc(colectorRef);
          if (colectorSnap.exists()) {
            bancoId = bancoDoc.id;
            break;
          }
        }

        if (!bancoId) {
          throw new Error("No se encontró el banco padre para este colector");
        }
      }

      // Guardar el listero en la subcolección de listeros del banco
      await setDoc(doc(db, `bancos/${bancoId}/listeros/${userId}`), {
        ...userData,
        // Mantener referencia al creador directo (colector o banco)
        creadorDirectoId: creadorId,
        creadorDirectoTipo: tipoCreador
      });
    } 
    else {
      throw new Error("Tipo de usuario inválido");
    }

    return { success: true };
  } catch (error) {
    console.error('Error creando perfil:', error);
    throw error;
  }
},

  // Obtener perfil de usuario
  async getUserProfile(userId) {
    try {
      const tiposRaiz = ['admin', 'bancos'];

      for (const tipo of tiposRaiz) {
        const docRef = doc(db, tipo, userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...docSnap.data(), tipo: tipo };
        }
      }

      const bancosSnapshot = await getDocs(collection(db, 'bancos'));
      for (const bancoDoc of bancosSnapshot.docs) {
        const bancoId = bancoDoc.id;

        const colectoresSnapshot = await getDocs(collection(db, `bancos/${bancoId}/colectores`));
        for (const colector of colectoresSnapshot.docs) {
          if (colector.id === userId) {
            return { ...colector.data(), tipo: 'colectores' };
          }

          const listerosNestedSnapshot = await getDocs(collection(db, `bancos/${bancoId}/colectores/${colector.id}/listeros`));
          for (const listero of listerosNestedSnapshot.docs) {
            if (listero.id === userId) {
              return { ...listero.data(), tipo: 'listeros' };
            }
          }
        }

        const listerosSnapshot = await getDocs(collection(db, `bancos/${bancoId}/listeros`));
        for (const listero of listerosSnapshot.docs) {
          if (listero.id === userId) {
            return { ...listero.data(), tipo: 'listeros' };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  },

  // Manejar errores de auth
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
    };

    return {
      success: false,
      error: errorMessages[error.code] || error.message || 'Error en la autenticación',
      code: error.code || 'unknown'
    };
  }
}