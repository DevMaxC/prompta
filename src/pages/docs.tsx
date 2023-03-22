import { useState, useRef, useEffect } from "react";
import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";

type DocsPlaces = {
  title: string;
  ref: React.RefObject<HTMLDivElement>;
};

export default function Docs() {
  const [places, setPlaces] = useState<DocsPlaces[]>([
    { title: "Workflows", ref: useRef<HTMLDivElement>(null) },
    { title: "Chains", ref: useRef<HTMLDivElement>(null) },
    { title: "Chains API Example", ref: useRef<HTMLDivElement>(null) },
  ]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-50 bg-slate-100">
        <Nav />
      </div>
      <div className="flex">
        <Sidebar places={places} scrollToSection={scrollToSection} />
        <MainContent places={places} />
      </div>
    </main>
  );
}

interface SidebarProps {
  places: DocsPlaces[];
  scrollToSection: (ref: React.RefObject<HTMLDivElement>) => void;
}
const Sidebar = ({ places, scrollToSection }: SidebarProps) => {
  return (
    <aside className="sticky top-[4.8rem] h-[calc(100vh-4.8rem)] w-64 overflow-y-auto bg-gray-200 p-4">
      <ul className="font-semibold text-blue-600">
        {places.map((place, index) => (
          <li key={index} className="mb-4 text-lg">
            <Button
              variant={"ghost"}
              className="w-full"
              onClick={() => scrollToSection(place.ref)}
            >
              {place.title}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

interface MainContentProps {
  places: DocsPlaces[];
}
const MainContent = ({ places }: MainContentProps) => {
  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="mb-4 text-3xl font-bold text-blue-800">API Reference</h1>

      <section ref={places[0]?.ref}>
        <h2 className="mb-2 text-2xl font-semibold text-blue-700">Workflows</h2>
        <p className="text-gray-700">
          The Workflows API allows you to interact with workflows in the
          application.
        </p>
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-2 text-xl font-semibold text-blue-600">
          POST /api/v1/workflows/:workflowAPI
        </h3>
        <p className="text-gray-700">
          This endpoint creates a new workflow completion using the provided
          information.
        </p>
        <h4 className="font-semibold text-blue-500">Request Body</h4>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <code>key</code> (string) - The API key for the user.
          </li>
          <li>
            <code>variables</code> (object) - The input variables for the
            workflow.
            <pre>
              <code className="rounded bg-gray-100 p-2">
                {`{
  "variable1": "value1",
  "variable2": "value2",
  // ...
}`}
              </code>
            </pre>
          </li>
          <li>
            <code>model</code> (optional, string) - The model to use for
            completion. Default is "gpt-3.5-turbo".
          </li>
        </ul>
        <h4 className="font-semibold text-blue-500">Response</h4>
        <p className="text-gray-700">
          Returns an object with the result of the workflow completion. The
          response includes the output variables and their values.
        </p>
        <pre>
          <code className="rounded bg-gray-100 p-2">
            {`{
  "outputVariable1": "outputValue1",
  "outputVariable2": "outputValue2",
  // ...
}`}
          </code>
        </pre>
        <h4 className="mt-4 font-semibold text-blue-500">Example video</h4>
        <div className="relative overflow-hidden pt-[56.25%]">
          <iframe
            className=" absolute top-0 left-0 h-full w-full rounded-lg"
            src="https://www.youtube.com/embed/B0CRZ_f8Obc"
            title="Blocks Example"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      <section ref={places[1]?.ref}>
        <h2 className="mb-2 text-2xl font-semibold text-blue-700">Chains</h2>
        <p className="text-gray-700">
          The Chains API allows you to interact with chains in the application.
        </p>
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-2 text-xl font-semibold text-blue-600">
          POST /api/v2/chains/new
        </h3>
        <p className="text-gray-700">
          This endpoint creates a new chain or conversation with OpenAI API and
          returns the response. It also saves the conversation to the database.
        </p>
        <h4 className="font-semibold text-blue-500">Request Body</h4>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <code>promptaKey</code> (string) - The API key for the user.
          </li>
          <li>
            <code>messages</code> (optional, array) - An array of messages. If
            not provided, the user should provide the starterBlockID and
            potentially variables.
            <pre>
              <code className="rounded bg-gray-100 p-2">
                {`[
  {
    "role": "user",
    "content": "message1"
  },
  {
    "role": "assistant",
    "content": "message2"
  },
  // ...
]`}
              </code>
            </pre>
          </li>
          <li>
            <code>starterBlockID</code> (optional, string) - The ID of the
            starter block to use for the chain. Ignored if messages are
            provided.
          </li>
          <li>
            <code>variables</code> (optional, object) - The input variables for
            the chain.
            <pre>
              <code className="rounded bg-gray-100 p-2">
                {`{
  "variable1": "value1",
  "variable2": "value2",
  // ...
}`}
              </code>
            </pre>
          </li>
          <li>
            <code>model</code> (optional, string) - The model to use for
            completion. Default is "gpt-3.5-turbo".
          </li>
        </ul>
        <h4 className="font-semibold text-blue-500">Response</h4>
        <p className="text-gray-700">
          Returns an object with the result of the chain completion. The
          response includes the messages and the chain ID.
        </p>
        <pre>
          <code className="rounded bg-gray-100 p-2">
            {`{
  "messages": "responseMessage",
  "chainID": "chainID"
}`}
          </code>
        </pre>
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h3 className="mb-2 text-xl font-semibold text-blue-600">
          POST /api/v2/chains/:chainAPI
        </h3>
        <p className="text-gray-700">
          This endpoint continues an existing chain or conversation with OpenAI
          API and returns the response. It also updates the conversation in the
          database.
        </p>
        <h4 className="font-semibold text-blue-500">Request Body</h4>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <code>promptaKey</code> (string) - The API key for the user.
          </li>
          <li>
            <code>input</code> (string) - The input message for the chain.
          </li>
          <li>
            <code>model</code> (optional, string) - The model to use for
            completion. Default is "gpt-3.5-turbo".
          </li>
        </ul>
        <h4 className="font-semibold text-blue-500">Response</h4>
        <p className="text-gray-700">
          Returns an object with the result of the chain completion. The
          response includes the messages and the chain ID.
        </p>
        <pre>
          <code className="rounded bg-gray-100 p-2">
            {`{
  "messages": "responseMessage",
  "chainID": "chainID"
}`}
          </code>
        </pre>
      </section>
      <section className="rounded bg-white p-4 shadow" ref={places[2]?.ref}>
        <h2 className="mb-2 text-2xl font-semibold text-blue-700">
          Chain Example
        </h2>
        <p className="text-gray-700">
          In this example, we will demonstrate how to create and use chains.
        </p>
        <div className="relative overflow-hidden pt-[56.25%]">
          <iframe
            className="absolute top-0 left-0 h-full w-full rounded-lg"
            src="https://www.youtube.com/embed/MBtRPWyuqQs"
            title="Chain Example"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </main>
  );
};
