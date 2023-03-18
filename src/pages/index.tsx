import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import Head from "next/head";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <main className="min-h-screen bg-slate-100">
      <Head>
        <title>Prompta</title>
        <meta
          name="description"
          content="Create and test AI prompts, then deploy them serverlessly."
        />
      </Head>
      <div>
        <Nav />
      </div>
      <div className="mx-auto max-w-6xl p-4">
        <div className="mt-64 flex aspect-video w-full flex-col items-center">
          <h1 className="max-w-2xl text-center text-6xl">
            The Fastest Way To Create Prompts
          </h1>
          <h2 className="font-semibold opacity-70">
            Test, Build and Deploy your own prompts in minutes
          </h2>
          <Button
            disabled={session ? true : false}
            onClick={() => {
              signIn();
            }}
            className="mt-8 text-xl"
          >
            Get Started
          </Button>
        </div>
        <div>
          <h1 className="text-center text-2xl">Features</h1>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="h-fit rounded-lg border-2 border-black/20 p-4">
              <h1 className="text-xl font-semibold">Testing</h1>
              <div className="opacity-70">
                Create and run hundreds of unit tests on your prompts.
                <span>
                  <ul>
                    <li>- Have data behind how your prompts are performing</li>
                    <li>- Predict average token usage</li>
                    <li>- Iterate quicker</li>
                    <li>- Easily format variables into your prompts</li>
                  </ul>
                </span>
              </div>
            </div>
            <div className="h-fit rounded-lg border-2 border-black/20 p-4">
              <h1 className="text-xl font-semibold">Workflows</h1>
              <div className="opacity-70">
                Chain together multiple prompts to create a workflow
                {/* bullet point list */}
                <ul>
                  <li>- Allows for more complex prompts</li>
                  <li>- Removes messy prompts from your codebase</li>
                  <li>
                    - Automatically rerun prompts if they don't format correctly
                  </li>
                  <li>- Log token usage</li>
                  <li>
                    - Low Latency Addition (max 8% on small requests decreasing
                    relative to)
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-span-2 h-fit rounded-lg border-2 border-black/20 p-4">
              <h1 className="text-xl font-semibold">
                Playground (Coming soon)
              </h1>
              <div className="opacity-70">
                Easily tabulate and experiment with prompt ideas
                {/* bullet point list */}
                <ul>
                  <li>- Visual Interface</li>
                  <li>- Convert to a template in one click</li>
                  <li>- Log token usage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
