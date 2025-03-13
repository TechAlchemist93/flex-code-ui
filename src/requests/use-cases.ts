import { unwrapFetch } from "./utils";

/**
 * @summary Retrieves all use cases.
 */
export const fetchUseCases = async (): Promise<UseCase[]> =>
  unwrapFetch<UseCase[]>(fetch("/api/use-cases"));

/**
 * @summary Retrieves a use case by its name AKA ID.
 *
 * @param {string} id Name/ID of the workflow.
 *
 * @param {AbortSignal} signal Cancels the request. Great for cancelling on a route change.
 *
 */
export const fetchUseCaseById = async (
  id: string,
  signal: AbortSignal
): Promise<UseCase> =>
  unwrapFetch<UseCase>(fetch(`/api/use-case/${id}`, { signal }));

/**
 * @summary Retrieves all use-case names as an array of strings. Pretty simple,
 * and the only requirement at this point for nav items.
 *
 */
export const fetchUseCaseNames = async (): Promise<string[]> =>
  unwrapFetch<string[]>(fetch(`/api/use-cases/names`));
