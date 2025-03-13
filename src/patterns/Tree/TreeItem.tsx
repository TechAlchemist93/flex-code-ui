import { createSignal, Match, type ParentComponent, Switch } from "solid-js";

type Props = {
  isExpandable?: boolean;
};

export const TreeItem: ParentComponent<Props> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(true);

  return (
    <Switch>
      <Match when={props.isExpandable}>
        <li
          class="list__item list__item--connector"
          aria-expanded={isExpanded()}
        >
          <button
            on:click={() => setIsExpanded(!isExpanded())}
            class="list__expandable"
            classList={{ "list__expandable--collapsed": !isExpanded() }}
          ></button>
          <span class="item__title">{props.children[0]}</span>
          {isExpanded() ? props.children[1] : <></>}
        </li>
      </Match>
      <Match when={!props.isExpandable}>
        <li class="list__item list__item--connector">{props.children}</li>
      </Match>
    </Switch>
  );
};
