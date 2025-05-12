import { createAsync, useParams } from "@solidjs/router";
import { Match, Switch, createSignal } from "solid-js";
import { fetchActions, fetchUseCaseById } from "../../requests";
import { createQuery } from "@tanstack/solid-query";
import { ActionDetails, ActionSelector, FlowChart } from "../../patterns";
import "./styles.scss";

const UseCase = () => {
  const params = useParams<{ id: string }>();
  const [selectedAction, setSelectedAction] = createSignal<string>();
  const [addingAtIndex, setAddingAtIndex] = createSignal<number>();

  const useCase = createQuery(() => ({
    queryKey: ["fetchUseCaseById", params.id],
    queryFn: ({ signal }) => fetchUseCaseById(params.id, signal),
    staleTime: 1000 * 60 * 5,
  }));

  const actions = createQuery(() => ({
    queryKey: ["fetchActions"],
    queryFn: fetchActions,
    staleTime: 1000 * 60 * 5,
  }));

  const selectedActionDetails = () => {
    const selected = selectedAction();
    if (!selected || !actions.data) return undefined;
    return actions.data.find(action => action.name === selected);
  };

  const handleAddAction = () => {
    setAddingAtIndex(props.actions?.length ?? 0);
  };

  const handleActionSelect = (action: ActionDetails) => {
    // Here you would make an API call to update the use case
    console.log("Adding action", action.name);
    setAddingAtIndex(undefined);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    // Here you would make an API call to update the use case
    console.log("Reordering action from", fromIndex, "to", toIndex);
  };

  return (
    <div class="use-case">
      <Switch>
        <Match when={useCase.error}>
          <p class="use-case__error">Uh oh! There was an error.</p>
        </Match>
        <Match when={useCase.status === "success"}>
          <h1 class="use-case__title">{useCase.data.name}</h1>
          <div class="use-case__content">
            <FlowChart 
              actions={useCase.data.actions} 
              selectedAction={selectedAction()}
              onActionSelect={setSelectedAction}
              onReorder={handleReorder}
            />
            <ActionDetails action={selectedActionDetails()} />
          </div>
          <button class="use-case__add-button" onClick={handleAddAction}>
            <span class="use-case__add-button-icon">+</span>
            Add Action
          </button>
          <Show when={addingAtIndex() !== undefined && actions.data}>
            <ActionSelector
              actions={actions.data}
              onSelect={handleActionSelect}
            />
          </Show>
        </Match>
      </Switch>
    </div>
  );
};

export default UseCase;
