import { useState, useEffect, useRef } from 'react';
import { toastifyError } from '../components/Toast';

const useBroadcastManager = (channelName: string, callBack: () => void) => {
  const [id] = useState(Math.random().toString(36).substring(2)); // Generate a unique ID
  const channel = useRef<BroadcastChannel | null>(null);
  const [isChannelOpen, setIsChannelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!channel.current) {
      channel.current = new BroadcastChannel(channelName);
      channel.current.onmessage = handleMessage;
      setIsChannelOpen(true);
    }

    return () => {
      if (channel.current) {
        channel.current.close();
        setIsChannelOpen(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'newTabOpened' && event.data.id !== id) {
      toastifyError(
        'Another tab is open. Please close it to continue using web speech to text.',
      );
      callBack();
    }
  };

  const notifyNewTab = () => {
    if (channel.current && isChannelOpen) {
      channel.current.postMessage({ type: 'newTabOpened', id: id });
    }
  };

  return { notifyNewTab };
};

export default useBroadcastManager;
