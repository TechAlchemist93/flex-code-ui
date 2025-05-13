import { type ParentComponent, type JSX, createSignal, Show } from "solid-js";
import { Button } from "./index";
import { Tooltip } from "@kobalte/core";

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
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button
          {...props}
          onClick={handleClick}
          class={`btn toggle-btn ${enabled() ? "enabled" : "disabled"}`}
        >
          <Show when={enabled()} fallback={<i class="fas fa-power-off" />}>
            <i class="fas fa-power-off" />
          </Show>
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {enabled() ? "Disable" : "Enable"}
      </Tooltip.Content>
    </Tooltip.Root>
  );
};