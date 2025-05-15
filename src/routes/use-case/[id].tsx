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
    // If path is empty, return the root actions list
    if (path.length === 0) {
      return actions;
    }

    // Otherwise traverse the path
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
    const actions = localActions();
    const updatedActions = [...actions];
    const [movedAction] = updatedActions.splice(fromIndex, 1);
    updatedActions.splice(toIndex, 0, JSON.parse(JSON.stringify(movedAction)));
    setLocalActions(updatedActions);
    setHasChanges(true);
  };

  const handleRemoveAction = (path: number[], index: number) => {
    const updatedActions = JSON.parse(JSON.stringify(localActions()));
    
    // If it's a root-level action
    if (path.length === 0) {
      updatedActions.splice(index, 1);
      setLocalActions(updatedActions);
      setHasChanges(true);
      return;
    }
    
    // For nested actions
    let current = updatedActions;
    for (let i = 0; i < path.length; i++) {
      const pathIndex = path[i];
      if (current[pathIndex]?.type === "CONDITIONAL") {
        current = current[pathIndex].actions;
      } else {
        return;
      }
    }
    
    current.splice(index, 1);
    setLocalActions(updatedActions);
    setHasChanges(true);
  };

  const updateActionAtPath = (path: number[], index: number, updater: (action: Action) => void) => {
    const updatedActions = JSON.parse(JSON.stringify(localActions()));
    
    // If it's a root-level action
    if (path.length === 0) {
      if (updatedActions[index]) {
        const action = updatedActions[index];
        updater(action);
        setLocalActions(updatedActions);
        setHasChanges(true);
      }
      return;
    }
    
    // For nested actions
    let current = updatedActions;
    for (let i = 0; i < path.length; i++) {
      const pathIndex = path[i];
      if (current[pathIndex]?.type === "CONDITIONAL") {
        current = current[pathIndex].actions;
      } else {
        console.log('Invalid path:', path);
        return;
      }
    }
    
    if (current[index]) {
      const action = current[index];
      updater(action);
      setLocalActions(updatedActions);
      setHasChanges(true);
    }
  };

  const handleToggleEnabled = (path: number[], index: number) => {
    console.log('Toggle handler called:', { path, index });
    updateActionAtPath(path, index, (action) => {
      action.enabled = !action.enabled;
    });
  };

  const handleParamChange = (path: number[], index: number, paramKey: string, value: string) => {
    updateActionAtPath(path, index, (action) => {
      if (!action.params) {
        action.params = {};
      }
      action.params[paramKey] = value;
    });
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
              onParamChange={handleParamChange}
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
