import { useRouter } from "next/router";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/seperator";
import { api } from "~/utils/api";

export default function WorkflowEditor() {
  const router = useRouter();
  const ID = router.query.workflowID as string;

  const getAllBlocks = api.blocks.getAllBlocks.useQuery();

  return (
    <main className="h-screen bg-slate-100">
      <div className="flex h-full flex-col">
        <Nav />
        <div className="flex h-full flex-row">
          <div className="flex h-full w-1/4 min-w-fit flex-col gap-2 border-r p-4">
            <Label>
              Blocks <span className="text-xs opacity-70">(Click to add)</span>
            </Label>
            <Separator />
            <div className="flex flex-col gap-2">
              {getAllBlocks.data?.map((block) => (
                <Button variant={"subtle"}>{block.name}</Button>
              ))}
            </div>
            <Separator />
            <Button variant={"subtle"}>Add Block</Button>
          </div>

          <div className="h-full w-full p-4">
            <div className="flex justify-between">
              <h1>Main Content</h1>
              <Button variant={"outline"}>Connect</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
