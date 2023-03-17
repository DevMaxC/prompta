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

    const promptaKey = body.key;

    const variables = body.variables;

    // find the key owner
    const keyOwner = await prisma.promptaKey.findUnique({
      where: {
        key: promptaKey,
      },
      include: {
        user: true,
      },
    });

    if (keyOwner === null) throw new Error("Invalid key");

    if (keyOwner.user.openaiKey === null)
      throw new Error("OpenAI key not found");
    const configuration = new Configuration({
      apiKey: keyOwner.user.openaiKey,
    });

    const openai = new OpenAIApi(configuration);

    // find the workflow
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflowAPI as string,
      },
    });

    if (workflow === null) throw new Error("Workflow not found");

    // check if the workflow belongs to the key owner
    if (workflow.userId !== keyOwner.user.id)
      throw new Error("Workflow not found");

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

        if (toRun === null) throw new Error("Block not found");

        // check if the block belongs to the key owner
        if (toRun.userId !== keyOwner.user.id)
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
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages,
        });

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
