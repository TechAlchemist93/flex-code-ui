import { createSignal, onMount, ParentComponent, Show } from "solid-js";
import { Portal } from "solid-js/web";

export type ModalRef = {
  open(): void;
  close(): void;
};

type Props = {
  defaultOpen?: boolean;
  ref: (params: ModalRef) => ModalRef;
};

export const Modal: ParentComponent<Props> = (props) => {
  /**
   * Keeps a reference of the dialog element.
   */
  let modalRef: HTMLDialogElement;

  const [isOpen, setIsOpen] = createSignal();

  /**
   * @summary Opens the modal.
   */
  const open = () => {
    modalRef.showModal();
    setIsOpen(true);
  };

  /**
   * Closes the modal.
   */
  const close = () => {
    modalRef.close();
    setIsOpen(false);
  };

  onMount(() => {
    if (modalRef instanceof HTMLDialogElement) {
      if (props.defaultOpen) {
        modalRef.showModal();
      }
      /**
       * Inverts handlers to expose them to the parent via ref.
       * This allows internal state to sync with external state
       * easily.
       */
      props.ref({ open, close });
    }
  });

  return (
    <Show when={isOpen}>
      <Portal>
        <dialog ref={modalRef}></dialog>
      </Portal>
    </Show>
  );
};
