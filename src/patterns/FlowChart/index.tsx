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
  onReorder?: (fromPath: number[], fromIndex: number, toPath: number[], toIndex: number) => void;
  onAddAction?: (path: number[], index: number) => void;
  onRemoveAction?: (path: number[], index: number) => void;
  onToggleEnabled?: (path: number[], index: number) => void;
  onParamChange?: (path: number[], index: number, paramKey: string, value: string) => void;
  onParamSave?: (path: number[], index: number, params: Record<string, string>) => void;
}

interface MenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  path: number[];
  index: number;
}

export const FlowChart: Component<FlowChartProps> = (props) => {
  interface DragState {
    path: number[];
    index: number;
  }
  
  interface DropTarget {
    path: number[];
    index: number;
    type: 'position' | 'container';
  }
  
  let draggedState: DragState | null = null;
  const [dropTarget, setDropTarget] = createSignal<DropTarget | null>(null);
  const [menuState, setMenuState] = createSignal<MenuState>();
  let dropTimeout: number;

  const [draggingNodeId, setDraggingNodeId] = createSignal<string | null>(null);
  const [dragPreview, setDragPreview] = createSignal<{ path: number[]; index: number; type: 'position' | 'container' } | null>(null);

  const isDescendant = (parentPath: number[], parentIndex: number, childPath: number[], childIndex: number): boolean => {
    // Check if childPath starts with parentPath + parentIndex
    const parentFullPath = [...parentPath, parentIndex];
    return childPath.length > parentFullPath.length && 
           parentFullPath.every((v, i) => childPath[i] === v);
  };

  const getItemPosition = (path: number[], index: number): { top: number; left: number } | null => {
    const item = document.querySelector(`[data-path="${path.join('-')}-${index}"]`);
    if (!item) return null;
    const rect = item.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left
    };
  };

  const [reorderingState, setReorderingState] = createSignal<{
    movingItems: Set<string>;
    direction: 'up' | 'down';
  }>({ movingItems: new Set(), direction: 'up' });

  const calculateTransitionClass = (path: number[], index: number): string => {
    if (!draggedState || !dragPreview()) return '';
    
    const preview = dragPreview()!;
    const isSameList = path.length === preview.path.length && 
                      path.every((v, i) => v === preview.path[i]);
    
    if (!isSameList) return '';
    
    const itemKey = `${path.join('-')}-${index}`;
    const state = reorderingState();
    
    if (!state.movingItems.has(itemKey)) return '';
    
    // Return the appropriate transition class based on direction
    return state.direction === 'up' ? 'move-up' : 'move-down';
  };

  const updateReorderingState = (path: number[], fromIndex: number, toIndex: number) => {
    const movingItems = new Set<string>();
    const direction = fromIndex < toIndex ? 'up' : 'down';
    
    // Calculate which items need to move
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    
    for (let i = start; i <= end; i++) {
      if (i !== fromIndex) { // Don't include the dragged item
        movingItems.add(`${path.join('-')}-${i}`);
      }
    }
    
    setReorderingState({ movingItems, direction });
    
    // Clear the reordering state after animation completes
    setTimeout(() => {
      setReorderingState({ movingItems: new Set(), direction: 'up' });
    }, 300); // Match animation duration
  };

  const handleDragStart = (path: number[], index: number, e: DragEvent, actionName: string) => {
    draggedState = { path, index };
    setDraggingNodeId(actionName);
    
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      
      // Create a custom drag image
      const draggedNode = (e.target as HTMLElement).cloneNode(true) as HTMLElement;
      draggedNode.style.transform = 'scale(0.95)';
      draggedNode.style.opacity = '0.8';
      draggedNode.style.position = 'fixed';
      draggedNode.style.top = '-1000px';
      draggedNode.style.backgroundColor = 'rgba(26, 26, 26, 0.9)';
      draggedNode.style.boxShadow = `
        0 8px 24px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(45, 226, 230, 0.4),
        0 0 48px rgba(45, 226, 230, 0.15)
      `;
      
      document.body.appendChild(draggedNode);
      e.dataTransfer.setDragImage(draggedNode, 0, 0);
      
      // Remove the element after drag starts
      requestAnimationFrame(() => {
        document.body.removeChild(draggedNode);
      });
    }
  };

  const handleDragOver = (path: number[], index: number, e: DragEvent, isContainer: boolean = false) => {
    e.preventDefault();
    if (!draggedState) return;

    // Get the target element and its rect
    const targetEl = e.currentTarget as HTMLElement;
    const rect = targetEl.getBoundingClientRect();
    const mouseY = e.clientY;
    const relativeY = mouseY - rect.top;
    const isUpperHalf = relativeY < rect.height / 2;

    // Prevent dropping into descendants of the dragged item
    if (isDescendant(draggedState.path, draggedState.index, path, index)) {
      e.dataTransfer!.dropEffect = 'none';
      setDragPreview(null);
      setDropTarget(null);
      return;
    }

    // Prevent dropping into itself
    const isSameLocation = draggedState.path.length === path.length && 
      draggedState.path.every((v, i) => v === path[i]) && 
      draggedState.index === index;
    
    if (isSameLocation) {
      e.dataTransfer!.dropEffect = 'none';
      setDragPreview(null);
      setDropTarget(null);
      return;
    }

    e.dataTransfer!.dropEffect = 'move';
    
    // For conditional blocks, always show container drop target
    if (isContainer) {
      const previewState = { path, index, type: 'container' };
      setDragPreview(previewState);
      setDropTarget(previewState);
      return;
    }

    // For regular items, show position-based drop target
    const dropIndex = isUpperHalf ? index : index + 1;
    const previewState = { 
      path, 
      index: dropIndex,
      type: 'position'
    };

    setDragPreview(previewState);
    
    // Clear any existing timeout
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }

    // Set a new timeout to show the drop target after a short delay
    dropTimeout = window.setTimeout(() => {
      setDropTarget(previewState);
    }, 50);
  };

  const handleDragLeave = () => {
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }
    setDropTarget(null);
  };

  const getActionAtPath = (actions: Action[], path: number[]): Action | undefined => {
    let current = actions;
    let result: Action | undefined;
    
    for (let i = 0; i < path.length; i++) {
      const index = path[i];
      const action = current[index];
      if (!action) return undefined;
      
      if (i === path.length - 1) {
        result = action;
      } else if (action.type === "CONDITIONAL") {
        current = action.actions;
      } else {
        return undefined;
      }
    }
    
    return result;
  };

  const handleDrop = (path: number[], index: number, e: DragEvent, isContainer: boolean = false) => {
    e.preventDefault();
    if (!draggedState) return;

    // Prevent dropping into itself or its descendants
    if (isDescendant(draggedState.path, draggedState.index, path, index)) {
      return;
    }

    const isSameLocation = draggedState.path.length === path.length && 
      draggedState.path.every((v, i) => v === path[i]) && 
      draggedState.index === index;

    if (isSameLocation) {
      return;
    }

    if (isContainer) {
      // When dropping into a conditional block
      const targetAction = getActionAtPath(props.actions, [...path, index]);
      if (targetAction?.type !== "CONDITIONAL") {
        return;
      }

      const targetPath = [...path, index];
      const targetIndex = targetAction.actions.length;

      // Trigger reordering animation
      updateReorderingState(draggedState.path, draggedState.index, targetIndex);
      
      // Delay the actual reordering to allow animation to start
      setTimeout(() => {
        props.onReorder?.(draggedState.path, draggedState.index, targetPath, targetIndex);
      }, 50);
    } else {
      // Trigger reordering animation
      updateReorderingState(path, draggedState.index, index);
      
      // Delay the actual reordering to allow animation to start
      setTimeout(() => {
        props.onReorder?.(draggedState.path, draggedState.index, path, index);
      }, 50);
    }
    
    draggedState = null;
    setDropTarget(null);
    setDragPreview(null);
  };

  const handleDragEnd = () => {
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }
    draggedState = null;
    setDropTarget(null);
    setDraggingNodeId(null);
    setDragPreview(null);
  };

  const renderAction = (action: Action, index: number, parentPath: number[] = []) => {
    const hasChildren = action.type === "CONDITIONAL" && action.actions?.length > 0;
    const currentPath = [...parentPath, index];
    
    return (
      <div 
        class="flow-item"
        classList={{ 
          "flow-item--drop-target-above": (() => {
            const target = dropTarget();
            return target !== null && 
              target.type === 'position' &&
              target.path.length === parentPath.length && 
              target.path.every((v, i) => v === parentPath[i]) && 
              target.index === index;
          })(),
          "flow-item--drop-target-below": (() => {
            const target = dropTarget();
            return target !== null && 
              target.type === 'position' &&
              target.path.length === parentPath.length && 
              target.path.every((v, i) => v === parentPath[i]) && 
              target.index === index + 1;
          })(),
          "flow-item--dragging": draggingNodeId() === action.name,
          [calculateTransitionClass(parentPath, index)]: true
        }}
        data-path={`${parentPath.join('-')}-${index}`}
        style={{
          "z-index": draggingNodeId() === action.name ? "2" : "1"
        }}
        draggable={true}
        onDragStart={(e) => handleDragStart(parentPath, index, e, action.name)}
        onDragOver={(e) => handleDragOver(parentPath, index, e)}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(parentPath, index, e)}
      >
        <div class="drop-highlight"></div>
        <div class="drop-line"></div>
        <div class="drop-text">Drop here</div>
        <button 
          class="flow-add-button" 
          onClick={() => props.onAddAction?.(parentPath, index)}
        >
          <span class="flow-add-button__icon">+</span>
        </button>
        <div class="flow-node" classList={{ 
          "flow-node--selected": props.selectedAction === action.name,
          "flow-node--disabled": !action.enabled,
          "flow-node--draggable": true
        }}>
          <div class="flow-node__drag-handle">
            <div class="tooltip">Drag to reorder</div>
            <div class="grip-lines"></div>
          </div>
          <div class="flow-node__content">
            <div class="flow-node__header">
              <span class="flow-node__type">{action.type}</span>
              <span class="flow-node__source">{action.source}</span>
            </div>
            <div class="flow-node__name">{action.name}</div>
            {action.type === "FUNCTION" && action.params && (
              <div class="flow-node__key-values">
                {Object.entries(action.params).map(([key, value]) => (
                  <div class="flow-node__key-value">
                    <span class="flow-node__key">{key}:</span>
                    <input
                      type="text"
                      class="flow-node__value-input"
                      value={value}
                      onChange={(e) => {
                        e.stopPropagation();
                        props.onParamChange?.(parentPath, index, key, e.currentTarget.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            )}
            <div class="flow-node__actions">
              <button 
                class="btn flow-node__action-btn flow-node__action-btn--icon"
                title="Details"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onActionSelect?.(action.name);
                }}
              >
                <i class="fas fa-info-circle" />
              </button>
              <button
                class={`btn flow-node__action-btn flow-node__action-btn--icon ${action.enabled ? 'enabled' : 'disabled'}`}
                title={action.enabled ? "Disable" : "Enable"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (props.onToggleEnabled) {
                    props.onToggleEnabled(parentPath, index);
                    console.log('Toggle clicked:', { path: parentPath, index, newState: !action.enabled });
                  }
                }}
              >
                <i class="fas fa-power-off" />
              </button>
              <button 
                class={`btn flow-node__action-btn flow-node__action-btn--icon ${action.source === "CODE" ? 'disabled' : ''}`}
                title={action.source === "CODE" ? "Cannot remove CODE actions" : "Remove"}
                disabled={action.source === "CODE"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.source !== "CODE") {
                    props.onRemoveAction?.(parentPath, index);
                  }
                }}
              >
                <i class="fas fa-trash" />
              </button>
            </div>
          </div>
        </div>
        <Show when={hasChildren}>
          <div 
            class="flow-branch"
            classList={{
              "flow-branch--drop-target": (() => {
                const target = dropTarget();
                return target !== null && 
                  target.type === 'container' &&
                  target.path.length === parentPath.length && 
                  target.path.every((v, i) => v === parentPath[i]) && 
                  target.index === index;
              })()
            }}
            onDragOver={(e) => handleDragOver(parentPath, index, e, true)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(parentPath, index, e, true)}
          >
            <div class="drop-border"></div>
            <div class="drop-line drop-line--top"></div>
            <div class="drop-line drop-line--bottom"></div>
            <div class="drop-text">
              <i class="fas fa-plus-circle"></i>
              Add to conditional
            </div>
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