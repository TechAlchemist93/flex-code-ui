import { createAsync, useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { fetchUseCaseById } from "../../requests";
import { createQuery } from "@tanstack/solid-query";
import { FlowChart } from "../../patterns";
import "./styles.scss";

const UseCase = () => {
  const params = useParams<{ id: string }>();

  const useCase = createQuery(() => ({
    queryKey: ["fetchUseCaseById", params.id],
    queryFn: ({ signal }) => fetchUseCaseById(params.id, signal),
    staleTime: 1000 * 60 * 5,
  }));

  return (
    <div class="use-case">
      <Switch>
        <Match when={useCase.error}>
          <p class="use-case__error">Uh oh! There was an error.</p>
        </Match>
        <Match when={useCase.status === "success"}>
          <h1 class="use-case__title">{useCase.data.name}</h1>
          <FlowChart actions={useCase.data.actions} />
        </Match>
      </Switch>
    </div>
  );
};

export default UseCase;
