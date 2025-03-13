import { ParentComponent } from "solid-js";
import "./styles.scss";

type Props = {
  isNested?: boolean;
};

export const Tree: ParentComponent<Props> = (props) => {
  return (
    <ul class="list list--tree" classList={{ "list--nested": props.isNested }}>
      {props.children}
    </ul>
  );
};
