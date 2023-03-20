import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Separator } from "@/components/ui/seperator";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "~/utils/api";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastAction } from "./ui/toast";
import Link from "next/link";

interface UnitProps {
  id: string;
  refetch: () => void;
}

export default function Units({ id, refetch }: UnitProps) {
  const unitsQuery = api.blocks.getUnits.useQuery(
    { id: id },
    { enabled: !!id }
  );

  const createUnit = api.units.addUnit.useMutation({
    onSuccess: () => {
      unitsQuery.refetch();
    },
  });

  const user = api.user.getUser.useQuery();

  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateUnit = api.units.updateUnit.useMutation({
    onSuccess: () => {
      triggerRef.current?.click();
    },
  });
  const deleteUnit = api.units.deleteUnit.useMutation({
    onSuccess: () => {
      unitsQuery.refetch();
    },
  });

  const startBatch = api.batch.startBatch.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const collapsibleRef = useRef<HTMLButtonElement>(null);

  const { toast } = useToast();

  function runTest() {
    if (user.data?.openaiKey == null || user.data?.openaiKey == "") {
      toast({
        title: "OpenAI Key not set!",
        variant: "destructive",
        description: "Set your key in Settings to run tests on your blocks",
        action: (
          <ToastAction asChild altText="Visit Settings">
            <Link href="/settings">Visit Settings</Link>
          </ToastAction>
        ),
      });
      return;
    } else {
      startBatch.mutate({
        blockId: id,
      });
    }
  }

  return (
    <Collapsible defaultOpen>
      <div className="w-full rounded-lg border bg-white p-4 drop-shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Units - {unitsQuery.data?.length || 0}
          </h1>
          <div className="flex gap-4">
            <CollapsibleTrigger className="rounded-lg px-3 font-semibold transition hover:bg-slate-100">
              <Label className="hover:cursor-pointer">Hide/Show</Label>
            </CollapsibleTrigger>
            <Button
              disabled={
                unitsQuery.data && unitsQuery.data.length > 0 ? false : true
              }
              variant={"ghost"}
              onClick={runTest}
            >
              Run all tests
            </Button>
            <Button disabled variant={"ghost"}>
              Export
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <table className="mt-4 w-full text-center">
            {unitsQuery.data && unitsQuery.data.length > 0 && (
              <thead className="overflow-hidden rounded-lg bg-gray-300 p-2">
                <tr>
                  <th className="flex items-center justify-center p-4">
                    <Checkbox className="bg-white" />
                  </th>

                  <th>
                    <Label>Index</Label>
                  </th>
                  <th>
                    <Label>Name</Label>
                  </th>
                  <th>
                    <Label>Actions</Label>
                  </th>
                </tr>
              </thead>
            )}
            <tbody>
              {unitsQuery.data &&
                unitsQuery.data.map((unit, index) => {
                  return (
                    <tr className="border" key={unit.id}>
                      <td>
                        <Checkbox className="bg-white" />
                      </td>
                      <td>{index}</td>
                      <td>
                        <Input
                          type="text"
                          className="border-none py-2 text-center"
                          defaultValue={unit.name}
                          onChange={(e) => {
                            updateUnit.mutate({
                              id: unit.id,
                              name: e.currentTarget.value,
                              content: unit.content,
                            });
                          }}
                        />
                      </td>
                      <td className="flex items-center justify-center space-x-2">
                        <UnitModal unit={unit} />
                        <Button
                          onClick={() => {
                            deleteUnit.mutate({ id: unit.id });
                          }}
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <Button
            onClick={() => {
              createUnit.mutate({
                name: "New Unit",
                content: `{\n"variable": "example",\n"ideal":"value"\n}\n`,
                blockId: id,
              });
            }}
            className=" mt-4 w-full "
          >
            Add Unit
          </Button>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface UnitModalProps {
  unit: any;
}
function UnitModal({ unit }: UnitModalProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateUnit = api.units.updateUnit.useMutation({
    onSuccess: () => {
      triggerRef.current?.click();
    },
  });

  const [text, setText] = useState(unit.content);
  const [isErronious, setIsErronious] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const myObj = JSON.parse(text);
      // check if json has the key ideal

      if (!myObj.hasOwnProperty("ideal")) {
        setErrorMessage("Your json should have a key called ideal");
        setIsErronious(true);
      } else {
        setIsErronious(false);
        setErrorMessage("");
      }
    } catch (e: any) {
      setIsErronious(true);
      setErrorMessage(e.message);
    }
  }, [text]);

  return (
    <Dialog>
      <DialogTrigger ref={triggerRef} asChild>
        <Button className="my-2" variant="outline">
          Edit Unit
        </Button>
      </DialogTrigger>
      <Collapsible>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit unit</DialogTitle>
            <DialogDescription>
              Change parts of your unit. Each variable should be included here.
              <span className="mx-1">
                <CollapsibleTrigger className="aspect-square h-4 w-4 rounded-full bg-blue-500 text-xs text-white">
                  i
                </CollapsibleTrigger>
              </span>
            </DialogDescription>

            <CollapsibleContent>
              <DialogDescription>
                A variable can be created in your template by surrounding any
                word with curly braces. When the code is ran, if there is a
                corresponding variable in the unit, it will fill in the value.
              </DialogDescription>
              <DialogDescription>
                Include a key named "ideal" in your unit. This is the value that
                will determine if your test was a success or failure.
              </DialogDescription>
            </CollapsibleContent>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h1 className="mb-2 text-xs">{errorMessage}</h1>
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                id="name"
                defaultValue={text}
                className={`${
                  isErronious
                    ? " ring-red-500 focus:ring-red-500"
                    : " ring-green-500 focus:ring-green-500"
                } col-span-4 h-32 whitespace-nowrap ring-2 ring-offset-2`}
                onChange={(e) => {
                  setText(e.currentTarget.value);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isErronious}
              onClick={() => {
                updateUnit.mutate({
                  id: unit.id,
                  name: unit.name,
                  content: text,
                });
              }}
              type="submit"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Collapsible>
    </Dialog>
  );
}
