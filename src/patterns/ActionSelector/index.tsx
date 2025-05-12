import { Component, For, createSignal, createEffect } from "solid-js";
import { Modal, type ModalRef } from "../Modal";
import "./styles.scss";

interface ActionSelectorProps {
  actions: ActionDetails[];
  onSelect: (action: ActionDetails) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const ActionSelector: Component<ActionSelectorProps> = (props) => {
  let modalRef: ModalRef;
  const [searchTerm, setSearchTerm] = createSignal("");

  const filteredActions = () => {
    const term = searchTerm().toLowerCase();
    return props.actions.filter(action => 
      action.name.toLowerCase().includes(term) ||
      action.type.toLowerCase().includes(term)
    );
  };

  const handleSelect = (action: ActionDetails) => {
    props.onSelect(action);
    props.onClose();
  };

  let modalRef: ModalRef;

  createEffect(() => {
    if (props.isOpen) {
      modalRef?.open();
    } else {
      modalRef?.close();
    }
  });

  return (
    <Modal ref={(r) => (modalRef = r)}>
      <div class="action-selector">
        <div class="action-selector__header">
          <h2 class="action-selector__title">Select Action</h2>
          <button class="action-selector__close" onClick={props.onClose}>×</button>
        </div>
        <div class="action-selector__search">
          <input
            type="text"
            placeholder="Search actions..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="action-selector__input"
          />
        </div>
        <div class="action-selector__list">
          <For each={filteredActions()}>
            {(action) => (
              <button
                class="action-selector__item"
                onClick={() => handleSelect(action)}
              >
                <div class="action-selector__item-header">
                  <span class="action-selector__item-name">{action.name}</span>
                  <span class="action-selector__item-type">{action.type}</span>
                </div>
                <div class="action-selector__item-params">
                  {action.type === "Task" && (
                    <>
                      <span>Inputs: {action.inputs.length}</span>
                      <span>Outputs: {action.outputs.length}</span>
                    </>
                  )}
                  {action.type === "Workflow" && (
                    <>
                      <span>Inputs: {action.inputs.length}</span>
                      <span>Outputs: {action.outputs.length}</span>
                      <span>Actions: {action.actions.length}</span>
                    </>
                  )}
                  {action.type === "Function" && (
                    <span>Parameters: {action.params.length}</span>
                  )}
                  {action.type === "Conditional" && (
                    <span>Inputs: {action.inputs.length}</span>
                  )}
                </div>
              </button>
            )}
          </For>
        </div>
      </div>
    </Modal>
  );
};