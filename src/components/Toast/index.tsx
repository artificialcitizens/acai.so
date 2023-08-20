import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';

export const toastifySuccess = (msg: string) => {
  return toast.success(msg, {
    className: 'success-toast',
    position: 'top-right',
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  });
};

export const toastifyError = (msg: string) => {
  return toast.error(msg, {
    className: 'error-toast',
    position: 'top-right',
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  });
};

export const toastifyInfo = (msg: string) => {
  return toast(msg, {
    className: 'info-toast',
    position: 'top-right',
    hideProgressBar: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  });
};

export const toastifyWarning = (msg: string) => {
  return toast.warn(msg, {
    className: 'warning-toast',
    position: 'top-right',
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  });
};

export const toastifyDefault = (msg: string) => {
  return toast(msg, {
    className: 'custom-toast',
    position: 'top-right',
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  });
};

// @TODO: Update to use meta tag for filtering logs
/**
 * Sends an invisible toast to the notification manager to display as log
 */
export const toastifyAgentLog = (msg: string, metaTag?: string) => {
  return toast(msg, {
    className: 'toast-agent-thought',
    position: 'top-right',
    data: { type: 'agent-thought', metaTag },
    toastId: `agent-thought-${Date.now()}`,
  });
};

export const toastifyAgentObservation = (msg: string) => {
  return toast(msg, {
    className: 'toast-agent-thought',
    position: 'top-right',
    data: { type: 'agent-observation' },
    toastId: `agent-observation-${Date.now()}`,
  });
};

const ToastManager = () => {
  return (
    <ToastContainer
      style={{
        zIndex: 99,
        top: 0,
        right: 0,
        maxWidth: '100%',
      }}
      position="top-left"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default ToastManager;
