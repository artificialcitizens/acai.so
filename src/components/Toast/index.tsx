import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toastifySuccess = (msg: string) => {
  return toast.success(msg, {
    className: 'success-toast',
    position: 'top-right',
    autoClose: false,
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
  return toast.info(msg, {
    className: 'info-toast',
    position: 'top-right',
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  });
};

export const toastifyWarning = (msg: string) => {
  return toast.warn(msg, {
    className: 'warning-toast',
    position: 'top-right',
    autoClose: false,
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
