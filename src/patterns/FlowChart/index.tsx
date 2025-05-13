import { Component, For, Show, createSignal } from "solid-js";
import { ActionMenu } from "../ActionMenu";
import "./styles.scss";

interface FlowChartNodeProps {
  name: string;
  type: string;
  source: string;
  enabled: boolean;
  hasChildren?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const FlowChartNode: Component<FlowChartNodeProps> = (props) => {
  return (
    <div 
      class="flow-node" 
      classList={{ 
        "flow-node--disabled": !props.enabled,
        "flow-node--selected": props.selected
      }}
      onClick={props.onClick}
    >
      <div class="flow-node__content">
        <div class="flow-node__header">
          <span class="flow-node__type">{props.type}</span>
          <span class="flow-node__source">{props.source}</span>
        </div>
        <div class="flow-node__name">{props.name}</div>
      </div>
      <Show when={props.hasChildren}>
        <div class="flow-node__connector"></div>
      </Show>
    </div>
  );
};

interface FlowChartProps {
  actions: Action[];
  selectedAction?: string;
  onActionSelect?: (name: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddAction?: (path: number[], index: number) => void;
  onRemoveAction?: (path: number[], index: number) => void;
  onToggleEnabled?: (path: number[], index: number) => void;
}

interface MenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  path: number[];
  index: number;
}

export const FlowChart: Component<FlowChartProps> = (props) => {
  let draggedIndex: number | null = null;
  const [dropTarget, setDropTarget] = createSignal<number | null>(null);
  const [menuState, setMenuState] = createSignal<MenuState>();
  let dropTimeout: number;

  const handleDragStart = (index: number, e: DragEvent) => {
    draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (index: number, e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    
    // Clear any existing timeout
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }

    // Set a new timeout to show the drop target after a short delay
    dropTimeout = window.setTimeout(() => {
      if (draggedIndex !== null && draggedIndex !== index) {
        setDropTarget(index);
      }
    }, 200);
  };

  const handleDragLeave = () => {
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }
    setDropTarget(null);
  };

  const handleDrop = (index: number, e: DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      props.onReorder?.(draggedIndex, index);
    }
    draggedIndex = null;
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }
    setDropTarget(null);
  };

  const renderAction = (action: Action, index: number, parentPath: number[] = []) => {
    const hasChildren = action.type === "CONDITIONAL" && action.actions?.length > 0;
    const currentPath = [...parentPath, index];
    
    return (
      <div 
        class="flow-item"
        classList={{ "flow-item--drop-target": dropTarget() === index }}
        draggable={parentPath.length === 0}
        onDragStart={(e) => handleDragStart(index, e)}
        onDragOver={(e) => handleDragOver(index, e)}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(index, e)}
      >
        <button 
          class="flow-add-button" 
          onClick={() => props.onAddAction?.(parentPath, index)}
        >
          <span class="flow-add-button__icon">+</span>
        </button>
        <div class="flow-node" classList={{ 
          "flow-node--selected": props.selectedAction === action.name,
          "flow-node--disabled": !action.enabled,
          "flow-node--draggable": parentPath.length === 0
        }}>
          <div class="flow-node__drag-handle">⋮⋮</div>
          <div class="flow-node__content" onClick={() => props.onActionSelect?.(action.name)}>
            <div class="flow-node__header">
              <span class="flow-node__type">{action.type}</span>
              <span class="flow-node__source">{action.source}</span>
            </div>
            <div class="flow-node__name">{action.name}</div>
            {action.type === "Function" && action.keyValues && (
              <div class="flow-node__key-values">
                {Object.entries(action.keyValues).map(([key, value]) => (
                  <div class="flow-node__key-value">
                    <span class="flow-node__key">{key}:</span>
                    <span class="flow-node__value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            class="flow-node__menu-button"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setMenuState({
                isOpen: true,
                position: { x: rect.right + 8, y: rect.top },
                path: parentPath,
                index: index
              });
            }}
          >
            ⋮
          </button>
        </div>
        <Show when={hasChildren}>
          <div class="flow-branch">
            <For each={action.actions}>
              {(childAction, i) => renderAction(childAction, i(), currentPath)}
            </For>
            <button 
              class="flow-add-button" 
              onClick={() => props.onAddAction?.(currentPath, action.actions?.length ?? 0)}
            >
              <span class="flow-add-button__icon">+</span>
            </button>
          </div>
        </Show>
      </div>
    );
  };

  const menu = menuState();
  const menuAction = menu ? props.actions[menu.index] : null;

  return (
    <div class="flow-chart">
      <For each={props.actions}>
        {(action, i) => renderAction(action, i())}
      </For>
      <Show when={menu && menuAction}>
        <ActionMenu
          isOpen={true}
          onClose={() => setMenuState(undefined)}
          position={menu!.position}
          canRemove={menuAction!.source === "API"}
          isEnabled={menuAction!.enabled}
          onRemove={() => props.onRemoveAction?.(menu!.path, menu!.index)}
          onToggleEnabled={() => props.onToggleEnabled?.(menu!.path, menu!.index)}
        />
      </Show>
    </div>
  );
};