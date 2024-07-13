import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Button from '@/ui/Button/Button';
import styles from '@/ui/Modal/DeleteCanvasModal.module.css';
import { IoMdClose } from 'react-icons/io';

const DeleteCanvasModal = ({
  isOpen,
  onClose,
  onConfirm,
  hasNodes,
  hasSharedNodes
}) => (
  <Transition.Root show={isOpen} as={React.Fragment}>
    <Dialog as="div" className={styles.modalOverlay} onClose={onClose}>
      <div className={styles.modalWrapper}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className={styles.modalBackground} />
        </Transition.Child>

        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={onClose}>
              <IoMdClose />
            </button>
            <Dialog.Title as="h3" className={styles.modalHeader}>
              Confirm Deletion
            </Dialog.Title>
            <div className="nodrag nowheel">
              {hasNodes ? (
                <>
                  <p className={styles.modalText}>
                    This canvas contains nodes. Do you want to delete the canvas
                    only or delete the canvas and its nodes (except shared
                    ones)?
                  </p>
                  {hasSharedNodes && (
                    <p className={styles.modalText}>
                      Some nodes in this canvas are shared with other canvases.
                      These shared nodes will not be deleted.
                    </p>
                  )}
                  <div className={styles.actions}>
                    <Button
                      variant="submit"
                      onClick={() => onConfirm('canvasOnly')}
                    >
                      Delete Canvas Only
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => onConfirm('withNodes')}
                    >
                      Delete Canvas and Nodes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.modalText}>
                    Are you sure you want to delete this canvas? This action
                    cannot be undone.
                  </p>
                  <div className={styles.actions}>
                    <Button
                      variant="submit"
                      onClick={() => onConfirm('canvasOnly')}
                    >
                      Yes, Delete Canvas
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
);

export default DeleteCanvasModal;
