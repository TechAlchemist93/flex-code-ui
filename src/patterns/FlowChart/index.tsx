import { Component, For, Show } from "solid-js";
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
}

export const FlowChart: Component<FlowChartProps> = (props) => {
  let draggedIndex: number | null = null;
  const [dropTarget, setDropTarget] = createSignal<number | null>(null);
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

  const renderAction = (action: Action, index: number, isNested = false) => {
    const hasChildren = action.type === "CONDITIONAL" && action.actions?.length > 0;
    
    return (
      <div 
        class="flow-item"
        classList={{ "flow-item--drop-target": dropTarget() === index }}
        draggable={!isNested}
        onDragStart={(e) => handleDragStart(index, e)}
        onDragOver={(e) => handleDragOver(index, e)}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(index, e)}
      >
        <div class="flow-node" classList={{ 
          "flow-node--selected": props.selectedAction === action.name,
          "flow-node--disabled": !action.enabled,
          "flow-node--draggable": !isNested
        }}>
          <div class="flow-node__drag-handle">⋮⋮</div>
          <div class="flow-node__content" onClick={() => props.onActionSelect?.(action.name)}>
            <div class="flow-node__header">
              <span class="flow-node__type">{action.type}</span>
              <span class="flow-node__source">{action.source}</span>
            </div>
            <div class="flow-node__name">{action.name}</div>
          </div>
        </div>
        <Show when={hasChildren}>
          <div class="flow-branch">
            <For each={action.actions}>
              {(childAction, i) => renderAction(childAction, i(), true)}
            </For>
          </div>
        </Show>
      </div>
    );
  };

  return (
    <div class="flow-chart">
      <For each={props.actions}>
        {(action, i) => renderAction(action, i())}
      </For>
    </div>
  );
};