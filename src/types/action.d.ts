interface FunctionParam {
  name: string;
  type: string;
  ctxKey?: string;
  construct?: boolean;
  nullable: boolean;
}

interface BaseActionDetails {
  name: string;
  type: string;
}

interface TaskDetails extends BaseActionDetails {
  type: "Task";
  inputs: FunctionParam[];
  outputs: FunctionParam[];
}

interface WorkflowDetails extends BaseActionDetails {
  type: "Workflow";
  inputs: FunctionParam[];
  outputs: FunctionParam[];
  actions: ActionDetails[];
}

interface FunctionDetails extends BaseActionDetails {
  type: "Function";
  params: FunctionParam[];
  keyValues?: Record<string, string>;
}

interface ConditionalDetails extends BaseActionDetails {
  type: "Conditional";
  inputs: FunctionParam[];
}

type ActionDetails = TaskDetails | WorkflowDetails | FunctionDetails | ConditionalDetails;