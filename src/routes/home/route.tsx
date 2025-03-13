import { type RouteDefinition } from "@solidjs/router";
import { Home } from "./page";

export const HOME: RouteDefinition = {
  path: "/home",
  component: () => <Home />,
};
