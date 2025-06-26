<template>
  <div class="container-fluid m-0 p-0" style="overflow: hidden; position: relative; width: 100%;">
    <div 
      class="slider-container"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="endDrag"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      :style="{ transform: `translateX(${currentPosition}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }"
    >
      <!-- Slide de bienvenida -->
      <div class="slide" style="background-color: #222;">
        <div style="color: white; text-align: center;">
          <h2>Bienvenido</h2>
          <p>En los siguientes cuadros estarán las apuestas</p>
        </div>
      </div>
      <!-- Slides de apuestas, 2 por página -->
      <div 
        v-for="(grupo, pageIndex) in apuestasPaginadas" 
        :key="'grupo-'+pageIndex" 
        class="slide"
        style="background-color: #007bff;"
      >
        <div class="d-flex flex-column flex-md-row justify-content-around w-100">
          <div 
            v-for="(apuesta, idx) in grupo" 
            :key="apuesta.id || idx" 
            class="apuesta-card"
          >
            <div><b>Nombre:</b> {{ apuesta.nombre || apuesta.usuario || 'Sin nombre' }}</div>
            <div><b>Total:</b> ${{ apuesta.totalGlobal?.toLocaleString() }}</div>
            <div><b>Estado:</b> {{ apuesta.estado }}</div>
            <div><b>Fecha:</b> {{ apuesta.creadoEn ? (typeof apuesta.creadoEn === 'string' ? apuesta.creadoEn : (apuesta.creadoEn.toDate ? apuesta.creadoEn.toDate().toLocaleString() : '')) : '' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Indicadores de posición -->
    <div class="indicators" v-if="totalSlides > 1">
      <span 
        v-for="(n, index) in totalSlides" 
        :key="'indicator-'+index"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apuestas, obtenerApuestas } from '../scripts/crudListas.js'

// Slider logic
const currentPosition = ref(0)
const startX = ref(0)
const isDragging = ref(false)
const currentIndex = ref(0)
const slideWidth = ref(0)
const apuestasLocales = ref([])

function updateSlideWidth() {
  slideWidth.value = window.innerWidth
  currentPosition.value = -(currentIndex.value * slideWidth.value)
}

function startDrag(e) {
  isDragging.value = true
  startX.value = e.touches ? e.touches[0].clientX : e.clientX
}

function onDrag(e) {
  if (!isDragging.value) return
  const x = e.touches ? e.touches[0].clientX : e.clientX
  const dragDistance = x - startX.value
  currentPosition.value = -(currentIndex.value * slideWidth.value) + dragDistance
}

function endDrag(e) {
  if (!isDragging.value) return
  isDragging.value = false
  const endX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX || 0)
  const dragDistance = endX - startX.value
  if (Math.abs(dragDistance) > slideWidth.value * 0.2) {
    if (dragDistance > 0 && currentIndex.value > 0) {
      currentIndex.value--
    } else if (dragDistance < 0 && currentIndex.value < totalSlides.value - 1) {
      currentIndex.value++
    }
  }
  currentPosition.value = -(currentIndex.value * slideWidth.value)
}

function goToSlide(index) {
  currentIndex.value = index
  currentPosition.value = -(currentIndex.value * slideWidth.value)
}

// --- Lógica para traer apuestas (similar a Lista.js) ---

function cargarApuestasLocales() {
  try {
    const eliminacionesPermanentes = JSON.parse(localStorage.getItem('eliminacionesPermanentes') || '{}')
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
    apuestasLocales.value = pendientes
      .filter(a => !eliminacionesPermanentes[a.uuid])
      .map(a => ({
        ...a,
        estado: 'Pendiente',
        id: a.uuid,
        uuid: a.uuid,
        totalGlobal: Number(a.totalGlobal) || 0,
      }))
  } catch (error) {
    apuestasLocales.value = []
  }
}

const apuestasCombinadas = computed(() => {
  const isOnline = navigator.onLine
  if (!isOnline) {
    return apuestasLocales.value
  }
  const firebaseUuids = new Set(apuestas.value.map(a => a.uuid))
  const localesFiltradas = apuestasLocales.value.filter(local => !firebaseUuids.has(local.uuid))
  return [...apuestas.value, ...localesFiltradas]
})

// Agrupa apuestas de 2 en 2 para el slider (después del slide de bienvenida)
const apuestasPaginadas = computed(() => {
  const arr = []
  for (let i = 0; i < apuestasCombinadas.value.length; i += 2) {
    arr.push(apuestasCombinadas.value.slice(i, i + 2))
  }
  return arr
})

// Total de slides: 1 (bienvenida) + páginas de apuestas
const totalSlides = computed(() => 1 + apuestasPaginadas.value.length)

onMounted(async () => {
  await obtenerApuestas()
  cargarApuestasLocales()
  updateSlideWidth()
  window.addEventListener('resize', updateSlideWidth)
})
</script>

<style>
.slider-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.slide {
  flex: 0 0 100%; /* Cada slide ocupa el 100% del contenedor */
  min-height: 200px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  padding: 2rem;
}

.apuesta-card {
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  margin: 0.5rem;
  padding: 1rem 2rem;
  min-width: 220px;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.indicators {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.indicators span {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.indicators span.active {
  background-color: white;
}
</style>