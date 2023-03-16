import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

export default function Workflows() {
  const allFlows = api.workflow.getAll.useQuery();
  const createFlow = api.workflow.create.useMutation({
    onSuccess: (data) => {
      allFlows.refetch();
    },
  });
  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-end justify-between">
          <h1 className="text-xl font-semibold">
            Workflows - {allFlows.data?.length || 0}
          </h1>
          <Button
            onClick={() => createFlow.mutate({ name: "New Workflow" })}
            variant={"default"}
          >
            Create Workflow
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {allFlows.data?.map((flow) => (
            <div key={flow.id} className="rounded-lg border bg-white p-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">{flow.name}</h2>
                <div className="flex space-x-2">
                  <Button variant={"default"}>Edit</Button>
                  <Button variant={"destructive"}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
