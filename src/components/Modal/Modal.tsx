import React, { useContext, useState } from 'react';
import Modal from 'react-modal';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useSelector } from '@xstate/react';
import styles from './Modal.module.css';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

const ACModal: React.FC = () => {
  const { uiStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const modalContent = useSelector(
    uiStateService,
    (state) => state.context.modalContent,
  ) || <div>hello modal</div>;
  return (
    <Modal
      isOpen={true}
      contentLabel="Example Modal"
      className={styles.modal}
      overlayClassName={styles.modalContent}
    >
      {modalContent}
    </Modal>
  );
};

export default ACModal;
