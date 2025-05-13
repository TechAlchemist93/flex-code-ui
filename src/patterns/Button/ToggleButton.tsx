import { type ParentComponent, type JSX, createSignal } from "solid-js";
import { Button } from "./Button";

type Props = {
  initialEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

export const ToggleButton: ParentComponent<Props> = (props) => {
  const [enabled, setEnabled] = createSignal(props.initialEnabled ?? true);

  const handleClick = () => {
    const newState = !enabled();
    setEnabled(newState);
    props.onToggle?.(newState);
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      class={`btn toggle-btn ${enabled() ? "enabled" : "disabled"}`}
      title={enabled() ? "Disable" : "Enable"}
    >
      <i class="fas fa-power-off" style={{ opacity: enabled() ? "1" : "0.8" }} />
    </Button>
  );
};