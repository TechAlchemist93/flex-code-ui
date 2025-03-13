import { Button } from "../../../patterns";
import { Tree, TreeItem } from "../../../patterns/Tree";
import { type Component, For } from "solid-js";
import { isUseCaseWorkflow } from "../../../typeguards";

/**
 * @summary A workflow tree component that recursively builds the workflow
 * tree, nesting child worlkflows infinitely. FOREVER.
 *
 * @param props
 */
export const UseCaseWorkflow: Component<{
  workflows: UseCaseWorkflow[];
  id: string;
}> = (props) => {
  return (
    <Tree isNested>
      <For each={props.workflows}>
        {(workflow) => (
          <TreeItem>
            <Button href={`/use-case/${props.id}/verifyEmailUnique`}>
              {workflow.name}
            </Button>
            {Array.isArray(workflow.params) &&
              workflow.params.length > 0 &&
              isUseCaseWorkflow(workflow.params[0]) && (
                <UseCaseWorkflow workflows={workflow.params} id={props.id} />
              )}
          </TreeItem>
        )}
      </For>
    </Tree>
  );
};
