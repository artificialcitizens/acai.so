# NotificationCenter Component

The `NotificationCenter` component is a functional component in React that provides a notification center functionality to the application. It uses the `react-toastify` library to handle notifications and display them to the user.

## Props

The component accepts the following props:

- `notificationFilter`: An optional array of strings that can be used to filter the notifications by their type. If this prop is provided, only the notifications that have a type included in this array will be displayed.
- `secondaryFilter`: An optional string that can be used as a secondary filter for the notifications. If this prop is provided, only the notifications that have a data type equal to this string will be displayed.
- `placeholder`: An optional string that will be displayed when there are no notifications to show.

## Usage

The component uses the `useNotificationCenter` hook from `react-toastify` to get the current notifications and the necessary functions to interact with them.

It also uses a local state variable, `showUnreadOnly`, to determine whether to show all notifications or only the unread ones. This state can be toggled by calling the `toggleFilter` function.

The notifications are filtered based on the `notificationFilter` and `secondaryFilter` props, and then displayed in a list. Each notification is displayed in a `div` with a class name dependent on its type.

The component is designed to be flexible and can be easily integrated into any application that needs a notification system.

## Example

```jsx
<NotificationCenter
  notificationFilter={['error', 'info']}
  secondaryFilter="warning"
  placeholder="No notifications"
/>
```

In this example, the `NotificationCenter` will only display notifications of type 'error', 'info', or whose data type is 'warning'. If there are no such notifications, it will display the message 'No notifications'.
