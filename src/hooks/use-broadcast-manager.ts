import { useState, useEffect } from 'react';
import { toastifyError } from '../components/Toast';

const useBroadcastManager = (channelName: string, callBack: () => void) => {
  const [id] = useState(Math.random().toString(36).substring(2)); // Generate a unique ID
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const newChannel = new BroadcastChannel(channelName);
    newChannel.onmessage = handleMessage;
    setChannel(newChannel);

    return () => {
      newChannel.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'newTabOpened' && event.data.id !== id) {
      toastifyError(
        'Another tab is open. Please close it to continue using web speech to text.',
      );
      callBack();
    }
  };

  const notifyNewTab = () => {
    if (channel) {
      channel.postMessage({ type: 'newTabOpened', id: id });
    }
  };

  return { notifyNewTab };
};

export default useBroadcastManager;
