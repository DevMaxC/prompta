import { env } from "../env.mjs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React from "react";
import { Button } from "./ui/button";
import { flow } from "~/utils/types";
import { Workflow } from "@prisma/client";
import { Label } from "./ui/label";
import Link from "next/link.js";

interface ConnectProps {
  flow: Workflow;
}

export default function Connect({ flow }: ConnectProps) {
  function getMyUrl() {
    // get the current url
    const url = window.location.href;
    // get the base url
    const baseUrl = url.split("/")[0] + "//" + url.split("/")[2];
    return baseUrl;
  }

  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger>Connect</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connection</DialogTitle>
          <DialogDescription>
            Connection Settings for {flow.name}
          </DialogDescription>
        </DialogHeader>
        <Tabs className="overflow-auto" defaultValue="JS">
          <TabsList>
            <TabsTrigger value="JS">JS</TabsTrigger>
            <TabsTrigger value="Python">Python</TabsTrigger>
          </TabsList>
          <TabsContent className="overflow-auto bg-slate-800" value="JS">
            <CodeBlock
              code={[
                `await fetch("${getMyUrl()}/api/workflows/${flow.id}", {`,
                `\tmethod: "POST",`,
                `\theaders: {`,
                `\t\t"Content-Type": "application/json",`,
                `\t},`,
                `\tbody: JSON.stringify({`,
                `\t\tkey: {YOUR_PROMPTA_API_KEY} `,
                `\t}),`,
                `})`,
              ]}
            />
          </TabsContent>
          <TabsContent
            className=" w-full overflow-auto bg-slate-800"
            value="Python"
          >
            <CodeBlock
              code={[
                `import requests`,
                `import json`,
                `payload = {`,
                `\t"key":{YOUR_PROMPTA_API_KEY}`,
                `\t"variables":{"variable":"value to replace 'variable' with"}    `,
                `}`,

                `test = requests.post("${getMyUrl()}/api/v1/workflows/${
                  flow.id
                }", {`,
                `\tdata = json.dumps(payload)`,
                `)`,
              ]}
            />
          </TabsContent>
        </Tabs>
        <Label className="text-gray-800">
          Get Prompta API Key{" "}
          <Link
            className="text-blue-500 transition hover:text-blue-400"
            href={"/settings"}
          >
            Here
          </Link>
        </Label>
      </DialogContent>
    </Dialog>
  );
}

interface BlockProps {
  code: string[];
}
export function CodeBlock({ code }: BlockProps) {
  return (
    <div className="w-fit rounded-lg bg-slate-800 p-4">
      <pre className="text-sm text-slate-200">
        {code.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </pre>
    </div>
  );
}
