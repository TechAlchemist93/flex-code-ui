import { unwrapFetch } from "./utils";

/**
 * @summary Retrieves all available actions and their details.
 */
export const fetchActions = async (): Promise<ActionDetails[]> =>
  unwrapFetch<ActionDetails[]>(fetch("http://localhost:8080/actions/all"));

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
  unwrapFetch<UseCase>(fetch(`http://localhost:8080/usecases/${encodeURIComponent(name)}`, { signal }));

export const updateUseCase = async (useCase: UseCase): Promise<UseCase> =>
  unwrapFetch<UseCase>(fetch(`http://localhost:8080/usecases/${encodeURIComponent(useCase.name)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(useCase),
  }));

/**
 * @summary Retrieves all use-case names by fetching all use cases and mapping their names.
 * This is used for navigation items.
 */
export const fetchUseCaseNames = async (): Promise<string[]> => {
  const useCases = await fetchUseCases();
  return useCases.map(useCase => useCase.name);
};
