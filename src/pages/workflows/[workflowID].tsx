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
  flowComponent,
  flowFetch,
  flowRequest,
  flowResponse,
} from "~/utils/types";
import { Plus, PlusIcon, XIcon } from "lucide-react";

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
import Link from "next/link";
import { Input } from "~/components/ui/input";

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
                flow.components.map((component, index) => {
                  return (
                    <div key={index}>
                      <Button
                        variant={"outline"}
                        className="inset w-full justify-start rounded-none border-none text-left text-xs outline-0 -outline-offset-1 outline-blue-500 ring-offset-transparent hover:outline hover:outline-1 focus:ring-0 active:scale-100"
                      >
                        {component.type}
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

interface WorkflowBlockDisplayProps {
  flow: flow;
  setFlow: React.Dispatch<React.SetStateAction<flow | undefined>>;
}

const WorkflowBlockDisplay = ({ flow, setFlow }: WorkflowBlockDisplayProps) => {
  const myBlocks = api.blocks.getAllBlocks.useQuery();

  return (
    <div className="flex flex-col gap-4 p-4">
      {flow.components.map((component, index) => {
        switch (component.type) {
          case "block":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-blue-500 p-2 text-white"
              >
                <div className="mb-2 flex items-center justify-between p-2">
                  <div className="flex w-full justify-between gap-2 ">
                    <Label className="font-semibold capitalize">
                      {component.type}
                    </Label>
                    {myBlocks.data
                      ?.map((block, index) => {
                        return block.id;
                      })
                      .includes(component.blockID) && (
                      <Link href={`/blocks/${component.blockID}`}>
                        <Label className="hover:cursor-pointer">
                          Visit Block
                        </Label>
                      </Link>
                    )}
                  </div>
                </div>
                {myBlocks.data && component.requiredVariables.length > 0 && (
                  <div className="mb-4 flex flex-col gap-2 rounded-lg bg-white p-2">
                    <Label className="text-blue-500">Required Variables</Label>
                    <div className="flex w-full gap-2">
                      {component.requiredVariables.map((variable, index) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 p-2 text-white"
                          >
                            <Label>{variable}</Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 rounded-lg bg-white p-2">
                  <Label className="text-blue-500">Output Variable</Label>
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      className="text-blue-500"
                      defaultValue={component.outputVar}
                      onChange={(e) => {
                        setFlow({
                          ...flow,
                          components: flow.components.map((component, i) => {
                            if (i === index) {
                              return {
                                ...component,
                                outputVar: e.target.value,
                              };
                            } else {
                              return component;
                            }
                          }),
                        });
                      }}
                    />
                  </div>
                </div>
                <AddComponentDialogue
                  flow={flow}
                  setFlow={setFlow}
                  index={index}
                />
              </div>
            );
          case "fetch":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-purple-500 p-2 text-white"
              >
                <Label>{component.type}</Label>
                <AddComponentDialogue
                  flow={flow}
                  setFlow={setFlow}
                  index={index}
                />
              </div>
            );
          case "request":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-purple-500 p-2 text-white"
              >
                <div className="mb-2 flex items-center justify-between p-2">
                  <div className="flex gap-2 ">
                    <Label className="font-semibold capitalize">
                      {component.type}
                    </Label>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-white p-2">
                  <Label className="text-purple-500">
                    Expected Incoming Variables
                  </Label>
                  <div className="flex w-full gap-2">
                    <button
                      onClick={() => {
                        setFlow({
                          ...flow,
                          components: [
                            ...flow.components.slice(0, index),
                            {
                              ...component,
                              incomings: [...component.incomings, ""],
                            },
                            ...flow.components.slice(index + 1),
                          ],
                        });
                      }}
                      className="rounded-full bg-purple-500 p-1 text-white transition hover:bg-purple-400"
                    >
                      <PlusIcon size={16} />
                    </button>
                    {component.incomings.map((variable, indexi) => {
                      return (
                        <div
                          key={indexi}
                          className="flex items-center justify-between rounded-full bg-gray-200 p-1"
                        >
                          <input
                            type="text"
                            className="ml-2 bg-transparent text-xs text-black outline-none"
                            defaultValue={variable}
                            onChange={(e) => {
                              setFlow({
                                ...flow,
                                components: flow.components.map(
                                  (component, i) => {
                                    if (i === index) {
                                      component = component as flowRequest;
                                      return {
                                        ...component,
                                        incomings: component.incomings.map(
                                          (incoming, ii) => {
                                            if (ii === indexi) {
                                              return e.target.value;
                                            } else {
                                              return incoming;
                                            }
                                          }
                                        ),
                                      };
                                    } else {
                                      return component;
                                    }
                                  }
                                ),
                              });
                            }}
                          />
                          <button
                            onClick={() => {
                              setFlow({
                                ...flow,
                                components: [
                                  ...flow.components.slice(0, index),
                                  {
                                    ...component,
                                    incomings: [
                                      ...component.incomings.slice(0, indexi),
                                      ...component.incomings.slice(indexi + 1),
                                    ],
                                  },
                                  ...flow.components.slice(index + 1),
                                ],
                              });
                            }}
                            className="rounded-full bg-red-500 p-1 text-white transition hover:bg-red-400"
                          >
                            <XIcon size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <AddComponentDialogue
                  flow={flow}
                  setFlow={setFlow}
                  index={index}
                />
              </div>
            );
          case "response":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-gray-500 p-2 text-white"
              >
                <div className="mb-2 flex items-center justify-between p-2">
                  <div className="flex gap-2 ">
                    <Label className="font-semibold capitalize">
                      {component.type}
                    </Label>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-white p-2">
                  <Label className="text-gray-500">Outgoing Variables</Label>
                  <div className="flex w-full gap-2">
                    <button
                      onClick={() => {
                        setFlow({
                          ...flow,
                          components: [
                            ...flow.components.slice(0, index),
                            {
                              ...component,
                              outgoings: [...component.outgoings, ""],
                            },
                            ...flow.components.slice(index + 1),
                          ],
                        });
                      }}
                      className="rounded-full bg-gray-500 p-1 text-white transition hover:bg-purple-400"
                    >
                      <PlusIcon size={16} />
                    </button>
                    {component.outgoings.map((variable, indexi) => {
                      return (
                        <div
                          key={indexi}
                          className="flex items-center justify-between rounded-full bg-gray-200 p-1"
                        >
                          <input
                            type="text"
                            className="ml-2 bg-transparent text-xs text-black outline-none"
                            defaultValue={variable}
                            onChange={(e) => {
                              setFlow({
                                ...flow,
                                components: flow.components.map(
                                  (component, i) => {
                                    if (i === index) {
                                      component = component as flowResponse;
                                      return {
                                        ...component,
                                        outgoings: component.outgoings.map(
                                          (outgoing, ii) => {
                                            if (ii === indexi) {
                                              return e.target.value;
                                            } else {
                                              return outgoing;
                                            }
                                          }
                                        ),
                                      };
                                    } else {
                                      return component;
                                    }
                                  }
                                ),
                              });
                            }}
                          />

                          <button
                            onClick={() => {
                              setFlow({
                                ...flow,
                                components: [
                                  ...flow.components.slice(0, index),
                                  {
                                    ...component,
                                    outgoings: [
                                      ...component.outgoings.slice(0, indexi),
                                      ...component.outgoings.slice(indexi + 1),
                                    ],
                                  },
                                  ...flow.components.slice(index + 1),
                                ],
                              });
                            }}
                            className="rounded-full bg-red-500 p-1 text-white transition hover:bg-red-400"
                          >
                            <XIcon size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <AddComponentDialogue
                  flow={flow}
                  setFlow={setFlow}
                  index={index}
                />
              </div>
            );
          case "assert":
            return (
              <div
                key={index}
                className="group relative w-full rounded-lg bg-green-500 p-2 text-white"
              >
                <div className="mb-2 flex items-center justify-between p-2">
                  <div className="flex w-full justify-between gap-2 ">
                    <Label className="font-semibold capitalize">
                      {component.type}
                    </Label>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-white p-2">
                  <Label className="text-green-500">Output Variable</Label>
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      className="text-green-500"
                      defaultValue={component.outputVar}
                      onChange={(e) => {
                        setFlow({
                          ...flow,
                          components: flow.components.map((component, i) => {
                            if (i === index) {
                              return {
                                ...component,
                                outputVar: e.target.value,
                              };
                            } else {
                              return component;
                            }
                          }),
                        });
                      }}
                    />
                    <h1 className="text-green-500">=</h1>
                    <input
                      type="text"
                      className="text-green-500"
                      defaultValue={component.outputValue}
                      onChange={(e) => {
                        setFlow({
                          ...flow,
                          components: flow.components.map((component, i) => {
                            if (i === index) {
                              return {
                                ...component,
                                outputValue: e.target.value,
                              };
                            } else {
                              return component;
                            }
                          }),
                        });
                      }}
                    />
                  </div>
                </div>
                <AddComponentDialogue
                  flow={flow}
                  setFlow={setFlow}
                  index={index}
                />
              </div>
            );

          default:
            return <div>Unknown component type</div>;
        }
      })}
    </div>
  );
};

interface AddComponentDialogueProps {
  flow: flow;
  setFlow: React.Dispatch<React.SetStateAction<flow | undefined>>;
  index: number;
}

function AddComponentDialogue({
  flow,
  setFlow,
  index,
}: AddComponentDialogueProps) {
  const allComponentsQuery = api.blocks.getAllBlocks.useQuery();

  function addComponent(flowComponent: flowComponent) {
    console.log("adding component");
    const newcomponents = [...flow.components];
    newcomponents.splice(index + 1, 0, flowComponent);
    const newFlow = { ...flow, components: newcomponents };
    setFlow(newFlow);
    console.log(newFlow);
  }

  function detectRequiredVariables(
    messages: { role: "user" | "assistant" | "system"; content: string }[]
  ) {
    console.log(messages);
    const requiredVariables: string[] = [];
    //search for {variable} in messages
    messages.forEach((message) => {
      const regex = /{([^}]+)}/g;
      let match;
      while ((match = regex.exec(message.content))) {
        requiredVariables.push(match[1] as string);
      }
    });
    console.log(requiredVariables);
    return requiredVariables;
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
              {allComponentsQuery.isLoading && <div>Loading...</div>}
              {allComponentsQuery.data?.length === 0 && (
                <DropdownMenuItem>
                  No blocks found. Create one{" "}
                  <span className="ml-1 text-blue-500 transition hover:text-blue-400">
                    <Link href={"/blocks"}>here!</Link>
                  </span>
                </DropdownMenuItem>
              )}
              {allComponentsQuery.data &&
                allComponentsQuery.data.map((component, index) => {
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() =>
                        addComponent({
                          type: "block",
                          blockID: component.id,
                          outputVar: "output",
                          requiredVariables: detectRequiredVariables(
                            component.messages as {
                              role: "user" | "assistant" | "system";
                              content: string;
                            }[]
                          ),
                        })
                      }
                    >
                      <span>{component.name}</span>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem disabled>Run (coming soon)</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            addComponent({
              type: "assert",
              outputVar: "output",
              outputValue: "value",
            })
          }
        >
          Assert
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
