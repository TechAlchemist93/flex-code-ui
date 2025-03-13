/* @refresh reload */
import { render } from "solid-js/web";
import "./styles.scss";

import App from "./App";
import { worker } from "./mocks";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

if (import.meta.env.DEV) {
  worker.start().then(() => render(() => <App />, root!));
} else {
  render(() => <App />, root!);
}
