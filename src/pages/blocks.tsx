import Link from "next/link";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import Image from "next/image";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FocusEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { env } from "process";

export default function Blocks() {
  const blockQuery = api.blocks.getAllBlocks.useQuery();
  const createBlockMutation = api.blocks.createBlock.useMutation({
    onSuccess: () => blockQuery.refetch(),
  });
  const deleteBlockMutation = api.blocks.deleteBlock.useMutation({
    onSuccess: () => blockQuery.refetch(),
  });

  const [animationParent] = useAutoAnimate();

  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
      <div className="mx-auto max-w-6xl p-4">
        <div className="">
          <div className="flex w-full items-end justify-between">
            <h1 className="text-xl font-semibold">
              My Blocks - {blockQuery.data?.length}
            </h1>
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
        <div
          ref={animationParent}
          className="grid w-full grid-cols-2 justify-center gap-4 p-4 sm:grid-cols-3 md:grid-cols-4"
        >
          {blockQuery.data?.map((block) => (
            <Block
              key={block.id}
              title={block.name}
              description={"Description"}
              content={block.messages ? JSON.stringify(block.messages) : "[]"}
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
  content: string;
  refetch: () => void;
}
function Block({ title, description, id, refetch, content }: BlockProps) {
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

  const copyBlockMutation = api.blocks.copyBlock.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (isFocused) {
      nameInputRef.current?.focus();
    }
  }, [isFocused]);

  function getMyUrl() {
    // get the current url
    const url = window.location.href;
    // get the base url
    const baseUrl = url.split("/")[0] + "//" + url.split("/")[2];
    return baseUrl;
  }

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
            <div className="relative aspect-video w-full rounded-lg bg-red-500">
              <Image
                alt={title + " thumbnail"}
                fill
                src={`${getMyUrl()}/api/blockOG?content=${content}`}
              />
            </div>
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
            copyBlockMutation.mutate({ id });
          }}
        >
          Duplicate Block
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
