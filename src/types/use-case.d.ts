type UseCaseWorkflow = {
  name: string;
  source: "CODE" | "API";
  params: string | number | boolean | UseCaseWorkflow[];
  enabled: boolean;
};

type UseCase = {
  name: "AdminCreateUseCase";
  workflows: UseCaseWorkflow[];
};
