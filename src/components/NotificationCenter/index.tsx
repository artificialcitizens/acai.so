/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center';

export interface NotificationCenterProps {
  notificationFilter?: string[];
  secondaryFilter?: string;
  placeholder?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notificationFilter,
  secondaryFilter,
  placeholder,
}) => {
  const { notifications, clear, markAllAsRead, markAsRead, unreadCount } = useNotificationCenter();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const toggleFilter = (e: React.ChangeEvent) => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const filteredNotifications = notificationFilter
    ? notifications.filter((notification) => notificationFilter.includes(notification.type || ''))
    : notifications.filter((notification) => notification.data?.type === secondaryFilter);

  return (
    <div className=" pt-2 border-b-2 border-solid border-lighter w-full">
      {/* <div className="bg-base p-2 flex justify-between items-center text-white"></div> */}
      <div className="h-56 p-3 bg-base rounded overflow-y-auto w-full">
        {(!filteredNotifications.length || (unreadCount === 0 && showUnreadOnly)) && (
          <h4 className="text-light">{placeholder}</h4>
        )}
        {(showUnreadOnly ? filteredNotifications.filter((v) => !v.read) : filteredNotifications).map((notification) => {
          return (
            <div
              key={notification.id}
              className={`alert alert-${
                notification.type || 'info'
              } flex justify-between items-center text-light mb-2 py-2 border-b border-solid border-light`}
            >
              <span>{notification.content}</span>
              {/* {notification.read ? '✅' : <span onClick={() => markAsRead(notification.id)}>📬</span>} */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationCenter;
