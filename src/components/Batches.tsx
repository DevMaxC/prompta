import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Batch } from "@prisma/client";
import { useEffect } from "react";

import { api } from "~/utils/api";

interface BatchesProps {
  id: string;
  setRefresh: (refresh: () => void) => void;
}
export default function Batches({ id, setRefresh }: BatchesProps) {
  const batches = api.batch.getBatches.useQuery(
    { blockId: id },
    { enabled: !!id }
  );

  useEffect(() => {
    setRefresh(() => batches.refetch);
  }, [batches.refetch]);

  return (
    <div className="rounded-lg border-2 border-black/30 p-4">
      <h1 className="text-lg font-semibold">
        Batches - {batches.data?.length || "0"}
      </h1>
      <Accordion type="single" collapsible>
        {batches.data
          ?.slice()
          .reverse()
          .map((batch, index) => (
            <AccordionItem key={index} value={batch.id}>
              <AccordionTrigger>{batch.name}</AccordionTrigger>
              <AccordionContent>
                <BatchItem batch={batch} />
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </div>
  );
}

function BatchItem({ batch }: { batch: Batch }) {
  const completions = api.batch.getCompletions.useQuery(
    { batchId: batch.id },
    { enabled: !!batch.id }
  );
  return (
    <div className="border-x p-4">
      <h1>Completions - {completions.data?.length || 0}</h1>
      <Accordion type="single" collapsible>
        {completions.data?.map((completion, id) => (
          <AccordionItem
            key={id}
            className={` ${
              completion.success ? "bg-green-300" : "bg-red-500"
            } drop-shadow-lg`}
            value={completion.id}
          >
            <AccordionTrigger className="p-4">
              {completion.name +
                " - " +
                (completion.success ? "Success" : "Fail")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="mx-4  p-4">
                <h1 className="text-lg font-semibold">
                  Ideal-{completion.expected}
                </h1>
                <h1 className="text-lg font-semibold">
                  Actual-{completion.actual}
                </h1>
                <h1 className="text-lg font-semibold">
                  Test Format-{completion.content?.valueOf().toLocaleString()}
                </h1>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
