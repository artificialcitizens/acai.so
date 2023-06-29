/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center';

export interface NotificationCenterProps {
  notificationFilter?: string[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notificationFilter }) => {
  const { notifications, clear, markAllAsRead, markAsRead, unreadCount } = useNotificationCenter();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const toggleFilter = (e: React.ChangeEvent) => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const filteredNotifications = notificationFilter
    ? notifications.filter((notification) => notificationFilter.includes(notification.type || ''))
    : notifications;

  return (
    <div className=" pt-2 border-b-2 border-solid border-default w-full">
      <div className="bg-dark p-2 flex justify-between items-center text-white"></div>
      <div className="h-96 w-96 p-3 bg-dark rounded overflow-y-auto w-full">
        {(!filteredNotifications.length || (unreadCount === 0 && showUnreadOnly)) && (
          <h4>
            Your queue is empty! You are all set{' '}
            <span role="img" aria-label="dunno what to put">
              🎉
            </span>
          </h4>
        )}
        {(showUnreadOnly ? filteredNotifications.filter((v) => !v.read) : filteredNotifications).map((notification) => {
          return (
            <div
              key={notification.id}
              className={`alert alert-${notification.type || 'info'} flex justify-between items-center`}
            >
              <span>{notification.content}</span>
              {notification.read ? '✅' : <span onClick={() => markAsRead(notification.id)}>📬</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationCenter;
