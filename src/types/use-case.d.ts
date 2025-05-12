type ActionType = "TASK" | "WORKFLOW" | "FUNCTION" | "CONDITIONAL";
type ActionSource = "CODE" | "API";

interface BaseAction {
  name: string;
  type: ActionType;
  source: ActionSource;
  enabled: boolean;
}

interface TaskAction extends BaseAction {
  type: "TASK";
}

interface WorkflowAction extends BaseAction {
  type: "WORKFLOW";
}

interface FunctionAction extends BaseAction {
  type: "FUNCTION";
  params: Record<string, any>;
}

interface ConditionalAction extends BaseAction {
  type: "CONDITIONAL";
  actions: Action[];
}

type Action = TaskAction | WorkflowAction | FunctionAction | ConditionalAction;

interface UseCase {
  name: string;
  requestType: string;
  responseType: string;
  actions: Action[];
}
