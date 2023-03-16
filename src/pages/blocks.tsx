import Link from "next/link";
import { Nav } from "~/components/NavBar";
import { api } from "~/utils/api";

export default function Blocks() {
  const blockQuery = api.blocks.getAllBlocks.useQuery();
  const createBlockMutation = api.blocks.createBlock.useMutation({
    onSuccess: () => blockQuery.refetch(),
  });
  const deleteBlockMutation = api.blocks.deleteBlock.useMutation({
    onSuccess: () => blockQuery.refetch(),
  });

  return (
    <main>
      <div className="p-4">
        <Nav />
      </div>
      <div className="p-4">
        <div className="p-4">
          <div className="flex w-full justify-between">
            <h1 className="text-xl font-semibold">My Blocks</h1>
            <button
              onClick={() =>
                createBlockMutation.mutate({
                  name: "New Block",
                })
              }
              className="rounded-lg bg-blue-300 p-2 text-gray-800 transition hover:bg-blue-400 hover:text-black"
            >
              Create Block
            </button>
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

  return (
    <div className="relative w-full rounded-lg bg-red-500 p-2">
      <Link href={"/blocks/" + id}>
        <div className="p-2">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="p-2">
          <p>{description}</p>
        </div>
      </Link>
      <button
        onClick={() => {
          deleteBlockMutation.mutate({ id: id });
        }}
        className="absolute top-2 right-2 rounded-full bg-white px-2"
      >
        X
      </button>
    </div>
  );
}
