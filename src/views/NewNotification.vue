<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToastStore } from '../stores/toast';
import { useAuthStore } from '@/stores/authStore';
import localforage from 'localforage';
import Header from '../components/Header.vue';
import ButtonDouble from '../components/ButtonDouble.vue';
import Modal from '../components/Modal.vue';
import Colectores_Principales from '../assets/icons/Colectores Principales.svg';
import Colectores from '../assets/icons/Colectores.svg';
import Listeros from '../assets/icons/User.svg';
import CheckIcon from '../assets/icons/Check.svg';

const router = useRouter();
const route = useRoute();

const mensaje = ref('');
const MAX_CARACTERES = 500;
const modalActive = ref(false);

const TypeUser = ref('Todos');
const UsuariosEspecificos = ref([]);

const toastStore = useToastStore();
const authStore = useAuthStore();

const notificationStore = localforage.createInstance({
    name: 'notifications'
});

const caracteresRestantes = computed(() => {
    return MAX_CARACTERES - mensaje.value.length;
});

const imagenSelector = computed(() => {
    switch (TypeUser.value) {
        case 'Todos':
            return Colectores_Principales;
        case 'Colectores':
            return Colectores;
        case 'Listeros':
            return Listeros;
        default:
            return Colectores_Principales;
    }
})

const enviarNotificacion = async () => {
  try {
    // Crear objeto de notificación
    const notification = {
      id: Date.now().toString(),
      message: mensaje.value,
      sender: {
        id: authStore.userId,
        type: authStore.userType,
        name: authStore.profile?.nombre || 'Usuario'
      },
      recipients: {
        group: TypeUser.value,
        specificUsers: UsuariosEspecificos.value.map(u => ({
          uid: u.uid,
          name: u.nombre,
          type: u.tipo
        }))
      },
      timestamp: new Date().toISOString(),
      read: false
    };

    // Guardar notificación en el dispositivo del remitente
    const existingNotifications = await notificationStore.getItem('sentNotifications') || [];
    existingNotifications.push(notification);
    await notificationStore.setItem('sentNotifications', existingNotifications);

    // En un caso real, aquí enviarías la notificación a través de FCM a los usuarios/grupos
    // Por ahora simulamos el envío guardando en el almacenamiento local
    console.log('Notificación enviada:', notification);
    
    // Redirigir y mostrar toast
    router.push(`/home/${route.params.id}`);
    toastStore.showToast('Notificación enviada con éxito', 'success', 3000, CheckIcon, 'top');
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    toastStore.showToast('Error al enviar notificación', 'error', 3000);
  }
};

const abrirModal = () => {
    modalActive.value = !modalActive.value
}

const Filters = (data) => {
    modalActive.value = false;
    TypeUser.value = data.tipoUsuario;
    
    // Si hay un usuario específico, agregarlo al array
    if (data.usuariosEspecificos && data.usuariosEspecificos.length > 0) {
        // Filtrar usuarios que no existan ya en el array
        data.usuariosEspecificos.forEach(usuario => {
            const usuarioExiste = UsuariosEspecificos.value.some(
                u => u.uid === usuario.uid
            );
            
            if (!usuarioExiste) {
                UsuariosEspecificos.value.push(usuario);
            }
        });
    } else {
        // Si no hay usuarios específicos, limpiar el array
        UsuariosEspecificos.value = [];
    }
    
    console.log('Filtros aplicados:', {
        tipoUsuario: TypeUser.value,
        usuariosEspecificos: UsuariosEspecificos.value
    });
}

const eliminarUsuario = (index) => {
    UsuariosEspecificos.value.splice(index, 1);
}
</script>
<template>
    <div class="container-login d-flex flex-column align-items-center">
        <header>
            <Header title="Notificacion"/>
        </header>
        <div class="d-flex flex-column align-items-center w-100 h-100 overflow-y-auto">
            <main class="container-main d-flex flex-column align-items-center gap-3">
                <div class="d-flex flex-row justify-content-start align-items-center gap-3 w-100">
                    <div class="seleccion purple" @click="abrirModal()">
                        <img :src="imagenSelector" :class="imagenSelector === Colectores_Principales ? '' : 'img-white'" alt="" width="20">
                        <h5 class="small" style="color: #F3F3F3;">
                            {{ TypeUser }}
                        </h5>
                        <img src="../assets/icons/Expand.svg" alt="" width="20" style="filter: invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(100) contrast(100);" >
                    </div>
                    <div v-for="(usuario, index) in UsuariosEspecificos" :key="usuario.uid" class="seleccion usuario-especifico">
                        <h5 class="small m-0">
                            {{ usuario.nombre }}
                        </h5>
                        <img src="../assets/icons/Cerrar.svg" alt="Eliminar" width="12" @click="eliminarUsuario(index)">
                    </div>
                </div>
                <div class="text-container">
                    <div class="d-flex flex-row justify-content-center align-items-start gap-1 h-100 w-100">
                        <img src="../assets/icons/Editar.svg" alt="">
                        <textarea 
                            v-model="mensaje"
                            class="body border-0 bg-transparent d-flex justify-content-start align-items-start h-100 w-100" 
                            placeholder="Escribir mensaje" 
                            style="color: #373745;"
                            :maxlength="MAX_CARACTERES"
                        ></textarea>
                    </div>
                    <div class="d-flex justify-content-end w-100">
                        <h5 class="small" :class="{ 'text-danger': caracteresRestantes < 50 }">
                            {{ mensaje.length }}/{{ MAX_CARACTERES }} Carácteres
                        </h5>
                    </div>
                </div>
            </main>
            <footer>
                <ButtonDouble fistbutton="Cancelar" secondbutton="Enviar" :isEnabled="mensaje.length > 0" @accionSegundoBoton="enviarNotificacion"/>
            </footer>
            <Modal v-if="modalActive" type="notification" @cerrar="modalActive = false" @guardarNotificacion="Filters"/>
        </div>
    </div>
</template>
<style scoped>
.container-main {
    padding: 0px 16px 0px 16px;
    width: 100%;
    max-width: 400px;
    height: calc(100vh - 7% - 88px); /* Ajusta 60px según la altura real del footer */
    overflow-y: auto;
}
.seleccion{
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    background-color: #E0E0F8;
    height: 100%;
    padding: 8px 12px;
    gap: 8px;
    border-radius: 30px;
}
.purple{
    background: #6665DD;
}
.text-container{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 12px;
    gap: 10px;
    border: 1px solid #CDCDD1;
    border-radius: 12px;
    flex: none;
    align-self: stretch;
    flex-grow: 1;
}
.img-white{
    filter: invert(100%);
}
textarea::placeholder {
  color: #9B9BA2; /* O cualquier color */
  opacity: 1; /* Asegura que el color se vea */
}
</style>