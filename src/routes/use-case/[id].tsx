import { createAsync, useParams } from "@solidjs/router";
import { Tree, TreeItem } from "../../patterns/Tree";
import { Match, Switch } from "solid-js";
import { fetchUseCaseById } from "../../requests";
import { UseCaseWorkflow } from "./components";
import { createQuery } from "@tanstack/solid-query";

const UseCase = () => {
  const params = useParams<{ id: string }>();

  const useCase = createQuery(() => ({
    queryKey: ["fetchUseCaseById", params.id],
    queryFn: ({ signal }) => fetchUseCaseById(params.id, signal),
    staleTime: 1000 * 60 * 5,
  }));

  return (
    <div>
      <Tree>
        <Switch>
          <Match when={useCase.error}>
            <p>Uh oh! There was an error.</p>
          </Match>
          <Match when={useCase.status === "success"}>
            <TreeItem isExpandable>
              {useCase.data.name}
              {useCase.data.workflows.length > 0 && (
                <UseCaseWorkflow
                  workflows={useCase.data.workflows}
                  id={params.id}
                />
              )}
            </TreeItem>
          </Match>
        </Switch>
      </Tree>
    </div>
  );
};

export default UseCase;
