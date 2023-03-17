import Connect from "~/components/Connect";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { api, getBaseUrl } from "~/utils/api";

import { useRouter } from "next/router";

export default function Workflows() {
  const allFlows = api.workflow.getAll.useQuery();
  const router = useRouter();
  const createFlow = api.workflow.create.useMutation({
    onSuccess: (data) => {
      allFlows.refetch();
    },
  });

  const deleteFlow = api.workflow.delete.useMutation({
    onSuccess: () => {
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
                  <Connect flow={flow} />

                  <Button
                    onClick={() => router.push(`/workflows/${flow.id}`)}
                    variant={"default"}
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => deleteFlow.mutate({ id: flow.id })}
                    variant={"destructive"}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
