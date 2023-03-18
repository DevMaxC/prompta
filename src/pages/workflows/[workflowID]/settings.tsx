import { useRouter } from "next/router";
import { Nav } from "~/components/NavBar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Visible } from "@prisma/client";

export default function Settings() {
  const router = useRouter();
  const { workflowID } = router.query;

  const workflowQuery = api.workflow.getWorkflow.useQuery(
    { id: workflowID as string },
    {
      enabled: !!workflowID,
    }
  );

  const updateNameMutation = api.workflow.updateName.useMutation();
  const updateVisibilityMutation = api.workflow.updateVisible.useMutation();

  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
        <h1 className="">Workflow Settings</h1>
        <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 drop-shadow">
          <Label className="flex-none">Name</Label>
          <Input
            onInput={(e) =>
              updateNameMutation.mutate({
                id: workflowID as string,
                name: (e.target as HTMLInputElement).value,
              })
            }
            defaultValue={workflowQuery.data?.name}
          />
        </div>
        <div className="flex flex-col rounded-lg border bg-white p-4 drop-shadow">
          <Label className="mb-2 flex-none">Visibility</Label>
          <p className=" text-sm text-gray-500">
            Who can view this workflow. If set to private, only you can view.
          </p>
          <p className=" text-sm text-gray-500">
            Private functions are perfect for executions you want on the
            backend.
          </p>
          <p className=" mb-3 text-sm text-gray-500">
            Public functions are for workflows you want to allow others to use
            without a backend. For instance a VS Code extension which has this
            workflow integrated.
          </p>

          {workflowQuery.data && (
            <Select
              defaultValue={
                workflowQuery.data?.visible === "PRIVATE" ? "Private" : "Public"
              }
              onValueChange={(value) =>
                updateVisibilityMutation.mutate({
                  id: workflowID as string,
                  visible: value === "Private" ? "PRIVATE" : "PUBLIC",
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border bg-white p-4 drop-shadow">
          <Label className="flex-none">Payment (Coming Soon)</Label>
          <p className="text-sm text-gray-500">
            Who will pay for the workflow execution. If set to pay personally,
            you will absorb all costs from openAI completions. If set to token
            holder, any public user can compensate your workflow execution.
          </p>
          <p className="text-sm text-gray-500">
            Use with public workflows to allow others to compensate your
            workflow. May have negative effects if used with private workflows.
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Ensure you tell users how much they will be charged.
          </p>
          <div className="mb-4 flex flex-col gap-2">
            <Label>Who will pay for the workflow execution.</Label>
            <Select disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pay Personally" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personally">Pay Personally</SelectItem>
                <SelectItem value="TokenHolder">Token Holder Pays</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Percentage Markup to apply.</Label>
            <Input
              disabled
              type={"number"}
              className="w-[180px]"
              placeholder="0%"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 drop-shadow">
          <Label className="flex-none">Usage Cap (Coming Soon)</Label>
        </div>
      </div>
    </main>
  );
}
