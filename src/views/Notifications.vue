<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import localforage from 'localforage';

const router = useRouter();
const notifications = ref([]);
const loading = ref(true);

// Inicializar LocalForage para notificaciones
const notificationStore = localforage.createInstance({
  name: 'notifications'
});

const goBack = () => {
  router.go(-1);
};

const loadNotifications = async () => {
  try {
    loading.value = true;
    const storedNotifications = await notificationStore.getItem('receivedNotifications') || [];
    notifications.value = storedNotifications.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (id) => {
  try {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value[index].read = true;
      await notificationStore.setItem('receivedNotifications', notifications.value);
    }
  } catch (error) {
    console.error('Error al marcar como leída:', error);
  }
};

const deleteNotification = async (id) => {
  try {
    notifications.value = notifications.value.filter(n => n.id !== id);
    await notificationStore.setItem('receivedNotifications', notifications.value);
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

onMounted(() => {
  loadNotifications();
});
</script>
<template>
  <div class="container-login d-flex flex-column align-items-center">
    <header>
      <Header title="Notificaciones" :showBack="true" @back="goBack" />
    </header>
    <div class="notifications-list">
      <div v-if="loading" class="loading">Cargando notificaciones...</div>
      
      <div v-else-if="notifications.length === 0" class="empty-state">
        <img src="../assets/icons/Notification.svg" alt="Sin notificaciones" width="64">
        <p>No tienes notificaciones</p>
      </div>
      
      <div v-else>
        <div v-for="notification in notifications" :key="notification.id" 
             class="notification-item" :class="{ unread: !notification.read }"
             @click="markAsRead(notification.id)">
          <div class="notification-header">
            <span class="sender">{{ notification.sender.name }}</span>
            <span class="timestamp">{{ formatDate(notification.timestamp) }}</span>
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div class="notification-actions">
            <button @click.stop="deleteNotification(notification.id)" class="btn-delete">
              <img src="../assets/icons/Delete.svg" alt="Eliminar" width="16">
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.notifications-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50%;
  color: #9B9BA2;
}

.notification-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  border-left: 4px solid transparent;
}

.notification-item.unread {
  border-left-color: #6665DD;
  background-color: #F8F8FF;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sender {
  font-weight: 600;
  color: #373745;
}

.timestamp {
  font-size: 12px;
  color: #9B9BA2;
}

.notification-message {
  color: #373745;
  margin-bottom: 12px;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-delete:hover {
  opacity: 1;
}
</style>