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
  availableActions?: ActionDetails[];  // List of available actions from the API
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

  const isDescendant = (parentPath: number[], parentIndex: number, childPath: number[], childIndex: number): boolean => {
    // Check if childPath starts with parentPath + parentIndex
    const parentFullPath = [...parentPath, parentIndex];
    return childPath.length > parentFullPath.length && 
           parentFullPath.every((v, i) => childPath[i] === v);
  };

  const handleDragStart = (path: number[], index: number, e: DragEvent, actionName: string) => {
    draggedState = { path, index };
    setDraggingNodeId(actionName);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (path: number[], index: number, e: DragEvent, isContainer: boolean = false) => {
    e.preventDefault();
    if (!draggedState) return;

    // Prevent dropping into descendants of the dragged item
    if (isDescendant(draggedState.path, draggedState.index, path, index)) {
      e.dataTransfer!.dropEffect = 'none';
      return;
    }

    // Prevent dropping into itself
    const isSameLocation = draggedState.path.length === path.length && 
      draggedState.path.every((v, i) => v === path[i]) && 
      draggedState.index === index;
    
    if (isSameLocation) {
      e.dataTransfer!.dropEffect = 'none';
      return;
    }

    e.dataTransfer!.dropEffect = 'move';
    
    // Clear any existing timeout
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }

    // Set a new timeout to show the drop target after a short delay
    dropTimeout = window.setTimeout(() => {
      setDropTarget({ 
        path, 
        index, 
        type: isContainer ? 'container' : 'position' 
      });
    }, 200);
  };

  const handleDragLeave = () => {
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }
    setDropTarget(null);
  };

  const handleDrop = (path: number[], index: number, e: DragEvent, isContainer: boolean = false) => {
    e.preventDefault();
    if (!draggedState) return;

    const isSameLocation = draggedState.path.length === path.length && 
      draggedState.path.every((v, i) => v === path[i]) && 
      draggedState.index === index;

    if (!isSameLocation) {
      if (isContainer) {
        // When dropping into a conditional block, append to the end of its actions array
        const targetPath = [...path, index];
        const targetIndex = props.actions[index]?.type === "CONDITIONAL" 
          ? (props.actions[index] as ConditionalAction).actions.length 
          : 0;
        props.onReorder?.(draggedState.path, draggedState.index, targetPath, targetIndex);
      } else {
        props.onReorder?.(draggedState.path, draggedState.index, path, index);
      }
    }
    
    draggedState = null;
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    if (dropTimeout) {
      window.clearTimeout(dropTimeout);
    }
    draggedState = null;
    setDropTarget(null);
    setDraggingNodeId(null);
  };

  const renderAction = (action: Action, index: number, parentPath: number[] = [], parentDisabled: boolean = false) => {
    const hasChildren = action.type === "CONDITIONAL" && action.actions?.length > 0;
    const currentPath = [...parentPath, index];
    const isParentDisabled = parentDisabled || (!action.enabled && action.type === "CONDITIONAL");
    
    return (
      <div 
        class="flow-item"
        classList={{ 
          "flow-item--drop-target": (() => {
            const target = dropTarget();
            return target !== null && 
              target.type === 'position' &&
              target.path.length === parentPath.length && 
              target.path.every((v, i) => v === parentPath[i]) && 
              target.index === index;
          })(),
          "flow-item--dragging": draggingNodeId() === action.name
        }}
        draggable={true}
        onDragStart={(e) => handleDragStart(parentPath, index, e, action.name)}
        onDragOver={(e) => handleDragOver(parentPath, index, e)}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(parentPath, index, e)}
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
          "flow-node--parent-disabled": isParentDisabled && action.enabled,
          "flow-node--draggable": true
        }}>
          <div class="flow-node__drag-handle">⋮⋮</div>
          <div class="flow-node__content">
            <div class="flow-node__header">
              <span class="flow-node__type">{action.type}</span>
              <span class="flow-node__source">{action.source}</span>
            </div>
            <div class="flow-node__name">{action.name}</div>
            {action.type === "FUNCTION" && (
              <div class="flow-node__key-values">
                {(() => {
                  // Find the action details from available actions
                  const actionDetails = props.availableActions?.find(a => a.name === action.name) as FunctionDetails | undefined;
                  if (!actionDetails) return null;

                  // Get all parameters that should be displayed
                  const allParams = actionDetails.params.map(param => ({
                    name: param.name,
                    required: !param.nullable,
                    value: action.params?.[param.name] ?? null,
                    type: param.type
                  }));

                  return allParams.map(param => {
                    const isEmpty = param.value === null || param.value === '';
                    
                    return (
                      <div class="flow-node__key-value" classList={{ 'required': param.required, 'empty': isEmpty }}>
                        <span class="flow-node__key" title={`Type: ${param.type}`}>
                          {param.name}:
                        </span>
                        <input
                          type="text"
                          class="flow-node__value-input"
                          classList={{ 'error': param.required && isEmpty }}
                          value={param.value || ''}
                          placeholder={param.required ? 'Required' : 'Optional'}
                          onChange={(e) => {
                            e.stopPropagation();
                            props.onParamChange?.(parentPath, index, param.name, e.currentTarget.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    );
                  });
                })()}
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
            <For each={action.actions}>
              {(childAction, i) => renderAction(childAction, i(), currentPath, isParentDisabled)}
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
        {(action, i) => renderAction(action, i(), [], false)}
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