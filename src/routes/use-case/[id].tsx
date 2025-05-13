import { createAsync, useParams } from "@solidjs/router";
import { Match, Show, Switch, createSignal, createEffect } from "solid-js";
import { fetchActions, fetchUseCaseById, updateUseCase } from "../../requests";
import { createQuery } from "@tanstack/solid-query";
import { ActionSelector, FlowChart } from "../../patterns";
import { ActionDetailsModal } from "../../patterns/ActionDetailsModal";
import { ModalRef } from "../../patterns/Modal";
import "./styles.scss";

const UseCase = () => {
  const params = useParams<{ id: string }>();
  const [selectedAction, setSelectedAction] = createSignal<string>();
  let detailsModalRef: ModalRef;
  interface AddActionTarget {
    path: number[];  // Path to the parent action list (empty for root)
    index: number;   // Index where to insert the new action
  }
  
  const [addTarget, setAddTarget] = createSignal<AddActionTarget>();
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

  const handleAddAction = (path: number[] = [], index: number) => {
    setAddTarget({ path, index });
  };

  const getActionListAtPath = (actions: Action[], path: number[]): Action[] => {
    let current = actions;
    for (const index of path) {
      const action = current[index];
      if (action?.type === "CONDITIONAL" && Array.isArray(action.actions)) {
        current = action.actions;
      } else {
        return [];
      }
    }
    return current;
  };

  const handleActionSelect = (action: ActionDetails) => {
    const target = addTarget();
    if (!target) return;

    const newAction: Action = {
      name: action.name,
      type: action.type,
      source: "API",
      enabled: true,
      ...(action.type === "CONDITIONAL" ? { actions: [] } : {})
    };

    const updatedActions = [...localActions()];
    const targetList = getActionListAtPath(updatedActions, target.path);
    
    if (targetList) {
      targetList.splice(target.index, 0, newAction);
      setLocalActions(updatedActions);
      setHasChanges(true);
    }
    
    setAddTarget(undefined);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updatedActions = [...localActions()];
    const [movedAction] = updatedActions.splice(fromIndex, 1);
    updatedActions.splice(toIndex, 0, movedAction);
    setLocalActions(updatedActions);
    setHasChanges(true);
  };

  const handleRemoveAction = (path: number[], index: number) => {
    const updatedActions = [...localActions()];
    const targetList = getActionListAtPath(updatedActions, path);
    if (targetList) {
      targetList.splice(index, 1);
      setLocalActions(updatedActions);
      setHasChanges(true);
    }
  };

  const handleToggleEnabled = (path: number[], index: number) => {
    const updatedActions = [...localActions()];
    const targetList = getActionListAtPath(updatedActions, path);
    if (targetList) {
      const action = targetList[index];
      if (action) {
        action.enabled = !action.enabled;
        setLocalActions(updatedActions);
        setHasChanges(true);
      }
    }
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
          <h1 class="use-case__title">{useCase.data.name}</h1>
          <div class="use-case__content">
            <FlowChart 
              actions={localActions()} 
              selectedAction={selectedAction()}
              onActionSelect={(name) => {
                setSelectedAction(name);
                detailsModalRef.open();
              }}
              onReorder={handleReorder}
              onAddAction={handleAddAction}
              onRemoveAction={handleRemoveAction}
              onToggleEnabled={handleToggleEnabled}
            />
            <ActionDetailsModal 
              action={selectedActionDetails()}
              ref={(r) => {
                detailsModalRef = r;
                return r;
              }}
            />
          </div>
          <Show when={hasChanges()}>
            <button 
              class="use-case__save-button" 
              onClick={handleSave}
              disabled={isSaving()}
            >
              {isSaving() ? 'Saving...' : 'Save Changes'}
            </button>
          </Show>
          <Show when={actions.data}>
            <ActionSelector
              actions={actions.data}
              onSelect={handleActionSelect}
              onClose={() => setAddTarget(undefined)}
              isOpen={addTarget() !== undefined}
            />
          </Show>
        </Match>
      </Switch>
    </div>
  );
};

export default UseCase;
