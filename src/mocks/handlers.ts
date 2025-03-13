import { http, HttpResponse } from "msw";
import { USE_CASES } from "./use-cases";

export const handlers = [
  http.get("/api/use-cases", () => {
    return HttpResponse.json(USE_CASES);
  }),

  http.get("/api/use-case/:id", ({ params }) => {
    const useCase = USE_CASES.find((entity) => entity.name === params.id);

    if (!useCase) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(useCase);
  }),

  http.get("/api/use-cases/names", () => {
    const useCases = USE_CASES.map((entity) => entity.name);

    return HttpResponse.json(useCases);
  }),
];
