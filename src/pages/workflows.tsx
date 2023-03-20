import Connect from "~/components/Connect";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { api, getBaseUrl } from "~/utils/api";

import { useRouter } from "next/router";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "~/components/ui/use-toast";
import { ToastAction } from "~/components/ui/toast";
import Link from "next/link";

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

  const [animationParent] = useAutoAnimate();
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
            onClick={() =>
              createFlow.mutate({
                name: "New Workflow " + allFlows.data?.length,
              })
            }
            variant={"default"}
          >
            Create Workflow
          </Button>
        </div>
        <div ref={animationParent} className="mt-4 flex flex-col gap-2">
          {allFlows.data?.map((flow) => (
            <div
              onDoubleClick={() => router.push(`/workflows/${flow.id}`)}
              key={flow.id}
              className=" rounded-lg border bg-white p-4 transition hover:ring-blue-500 hover:ring-opacity-50 hover:drop-shadow-md"
            >
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">{flow.name}</h2>
                <div className="flex space-x-2">
                  <Connect flow={flow} />

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button>More</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Workflow</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href={`/workflows/${flow.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled asChild>
                        <Link href={`/workflows/${flow.id}/usage`}>Usage</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/workflows/${flow.id}/settings`}>
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          toast({
                            title: "Confirm Deletion",
                            description: "This action is irreversible.",
                            variant: "destructive",
                            action: (
                              <ToastAction
                                onClick={() =>
                                  deleteFlow.mutate({ id: flow.id })
                                }
                                altText="Delete Workflow"
                              >
                                Delete Workflow
                              </ToastAction>
                            ),
                          });
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
