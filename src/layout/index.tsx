import { type ParentComponent } from "solid-js";
import { Nav } from "./Nav";
import "./styles.scss";

export const Layout: ParentComponent = ({ children }) => {
  return (
    <div class="layout">
      <Nav />
      {children}
    </div>
  );
};
