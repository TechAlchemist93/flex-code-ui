import { isObject } from "./object";

export const isUseCaseWorkflow = (value: unknown) =>
  isObject(value) && "name" in value && "source" in value && "params" in value;

export const isUseCase = (value: unknown): value is UseCase =>
  isObject(value) && "name" in value && "workflows" in value;
