type Callback = () => void;

class CallbackQueue {
  private queue: Array<Callback>;
  private isRunning: boolean;

  constructor() {
    this.queue = [];
    this.isRunning = false;
  }

  addCallback(callback: Callback): void {
    this.queue.push(callback);
    if (!this.isRunning) {
      this.isRunning = true;
      this.executeNextCallback();
    }
  }

  private executeNextCallback(): void {
    if (this.queue.length === 0) {
      this.isRunning = false;
      return;
    }

    const callback = this.queue.shift();
    if (callback) {
      setTimeout(() => {
        callback();
        this.executeNextCallback();
      }, 5000);
    }
  }
}

export default CallbackQueue;
