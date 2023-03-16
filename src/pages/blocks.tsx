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
import { FocusEvent, useEffect, useRef, useState } from "react";
import { never } from "zod";
import { useRouter } from "next/router";

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
      <div className="mx-auto max-w-6xl p-4">
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

  const router = useRouter();

  const updateBlockMutation = api.blocks.updateBlock.useMutation();

  const blockLinkBehaviour = () => {
    router.push(`/blocks/${id}`);
  };

  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && divRef.current) {
      divRef.current.focus();
    }
  }, [isFocused]);

  const handleFocus = (e: FocusEvent<HTMLDivElement, Element>) => {
    if (!nameInputRef.current?.contains(e.target as Node)) {
      setIsFocused(true);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement, Element>) => {
    const { relatedTarget } = e;
    if (!relatedTarget || relatedTarget.tagName !== "INPUT") {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      nameInputRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={divRef}
          tabIndex={0}
          onDoubleClick={(e) => {
            if (e.currentTarget !== nameInputRef.current) {
              blockLinkBehaviour();
            }
          }}
          onFocus={(e) => {
            if (e.currentTarget !== nameInputRef.current) {
              handleFocus(e);
            }
          }}
          onBlur={handleBlur}
          className={`relative w-full rounded-lg border bg-white p-2 transition hover:drop-shadow ${
            isFocused ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="aspect-square w-full rounded-lg bg-red-500"></div>
            <div className="flex justify-between p-2">
              {title && (
                <Input
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                  }}
                  ref={nameInputRef}
                  contentEditable
                  defaultValue={title}
                  tabIndex={2}
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
              <Button
                onClick={() => {
                  blockLinkBehaviour();
                }}
                variant={"link"}
              >
                Visit
              </Button>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            setIsFocused(true);
          }}
        >
          Rename
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => {
            blockLinkBehaviour();
          }}
        >
          Visit
        </ContextMenuItem>
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
