import { Component } from "solid-js";
import { Router } from "@solidjs/router";
import routes from "./routes";
import { Layout } from "./layout";
import { QueryClientProvider } from "@tanstack/solid-query";
import { client } from "./utils";

const App: Component = () => {
  return (
    <QueryClientProvider client={client}>
      <Router root={Layout}>{routes}</Router>
    </QueryClientProvider>
  );
};

export default App;
