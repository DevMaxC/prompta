import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/seperator";
import { api } from "~/utils/api";
import {
  flow,
  flowBlock,
  flowFetch,
  flowRequest,
  flowResponse,
  flowRun,
} from "~/utils/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Connect from "~/components/Connect";

export default function WorkflowEditor() {
  const router = useRouter();
  const ID = router.query.workflowID as string;

  const getAllBlocks = api.blocks.getAllBlocks.useQuery();

  const getWorkflow = api.workflow.getWorkflow.useQuery(
    {
      id: ID,
    },
    {
      enabled: !!ID,
    }
  );

  const updateFlow = api.workflow.updateFlow.useMutation();

  const [flow, setFlow] = useState<flow>();

  useEffect(() => {
    if (getWorkflow.data) {
      setFlow(getWorkflow.data.flow as flow);
    }
  }, [getWorkflow.data]);

  useEffect(() => {
    if (flow) {
      updateFlow.mutate({
        id: ID,
        flow: flow,
      });
    }
  }, [flow]);

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-slate-100">
      <div className="flex h-full flex-col">
        <Nav />
        <div className="flex h-full flex-row">
          <div className="flex h-full w-1/4 min-w-fit flex-col border-r ">
            <div className="px-2 py-1">
              <Label className="text-xs">Components</Label>
              <Separator className="mt-2" />
            </div>

            <div className="flex flex-col">
              {flow &&
                flow.blocks.map((block, index) => {
                  return (
                    <div key={index}>
                      <Button
                        variant={"outline"}
                        className="inset w-full justify-start rounded-none border-none text-left text-xs outline-0 -outline-offset-1 outline-blue-500 ring-offset-transparent hover:outline hover:outline-1 focus:ring-0 active:scale-100"
                      >
                        {block.type}
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex w-full grow flex-col gap-4 bg-white p-4">
            <div className="flex-none">
              <div className="flex items-center justify-between">
                <h1>Main Content</h1>
                {getWorkflow.data && <Connect flow={getWorkflow.data} />}
              </div>
            </div>
            <div className="min-h-0 grow-0 overflow-y-auto rounded-lg border ">
              {flow && <WorkflowBlockDisplay flow={flow} setFlow={setFlow} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// export type flow = {
//   version: number;
//   blocks: (flowBlock | flowFetch | flowRun | flowRequest | flowResponse)[];
// };

// export type flowBlock = {
//   type: "block";
//   blockID: string;
//   outputVar: string;
// };

// export type flowFetch = {
//   type: "fetch";
//   url: string;
//   body: object;
// };

// export type flowRun = {
//   type: "run";
//   contentToRun: string;
//   returnVariable: string;
// };

// export type flowRequest = {
//   type: "request";
// };

// export type flowResponse = {
//   type: "response";
// };

interface WorkflowBlockDisplayProps {
  flow: flow;
  setFlow: React.Dispatch<React.SetStateAction<flow | undefined>>;
}

const WorkflowBlockDisplay = ({ flow, setFlow }: WorkflowBlockDisplayProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {flow.blocks.map((block, index) => {
        switch (block.type) {
          case "block":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-blue-500 p-2 text-white"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex gap-2 ">
                    <Label>{block.type}</Label>
                  </div>
                </div>

                <AddBlockDialogue flow={flow} setFlow={setFlow} index={index} />
              </div>
            );
          case "fetch":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-purple-500 p-2 text-white"
              >
                <Label>{block.type}</Label>
                <AddBlockDialogue flow={flow} setFlow={setFlow} index={index} />
              </div>
            );
          case "run":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-purple-500 p-2 text-white"
              >
                <Label>{block.type}</Label>
                <AddBlockDialogue flow={flow} setFlow={setFlow} index={index} />
              </div>
            );
          case "request":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-purple-500 p-2 text-white"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex gap-2 ">
                    <Label>{block.type}</Label>
                  </div>
                </div>
                <AddBlockDialogue flow={flow} setFlow={setFlow} index={index} />
              </div>
            );
          case "response":
            return (
              <div
                key={index}
                className="relative w-full rounded-lg bg-gray-800 text-white"
              >
                <div className="flex items-center justify-between p-2">
                  <Label>{block.type}</Label>
                </div>
              </div>
            );
          default:
            return <div>Unknown block type</div>;
        }
      })}
    </div>
  );
};

interface AddBlockDialogueProps {
  flow: flow;
  setFlow: React.Dispatch<React.SetStateAction<flow | undefined>>;
  index: number;
}

function AddBlockDialogue({ flow, setFlow, index }: AddBlockDialogueProps) {
  const allBlocksQuery = api.blocks.getAllBlocks.useQuery();

  function addBlock(
    flowComponent: flowBlock | flowFetch | flowRequest | flowResponse | flowRun
  ) {
    console.log("adding block");
    const newBlocks = [...flow.blocks];
    newBlocks.splice(index + 1, 0, flowComponent);
    const newFlow = { ...flow, blocks: newBlocks };
    setFlow(newFlow);
    console.log(newFlow);
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute bottom-0 left-1/2 translate-y-1/2 rounded-full border bg-white p-2 opacity-0 drop-shadow-md transition-all group-hover:opacity-100 peer-focus:opacity-100"></DropdownMenuTrigger>
      <DropdownMenuContent className="peer">
        <DropdownMenuLabel>Add Component</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {/* <UserPlus className="mr-2 h-4 w-4" /> */}
            <span>Block</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {allBlocksQuery.data &&
                allBlocksQuery.data.map((block, index) => {
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() =>
                        addBlock({
                          type: "block",
                          blockID: block.id,
                          outputVar: "output",
                        })
                      }
                    >
                      <span>{block.name}</span>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem disabled>Run (coming soon)</DropdownMenuItem>
        <DropdownMenuItem disabled>Fetch (coming soon)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
