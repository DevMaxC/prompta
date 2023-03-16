import Link from "next/link";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useRef } from "react";

export default function Blocks() {
  const blockQuery = api.blocks.getAllBlocks.useQuery();
  const createBlockMutation = api.blocks.createBlock.useMutation({
    onSuccess: () => blockQuery.refetch(),
  });
  const deleteBlockMutation = api.blocks.deleteBlock.useMutation({
    onSuccess: () => blockQuery.refetch(),
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
      <div className="p-4">
        <div className="p-4">
          <div className="flex w-full justify-between">
            <h1 className="text-xl font-semibold">My Blocks</h1>
            <Button
              onClick={() =>
                createBlockMutation.mutate({
                  name: "New Block",
                })
              }
            >
              Create Block
            </Button>
          </div>
        </div>
        <div className="grid w-full grid-cols-4 justify-center gap-4 p-4">
          {blockQuery.data?.map((block) => (
            <Block
              title={block.name}
              description={"Description"}
              id={block.id}
              refetch={blockQuery.refetch}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

interface BlockProps {
  title: string;
  description: string;
  id: string;
  refetch: () => void;
}
function Block({ title, description, id, refetch }: BlockProps) {
  const deleteBlockMutation = api.blocks.deleteBlock.useMutation({
    onSuccess: () => refetch(),
  });

  const updateBlockMutation = api.blocks.updateBlock.useMutation();

  const blockLinkBehaviour = () => {
    console.log("Clicked");
  };

  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative w-full rounded-lg border bg-white p-2">
          <div
            onClick={() => {
              blockLinkBehaviour();
            }}
          >
            <div className="flex justify-between p-2">
              {title && (
                <Input
                  ref={nameInputRef}
                  contentEditable
                  defaultValue={title}
                  onChange={(e) => {
                    console.log(e.currentTarget.value);
                    updateBlockMutation.mutate({
                      id,
                      name: e.currentTarget.value,
                    });
                  }}
                  className="border-none bg-transparent p-2 font-semibold outline-none focus:ring-0 focus:ring-offset-0"
                />
              )}
              <Button variant={"link"}>Visit</Button>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            nameInputRef.current?.focus();
          }}
        >
          Rename
        </ContextMenuItem>

        <ContextMenuItem>Visit</ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            deleteBlockMutation.mutate({ id });
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
