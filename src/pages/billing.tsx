import { Nav } from "~/components/NavBar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function Billing() {
  return (
    <main>
      <div>
        <Nav />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col p-4">
        <h1 className="p-2 text-lg font-bold">Billing</h1>
      </div>
    </main>
  );
}
