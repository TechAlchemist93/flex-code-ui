import { Component, For, Match, Show, Switch } from "solid-js";
import { Modal, ModalRef } from "../Modal";
import "./styles.scss";

interface ParamListProps {
  title: string;
  params: FunctionParam[];
}

const ParamList: Component<ParamListProps> = (props) => (
  <div class="param-list">
    <h3 class="param-list__title">{props.title}</h3>
    <For each={props.params}>
      {(param) => (
        <div class="param">
          <div class="param__header">
            <span class="param__name">{param.name}</span>
            <span class="param__type">{param.type}</span>
          </div>
          <div class="param__flags">
            <Show when={param.ctxKey}>
              <span class="param__flag">Context: {param.ctxKey}</span>
            </Show>
            <Show when={param.construct}>
              <span class="param__flag">Construct</span>
            </Show>
            <Show when={!param.nullable}>
              <span class="param__flag">Required</span>
            </Show>
          </div>
        </div>
      )}
    </For>
  </div>
);

interface ActionDetailsModalProps {
  action: ActionDetails | undefined;
  ref: (params: ModalRef) => ModalRef;
}

export const ActionDetailsModal: Component<ActionDetailsModalProps> = (props) => {
  return (
    <Modal ref={props.ref}>
      <div class="action-details-modal">
        <Show when={props.action} fallback={<p class="action-details-modal__empty">No action selected</p>}>
          <div class="action-details-modal__header">
            <h2 class="action-details-modal__title">{props.action?.name}</h2>
            <span class="action-details-modal__type">{props.action?.type}</span>
          </div>

          <Switch>
            <Match when={props.action?.type === "Task"}>
              <ParamList title="Inputs" params={(props.action as TaskDetails).inputs} />
              <ParamList title="Outputs" params={(props.action as TaskDetails).outputs} />
            </Match>

            <Match when={props.action?.type === "Workflow"}>
              <ParamList title="Inputs" params={(props.action as WorkflowDetails).inputs} />
              <ParamList title="Outputs" params={(props.action as WorkflowDetails).outputs} />
            </Match>

            <Match when={props.action?.type === "Function"}>
              <ParamList title="Parameters" params={(props.action as FunctionDetails).params} />
              <Show when={(props.action as FunctionDetails).keyValues}>
                <div class="param-list">
                  <h3 class="param-list__title">Key/Value Pairs</h3>
                  <For each={Object.entries((props.action as FunctionDetails).keyValues || {})}>
                    {([key, value]) => (
                      <div class="param">
                        <div class="param__header">
                          <span class="param__name">{key}</span>
                          <span class="param__type">{value}</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Match>

            <Match when={props.action?.type === "Conditional"}>
              <ParamList title="Inputs" params={(props.action as ConditionalDetails).inputs} />
            </Match>
          </Switch>
        </Show>
      </div>
    </Modal>
  );
};