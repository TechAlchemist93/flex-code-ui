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
  onAddAction?: (index: number) => void;
}

export const FlowChart: Component<FlowChartProps> = (props) => {
  const renderAddButton = (index: number) => (
    <button 
      class="flow-add-button"
      onClick={() => props.onAddAction?.(index)}
    >
      <span class="flow-add-button__icon">+</span>
      <span class="flow-add-button__text">Add Action</span>
    </button>
  );

  const renderAction = (action: Action, index: number, isNested = false) => {
    const hasChildren = action.type === "CONDITIONAL" && action.actions?.length > 0;
    
    return (
      <div class="flow-item">
        <Show when={!isNested}>
          {renderAddButton(index)}
        </Show>
        <FlowChartNode
          name={action.name}
          type={action.type}
          source={action.source}
          enabled={action.enabled}
          hasChildren={hasChildren}
          selected={props.selectedAction === action.name}
          onClick={() => props.onActionSelect?.(action.name)}
        />
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
      <Show when={props.actions.length === 0}>
        {renderAddButton(0)}
      </Show>
      <For each={props.actions}>
        {(action, i) => renderAction(action, i())}
      </For>
      <Show when={props.actions.length > 0}>
        {renderAddButton(props.actions.length)}
      </Show>
    </div>
  );
};