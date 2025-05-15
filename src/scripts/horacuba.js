import { ref, onMounted, onUnmounted } from 'vue';

// Configuración constante
const ZONA_HORARIA = 'America/Havana';
const FORMATO_24H = {
  timeZone: ZONA_HORARIA,
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};
const FORMATO_12H = {
  timeZone: ZONA_HORARIA,
  hour12: true,
  hour: 'numeric',
  minute: '2-digit'
};

// ================= FUNCIONES PRINCIPALES =================

/**
 * Obtiene la hora actual de Cuba en diferentes formatos
 * @returns {Object} { hora24: string, hora12: string, timestamp: number }
 */
export function obtenerHoraCuba() {
  const ahora = new Date();
  return {
    hora24: ahora.toLocaleTimeString('es-ES', FORMATO_24H),
    hora12: ahora.toLocaleTimeString('es-ES', FORMATO_12H),
    timestamp: ahora.getTime()
  };
}

/**
 * Formatea una hora string (HH:MM:SS) a formato 12h (H:MM a.m./p.m.)
 * @param {string} horaString - Hora en formato 24h (ej. "14:30:00")
 * @returns {string} Hora formateada (ej. "2:30 p.m.")
 */
export function formatearHoraCuba(horaString) {
  if (!horaString) return "--:-- --";
  try {
    const [horas, minutos] = horaString.split(':').slice(0, 2);
    const hora12 = horas % 12 || 12;
    const periodo = horas < 12 ? 'a.m.' : 'p.m.';
    return `${hora12}:${minutos} ${periodo}`;
  } catch (e) {
    console.error("Error formateando hora:", e);
    return "--:-- --";
  }
}

/**
 * Parsea timestamp de Firebase (tanto en formato objeto como string)
 * @param {object|string|number} timestamp - Timestamp de Firebase
 * @returns {Date} Objeto Date de JavaScript
 */
export function parsearFechaFirebase(timestamp) {
  if (!timestamp) return null;
  
  // Si es un timestamp de Firestore (con método toDate)
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Si es un string ISO o número de milisegundos
  return new Date(timestamp);
}

// ================= HOOK PARA VUE (OPCIONAL) =================

/**
 * Hook para usar la hora actual reactiva en componentes Vue
 * @returns {Object} { horaActual: ref<string> }
 */
export function useHoraCuba() {
  const horaActual = ref('--:--:--');

  const actualizarHora = () => {
    horaActual.value = obtenerHoraCuba().hora24;
  };

  let intervalo;
  onMounted(() => {
    actualizarHora();
    intervalo = setInterval(actualizarHora, 1000);
  });

  onUnmounted(() => {
    clearInterval(intervalo);
  });

  return { horaActual };
}