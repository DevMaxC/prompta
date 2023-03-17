import { Prisma } from "@prisma/client";
import { useRouter } from "next/router";
import { Nav } from "~/components/NavBar";
import { api } from "~/utils/api";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useRef, useState } from "react";

import Batches from "~/components/Batches";
import Units from "~/components/Units";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button } from "~/components/ui/button";

export default function BlockDesign() {
  const router = useRouter();
  const ID = router.query.blockID as string;

  const blockQuery = api.blocks.getBlock.useQuery(
    {
      id: ID,
    },
    {
      enabled: !!ID,
    }
  );

  const [refreshBatches, setRefreshBatches] = useState<() => void>(
    () => () => {}
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
        <div className="p-4">
          <div className="flex w-full justify-between">
            <h1 className="text-xl font-semibold">Block Design</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {blockQuery.data && (
            <TemplateEditor
              id={blockQuery.data?.id as string}
              inputmessages={blockQuery.data?.messages}
            />
          )}
          <SideBar />
        </div>
        <Units refetch={refreshBatches} id={ID} />
        <Batches setRefresh={setRefreshBatches} id={ID} />
      </div>
    </main>
  );
}

export type Message = {
  content: string;
  role: string;
};

interface BlockProps {
  id: string;
  inputmessages: Prisma.JsonValue | undefined;
}
function TemplateEditor({ id, inputmessages }: BlockProps) {
  // content in schema array of {role: string, content: string}

  const [messages, setMessages] = useState<Message[]>(
    inputmessages as Message[]
  );
  const updateMessage = api.blocks.updateMessage.useMutation();

  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count > 0) {
      updateMessage.mutate({
        id: id,
        data: messages,
      });
    }
    setCount(count + 1);
  }, [messages]);

  function addBlock(role: string) {
    if (messages) {
      setMessages([...messages, { role: role, content: " " }]);
    } else {
      setMessages([{ role: role, content: " " }]);
    }
  }

  const [animationParent] = useAutoAnimate();

  return (
    <div className="col-span-1 flex aspect-video h-full w-full flex-col justify-between gap-2 rounded-lg border bg-white  p-4 md:col-span-2 ">
      <div
        ref={animationParent}
        className="flex max-h-[50vh] min-h-full flex-col gap-2 overflow-y-auto p-4"
      >
        {messages &&
          messages.map((message, index) => {
            if (message) {
              return (
                <div
                  className={`flex flex-col gap-2 rounded-lg ${
                    message.role == "system"
                      ? "bg-red-500"
                      : message.role == "user"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  } p-2 text-white`}
                  key={index}
                >
                  <div className="flex justify-between">
                    <h1>
                      {message.role} - {message.content.length}
                    </h1>
                    <button
                      onClick={() => {
                        let newMessages = messages.filter(
                          (_, idx) => idx !== index
                        );
                        setMessages(newMessages);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  {message && (
                    <textarea
                      className="h-max grow rounded-lg border border-black/20 bg-transparent p-2 text-white placeholder-slate-200"
                      placeholder={message.role + " message text"}
                      defaultValue={message.content}
                      onInput={(e) => {
                        let newMessages = [
                          ...messages.splice(0, index),
                          {
                            role: message.role,
                            content: e.currentTarget.value,
                          },
                          ...messages.splice(index + 1),
                        ];

                        setMessages(newMessages);
                      }}
                    />
                  )}
                </div>
              );
            }
          })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button className="w-full">Add Message</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-center font-sans">
          <DropdownMenuItem
            onClick={() => {
              addBlock("system");
            }}
          >
            System
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              addBlock("user");
            }}
          >
            User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              addBlock("assistant");
            }}
          >
            Assistant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SideBar() {
  return (
    <div className="col-span-1 flex h-full w-full items-center justify-center rounded-lg border bg-white/50 p-4 ">
      <h1>Statistics sidebar coming soon</h1>
    </div>
  );
}
