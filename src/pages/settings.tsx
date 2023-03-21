import { Nav } from "~/components/NavBar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import { Toggle } from "@/components/ui/toggle";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { PromptaKey } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function settings() {
  const [showKey, setShowKey] = useState(false);

  const user = api.user.getUser.useQuery();
  const keys = api.keys.getAll.useQuery();

  const createKey = api.keys.create.useMutation({
    onSuccess: () => {
      keys.refetch();
    },
  });

  const deleteKey = api.keys.delete.useMutation({
    onSuccess: () => {
      keys.refetch();
    },
  });

  const { toast } = useToast();
  const [animationParent] = useAutoAnimate();
  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col p-4">
        <h1 className="p-2 text-lg font-bold">Settings</h1>
        <div className="flex flex-col gap-2 rounded-lg border bg-white p-4">
          <Label htmlFor="key">Prompta Keys - {keys.data?.length || 0}</Label>
          <div className="relative">
            {keys.data && keys.data.length > 0 && (
              <table className="mb-4 w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      <Label>Key</Label>
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <Label>Created</Label>
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <Label>Last Used</Label>
                    </th>

                    <th scope="col" className="px-6 py-3">
                      <Label>Action</Label>
                    </th>
                  </tr>
                </thead>
                <tbody ref={animationParent}>
                  {keys.data.map((key, index) => (
                    <tr
                      key={key.id}
                      className="border-b bg-white dark:border-gray-700 dark:bg-gray-900"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                      >
                        <Label
                          className="hover:cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(key.key);
                            toast({
                              title: "Key Copied to Clipboard",
                            });
                          }}
                        >
                          {
                            // create a string of stars equal to the length of the key

                            key.key
                              .match(/.{1,4}/g)
                              ?.map((str) => {
                                return "****";
                              })

                              // replace the last 4 characters with the last 4 characters of the key
                              // this is to prevent the user from seeing the key in the UI

                              ?.join("")
                              .replace(/.{4}$/, key.key.slice(-4))

                              // also the first 4 characters

                              .replace(/^.{4}/, key.key.slice(0, 4))
                          }
                        </Label>
                      </th>
                      <td className="px-6 py-4">
                        <Label>
                          {new Date(key.createdAt).toLocaleDateString()}
                        </Label>
                      </td>
                      <td className="px-6 py-4">
                        <Label>
                          {new Date(key.lastUsed).toLocaleDateString()}
                        </Label>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => {
                            deleteKey.mutate({ id: key.id });
                            keys.refetch();
                          }}
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Button onClick={() => createKey.mutate()} variant={"subtle"}>
              Create Key
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
