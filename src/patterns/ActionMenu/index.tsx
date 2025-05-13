import { Component, Show } from "solid-js";
import "./styles.scss";

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove?: () => void;
  onToggleEnabled?: () => void;
  isEnabled?: boolean;
  canRemove: boolean;
  position: { x: number; y: number };
}

export const ActionMenu: Component<ActionMenuProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div 
        class="action-menu"
        style={{
          top: `${props.position.y}px`,
          left: `${props.position.x}px`
        }}
      >
        <Show when={props.canRemove}>
          <button 
            class="action-menu__item action-menu__item--remove"
            onClick={() => {
              props.onRemove?.();
              props.onClose();
            }}
          >
            Remove Action
          </button>
        </Show>
        <Show when={!props.canRemove}>
          <button 
            class="action-menu__item"
            onClick={() => {
              props.onToggleEnabled?.();
              props.onClose();
            }}
          >
            {props.isEnabled ? 'Disable Action' : 'Enable Action'}
          </button>
        </Show>
      </div>
      <div class="action-menu__overlay" onClick={props.onClose} />
    </Show>
  );
};