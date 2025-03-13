import {
  type ParentComponent,
  type JSX,
  splitProps,
  mergeProps,
} from "solid-js";
import "./styles.scss";

type Props =
  | ({
      onClick(): void;
    } & JSX.ButtonHTMLAttributes<HTMLButtonElement>)
  | {
      href: string;
      onClick?: () => void;
      type?: string;
    };

export const Button: ParentComponent<Props> = (props) => {
  const _props = mergeProps({ type: "button" }, props);

  const [local, rest] = splitProps(_props, ["onClick"]);

  if ("href" in rest) {
    return <a {...rest} class="btn" on:click={local.onClick} />;
  }

  return <button {...rest} class="btn" on:click={local.onClick} />;
};
