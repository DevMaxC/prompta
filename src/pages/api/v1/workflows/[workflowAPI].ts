import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import {
  flow,
  flowBlock,
  flowFetch,
  flowRequest,
  flowResponse,
  flowRun,
} from "~/utils/types";

// import the prisma client
import { prisma } from "../../../../server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { workflowAPI } = req.query;
    if (workflowAPI === undefined) throw new Error("Workflow API not provided");

    const body = JSON.parse(req.body);

    const promptaKey = body.key as string;
    if (promptaKey === undefined) throw new Error("Key not provided");

    const variables = body.variables;

    // find the workflow
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflowAPI as string,
      },
      include: {
        user: {
          include: {
            promptaKeys: true,
          },
        },
      },
    });
    if (workflow === null) throw new Error("Workflow not found");
    if (!workflow.user.promptaKeys.map((key) => key.key).includes(promptaKey)) {
      throw new Error("Invalid key");
    }

    if (workflow?.user.openaiKey === null)
      throw new Error("OpenAI key not found");
    const configuration = new Configuration({
      apiKey: workflow.user.openaiKey,
    });
    const openai = new OpenAIApi(configuration);

    if (workflow === null) throw new Error("Workflow not found");

    // check if the workflow belongs to the key owner

    const flow = workflow.flow as flow;

    let passOn = "";
    for (var i = 0; i < flow.blocks.length; i++) {
      const block = flow.blocks[i] as
        | flowBlock
        | flowRun
        | flowRequest
        | flowResponse
        | flowFetch;
      if (block.type === "request") {
        const requestBlock = block as flowRequest;
        // const request = requestBlock.;
      }

      if (block.type === "response") {
        res.status(200).json(passOn);
      }

      if (block.type === "fetch") {
        const fetchBlock = block as flowFetch;
        await fetch(fetchBlock.url, {
          body: JSON.stringify(fetchBlock.body),
        });
      }

      if (block.type === "run") {
        // run the code
      }

      if (block.type === "block") {
        // get the block
        const toRun = await prisma.block.findUnique({
          where: {
            id: block.blockID,
          },
        });

        // check if the block belongs to the key owner
        if (toRun === null || toRun.userId !== workflow.user.id)
          throw new Error("Block not found");

        const messages = toRun.messages as {
          role: "user" | "system" | "assistant";
          content: string;
        }[];

        // perform replacements

        for (var j = 0; j < messages.length; j++) {
          const message = messages[j];
          if (message) {
            for (const [keyz, value] of Object.entries(variables)) {
              message.content = message.content.replace(
                `{${keyz}}`,
                value as string
              );
            }
          }
        }

        // run the block

        const time = new Date().getTime();
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages,
        });
        const time2 = new Date().getTime();
        console.log(time2 - time);

        if (!completion.data.choices[0])
          throw new Error("Completion did not generate");

        passOn = completion.data.choices[0].message?.content || "";
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}
