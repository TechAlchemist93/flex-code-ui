import { createAsync, useParams } from "@solidjs/router";
import { Match, Show, Switch, createSignal, createEffect } from "solid-js";
import { fetchActions, fetchUseCaseById, updateUseCase } from "../../requests";
import { createQuery } from "@tanstack/solid-query";
import { ActionDetails, ActionSelector, FlowChart } from "../../patterns";
import "./styles.scss";

const UseCase = () => {
  const params = useParams<{ id: string }>();
  const [selectedAction, setSelectedAction] = createSignal<string>();
  const [addingAtIndex, setAddingAtIndex] = createSignal<number>();
  const [localActions, setLocalActions] = createSignal<Action[]>([]);
  const [hasChanges, setHasChanges] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

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

  // Initialize local actions when useCase data is loaded
  createEffect(() => {
    if (useCase.data?.actions) {
      setLocalActions(useCase.data.actions);
    }
  });

  const selectedActionDetails = () => {
    const selected = selectedAction();
    if (!selected || !actions.data) return undefined;
    return actions.data.find(action => action.name === selected);
  };

  const handleAddAction = () => {
    setAddingAtIndex(localActions()?.length ?? 0);
  };

  const handleActionSelect = (action: ActionDetails) => {
    const index = addingAtIndex();
    if (index === undefined) return;

    const newAction: Action = {
      name: action.name,
      type: action.type,
      source: "API",
      enabled: true,
      ...(action.type === "CONDITIONAL" ? { actions: [] } : {})
    };

    const updatedActions = [...localActions()];
    updatedActions.splice(index, 0, newAction);
    setLocalActions(updatedActions);
    setHasChanges(true);
    setAddingAtIndex(undefined);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updatedActions = [...localActions()];
    const [movedAction] = updatedActions.splice(fromIndex, 1);
    updatedActions.splice(toIndex, 0, movedAction);
    setLocalActions(updatedActions);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!useCase.data) return;
    
    setIsSaving(true);
    try {
      await updateUseCase({
        ...useCase.data,
        actions: localActions()
      });
      setHasChanges(false);
      useCase.refetch();
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="use-case">
      <Switch>
        <Match when={useCase.error}>
          <p class="use-case__error">Uh oh! There was an error.</p>
        </Match>
        <Match when={useCase.status === "success"}>
          <div class="use-case__header">
            <h1 class="use-case__title">{useCase.data.name}</h1>
            <Show when={hasChanges()}>
              <button 
                class="use-case__save-button" 
                onClick={handleSave}
                disabled={isSaving()}
              >
                {isSaving() ? 'Saving...' : 'Save Changes'}
              </button>
            </Show>
          </div>
          <div class="use-case__content">
            <FlowChart 
              actions={localActions()} 
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
          <Show when={actions.data}>
            <ActionSelector
              actions={actions.data}
              onSelect={handleActionSelect}
              onClose={() => setAddingAtIndex(undefined)}
              isOpen={addingAtIndex() !== undefined}
            />
          </Show>
        </Match>
      </Switch>
    </div>
  );
};

export default UseCase;
