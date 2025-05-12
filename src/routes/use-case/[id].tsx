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
          <p>Uh oh! There was an error.</p>
        </Match>
        <Match when={useCase.status === "success"}>
          <div class="use-case__header">
            <h1 class="use-case__title">{useCase.data.name}</h1>
            <div class="use-case__types">
              <span class="use-case__type">Request: {useCase.data.requestType}</span>
              <span class="use-case__type">Response: {useCase.data.responseType}</span>
            </div>
          </div>
          <FlowChart actions={useCase.data.actions} />
        </Match>
      </Switch>
    </div>
  );
};

export default UseCase;
