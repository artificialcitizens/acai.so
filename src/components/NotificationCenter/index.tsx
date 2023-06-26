/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center';

const types = ['success', 'info', 'warning', 'error'];

export default function DescriptionAlerts() {
  const { notifications, clear, markAllAsRead, markAsRead, unreadCount } = useNotificationCenter();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const toggleFilter = (e: React.ChangeEvent) => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  return (
    <div className=" pt-2 border-b-2 border-solid border-default w-full overflow-hidden">
      <div className="bg-dark p-2 flex justify-between items-center text-white">
        {/* <label className="flex items-center">
          <input type="checkbox" className="form-checkbox" onChange={toggleFilter} checked={showUnreadOnly} />
          <span className="ml-2">Unread Only</span>
        </label> */}
      </div>
      <div className="h-96 w-96 p-3 bg-dark rounded overflow-y-auto w-full">
        {(!notifications.length || (unreadCount === 0 && showUnreadOnly)) && (
          <h4>
            Your queue is empty! You are all set{' '}
            <span role="img" aria-label="dunno what to put">
              🎉
            </span>
          </h4>
        )}
        {(showUnreadOnly ? notifications.filter((v) => !v.read) : notifications).map((notification) => {
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
      {/* <div className="bg-dark p-2 flex justify-between items-center text-white">
        <button className="btn btn-primary" onClick={clear}>
          Clear All
        </button>
        <button className="btn btn-primary" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div> */}
    </div>
  );
}
