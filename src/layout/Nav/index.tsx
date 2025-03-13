import { A } from "@solidjs/router";
import "./styles.scss";
import { createResource, For } from "solid-js";
import { fetchUseCaseNames } from "../../requests";

export const Nav = () => {
  const [useCaseNames] = createResource(fetchUseCaseNames);

  return (
    <nav class="nav">
      <h3>Use Cases</h3>
      <ul class="nav__links">
        <For each={useCaseNames()}>
          {(name) => (
            <li>
              <A href={`/use-case/${name}`} class="nav__link">
                {name}
              </A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
};
