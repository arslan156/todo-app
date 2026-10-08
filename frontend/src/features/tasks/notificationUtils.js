const NOTIFICATION_KEY = "todolist.notifications.v1";

export const getNotifications = () => {
  try {
    const saved = localStorage.getItem(NOTIFICATION_KEY);

    if (!saved) {
      return [];
    }

    const notifications = JSON.parse(saved);

    return Array.isArray(notifications)
      ? notifications
      : [];
  } catch {
    return [];
  }
};

export const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(
      NOTIFICATION_KEY,
      JSON.stringify(notifications)
    );
  } catch {}
};

export const addNotification = ({
  title = "Notification",
  message = "",
  type = "task",
  variant = "success",
}) => {
  const notifications = getNotifications();

  const newNotification = {
    id: `${Date.now()}-${Math.random()}`,
    title,
    message,
    type,
    variant,
    read: false,
    createdAt: new Date().toISOString(),
  };

  saveNotifications([
    newNotification,
    ...notifications,
  ]);

  window.dispatchEvent(
    new CustomEvent("todo:notification", {
      detail: newNotification,
    })
  );

  return newNotification;
};

export const markNotificationRead = (id) => {
  const notifications = getNotifications();

  const updated = notifications.map(
    (notification) =>
      notification.id === id
        ? {
            ...notification,
            read: true,
          }
        : notification
  );

  saveNotifications(updated);

  window.dispatchEvent(
    new CustomEvent("todo:notification")
  );
};

export const markAllNotificationsRead = () => {
  const notifications = getNotifications();

  const updated = notifications.map(
    (notification) => ({
      ...notification,
      read: true,
    })
  );

  saveNotifications(updated);

  window.dispatchEvent(
    new CustomEvent("todo:notification")
  );
};