import { type RouteDefinition } from "@solidjs/router";
import { lazy } from "solid-js";
import { fetchUseCaseById } from "../../requests";
import { client } from "../../utils";

/**
 * @summary Defines the route for use-case. Opted for the config route instead of
 * the shitty JSX router.
 */
export const USE_CASE: RouteDefinition = {
  path: "/use-case/:id",
  component: lazy(() => import("./[id]")),
  preload: (args) =>
    client.prefetchQuery({
      queryKey: ["fetchUseCaseById", args.params.id],
      queryFn: ({ signal }) => fetchUseCaseById(args.params.id, signal),
      staleTime: 1000 * 60 * 5,
    }),
};
