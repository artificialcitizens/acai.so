import React, { useContext } from 'react';
import Modal from 'react-modal';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useSelector } from '@xstate/react';
import styles from './Modal.module.css';

Modal.setAppElement('#root');

const ACModal: React.FC = () => {
  const { uiStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const modalOpen = useSelector(
    uiStateService,
    (state) => state.context.modalOpen,
  );
  const modalContent = useSelector(
    uiStateService,
    (state) => state.context.modalContent,
  );

  const closeModal = () => {
    uiStateService.send({ type: 'TOGGLE_MODAL', modalContent: '' });
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        contentLabel="Example Modal"
        className={styles.modal}
        overlayClassName={styles.modalContent}
      >
        <div className="flex flex-col flex-grow relative w-screen h-screen sm:h-max sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-md sm:rounded-xl p-8 pt-12 bg-dark">
          <button
            className="absolute top-0 right-0 rounded mr-4 py-2.5 font-bold text-xl md:text-sm uppercase leading-tight text-acai-white z-50"
            onMouseDown={closeModal}
          >
            X
          </button>
          {modalContent}
        </div>
      </Modal>
    </>
  );
};

export default ACModal;
