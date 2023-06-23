class ChromeNotification {
  private notification: Notification | undefined;

  constructor(private title: string, private options?: NotificationOptions) {
    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') {
      this.createNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.createNotification();
        }
      });
    }
  }

  createNotification() {
    this.notification = new Notification(this.title, this.options);

    // Set onclick event
    this.notification.onclick = () => {
      console.log('Notification clicked!');
    };

    // Close the notification after 5 seconds
    setTimeout(() => {
      if (this.notification) {
        this.notification.close();
      }
    }, 5000);
  }
}

export default ChromeNotification;
