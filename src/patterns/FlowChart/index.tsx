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
}

export const FlowChart: Component<FlowChartProps> = (props) => {
  const renderAction = (action: Action) => {
    const hasChildren = action.type === "CONDITIONAL" && action.actions?.length > 0;
    
    return (
      <div class="flow-item">
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
              {(childAction) => renderAction(childAction)}
            </For>
          </div>
        </Show>
      </div>
    );
  };

  return (
    <div class="flow-chart">
      <For each={props.actions}>
        {(action) => renderAction(action)}
      </For>
    </div>
  );
};