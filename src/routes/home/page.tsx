import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToggleButton } from "../../patterns/Button";

export * from "./route";

export const Home = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to flex-code!</h1>
      <div style={{ "margin-top": "20px" }}>
        <ToggleButton
          onToggle={(enabled) => {
            console.log("Action is now:", enabled ? "enabled" : "disabled");
          }}
        />
      </div>
    </div>
  );
};
