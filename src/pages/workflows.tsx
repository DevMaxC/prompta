import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { api, getBaseUrl } from "~/utils/api";

import { env } from "../env.mjs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/router.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Workflows() {
  const allFlows = api.workflow.getAll.useQuery();
  const createFlow = api.workflow.create.useMutation({
    onSuccess: (data) => {
      allFlows.refetch();
    },
  });

  const router = useRouter();

  function getMyUrl() {
    // get the current url
    const url = window.location.href;
    // get the base url
    const baseUrl = url.split("/")[0] + "//" + url.split("/")[2];
    return baseUrl;
  }
  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-end justify-between">
          <h1 className="text-xl font-semibold">
            Workflows - {allFlows.data?.length || 0}
          </h1>
          <Button
            onClick={() => createFlow.mutate({ name: "New Workflow" })}
            variant={"default"}
          >
            Create Workflow
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {allFlows.data?.map((flow) => (
            <div key={flow.id} className="rounded-lg border bg-white p-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">{flow.name}</h2>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger>
                      <Button variant={"outline"}>Connect</Button>
                    </DialogTrigger>
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
                        <TabsContent
                          className="overflow-auto bg-slate-800"
                          value="JS"
                        >
                          <CodeBlock
                            code={[
                              `await fetch("${getMyUrl()}/api/workflows/${
                                flow.id
                              }", {`,
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
                              `requests.post("${getMyUrl()}/api/workflows/${
                                flow.id
                              }", {`,
                              `data: {`,
                              `"key": {YOUR_PROMPTA_API_KEY}`,
                              `}`,
                              `})`,
                            ]}
                          />
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => router.push(`/workflows/${flow.id}`)}
                    variant={"default"}
                  >
                    View
                  </Button>
                  <Button variant={"destructive"}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

interface BlockProps {
  code: string[];
}
function CodeBlock({ code }: BlockProps) {
  return (
    <div className="w-fit rounded-lg bg-slate-800 p-4">
      <pre className="text-sm text-slate-200">
        {code.map((line) => (
          <div>{line}</div>
        ))}
      </pre>
    </div>
  );
}
