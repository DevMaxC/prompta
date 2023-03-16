import { Nav } from "~/components/NavBar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import { Toggle } from "@/components/ui/toggle";
import { useState } from "react";

export default function settings() {
  const keyMut = api.user.updateKey.useMutation();
  const [showKey, setShowKey] = useState(false);

  const user = api.user.getUser.useQuery();
  return (
    <main>
      <div className="p-4">
        <Nav />
      </div>

      <div className="flex flex-col p-4">
        <h1 className="p-2 text-lg font-bold">Settings</h1>
        <div className="rounded-lg border p-4">
          <Label htmlFor="key">Open AI Key</Label>
          <div className="relative">
            {user.data?.openaiKey && (
              <Input
                defaultValue={user.data?.openaiKey}
                onInput={(e) => {
                  keyMut.mutate({ key: e.currentTarget.value });
                }}
                id="key"
                placeholder="sk-hf48*****dbkg"
                type={showKey ? "text" : "password"}
              />
            )}
            <Toggle
              className="absolute right-0 top-0 hover:bg-transparent"
              pressed={showKey}
              onPressedChange={() => {
                setShowKey(!showKey);
              }}
            >
              Show
            </Toggle>
          </div>
        </div>
      </div>
    </main>
  );
}
