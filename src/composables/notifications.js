import localforage from 'localforage';

const notificationStore = localforage.createInstance({
  name: 'notifications'
});

export const receiveNotification = async (notification) => {
  try {
    const existingNotifications = await notificationStore.getItem('receivedNotifications') || [];
    existingNotifications.push({
      ...notification,
      read: false
    });
    await notificationStore.setItem('receivedNotifications', existingNotifications);
    return true;
  } catch (error) {
    console.error('Error al guardar notificación recibida:', error);
    return false;
  }
};