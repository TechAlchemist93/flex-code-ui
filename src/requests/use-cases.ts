import { unwrapFetch } from "./utils";

/**
 * @summary Retrieves all use cases from the backend.
 */
export const fetchUseCases = async (): Promise<UseCase[]> =>
  unwrapFetch<UseCase[]>(fetch("http://localhost:8080/usecases"));

/**
 * @summary Retrieves a use case by its name.
 *
 * @param {string} name Name of the use case.
 *
 * @param {AbortSignal} signal Cancels the request. Great for cancelling on a route change.
 *
 */
export const fetchUseCaseById = async (
  name: string,
  signal: AbortSignal
): Promise<UseCase> =>
  unwrapFetch<UseCase>(fetch(`http://localhost:8080/usecases/${name}`, { signal }));

/**
 * @summary Retrieves all use-case names as an array of strings.
 * This is used for navigation items.
 */
export const fetchUseCaseNames = async (): Promise<string[]> =>
  unwrapFetch<string[]>(fetch(`http://localhost:8080/usecases/names`));
