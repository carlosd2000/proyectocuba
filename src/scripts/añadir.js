// src/scripts/añadir.js
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { filasFijas, filasExtra, calcularTotales } from './operaciones';

// Variables compartidas
let nombreTemporal = 'SinNombre';
let tipoOrigen = 'tiros';
let horarioSeleccionado = 'Dia';

// ================= CONFIGURACIÓN =================
export function setNombre(nombre) {
  nombreTemporal = nombre?.trim() || 'SinNombre';
}

export function setTipoOrigen(tipo) {
  tipoOrigen = tipo || 'tiros';
}

export function setHorario(horario) {
  horarioSeleccionado = horario || 'Dia';
}

// ================= MANEJO DE HORAS =================
function obtenerHoraCuba() {
  const ahora = new Date();
  const opciones24h = {
    timeZone: 'America/Havana',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  const opciones12h = {
    timeZone: 'America/Havana',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  };

  return {
    hora24: ahora.toLocaleTimeString('es-ES', opciones24h), // "17:25:43"
    hora12: ahora.toLocaleTimeString('es-ES', opciones12h), // "5:25 p.m."
    fechaCompleta: ahora.toLocaleString('es-ES', { 
      ...opciones24h,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }), // "12/05/2025, 17:25:43"
    timestamp: ahora.getTime()
  };
}

export function formatearHoraCuba(horaString) {
  if (!horaString) return "--:-- --";
  
  try {
    // Convierte "HH:MM:SS" a "H:MM a.m./p.m."
    const [horas, minutos] = horaString.split(':');
    const hora12 = horas % 12 || 12;
    const periodo = horas < 12 ? 'a.m.' : 'p.m.';
    return `${hora12}:${minutos} ${periodo}`;
  } catch (e) {
    console.error("Error formateando hora:", e);
    return "--:-- --";
  }
}

// ================= PROCESAMIENTO DE DATOS =================
function procesarFilas(filas, tipo) {
  return filas.map((fila, index) => {
    // Excluir circuloSolo específicamente de la fila 3
    if (index === 2 && tipo === 'fija') {
      const { circuloSolo, ...resto } = fila;
      fila = resto;
    }

    const filaProcesada = { tipo, fila: index + 1 };
    let tieneDatos = false;

    // Procesar solo valores numéricos válidos
    for (const clave in fila) {
      const valor = fila[clave];
      if (valor !== '' && valor !== null && !isNaN(valor)) {
        filaProcesada[clave] = Number(valor);
        tieneDatos = true;
      }
    }

    return tieneDatos ? filaProcesada : null;
  }).filter(Boolean); // Eliminar filas sin datos
}

// ================= FUNCIÓN PRINCIPAL =================
export async function guardarDatos() {
  const { hora24, hora12, fechaCompleta, timestamp } = obtenerHoraCuba();

  try {
    // 1. Calcular totales
    const { col3, col4, col5 } = calcularTotales(filasFijas, filasExtra);
    const totalGlobal = col3 + col4 + col5;

    // 2. Verificar círculo solo
    const circuloSolo = filasFijas.value[2]?.circuloSolo;
    const circuloSoloValido = circuloSolo !== '' && circuloSolo !== null && !isNaN(circuloSolo);

    // 3. Procesar filas
    const datosAGuardar = [
      ...procesarFilas(filasFijas.value, 'fija'),
      ...procesarFilas(filasExtra.value, 'extra')
    ];

    // 4. Validación
    if (datosAGuardar.length === 0 && !circuloSoloValido && totalGlobal === 0) {
      return { 
        success: false, 
        message: 'No hay datos válidos para guardar',
        hora: hora24 
      };
    }

    // 5. Preparar documento final
    const docAGuardar = {
      nombre: nombreTemporal,
      totalGlobal,
      datos: datosAGuardar,
      creadoEn: serverTimestamp(),        // Timestamp Firebase (UTC)
      id_listero: auth.currentUser?.uid || 'sin-autenticar',
      tipo: circuloSoloValido && tipoOrigen === "tiros" ? `${tipoOrigen}/candado` : tipoOrigen,
      horario: horarioSeleccionado,
      // Metadatos de hora
      horaCuba24: hora24,               // "17:25:43"
      horaCuba12: hora12,               // "5:25 p.m."
      fechaCuba: fechaCompleta,         // "12/05/2025, 17:25:43"
      timestampLocal: timestamp         // 1744478743000
    };

    // 6. Agregar circuloSolo si es válido
    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo);
    }

    // 7. Guardar en Firestore
    const docRef = await addDoc(collection(db, 'apuestas'), docAGuardar);

    return { 
      success: true, 
      message: `Datos guardados a las ${hora24}`,
      horaExacta: hora24,
      docId: docRef.id
    };

  } catch (error) {
    console.error('Error al guardar:', error);
    const { hora24 } = obtenerHoraCuba();
    return { 
      success: false, 
      message: `Error a las ${hora24}: ${error.message}`,
      horaError: hora24
    };
  }
}