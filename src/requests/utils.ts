export const unwrapFetch = async <T>(
  response: Promise<Response>
): Promise<T> => {
  const resp = await response;

  if (!resp.ok) {
    throw Error(`${resp.url} returned status ${resp.status}.`);
  }

  return resp.json();
};
