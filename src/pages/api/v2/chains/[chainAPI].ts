import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import {
  flow,
  flowAssert,
  flowBlock,
  flowComponent,
  flowFetch,
  flowRequest,
  flowResponse,
} from "~/utils/types";

// import the prisma client
import { prisma } from "../../../../server/db";
import complete from "~/utils/complete";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // read the new.ts file, this code should assume that the chain has already been created
  // the user can provide these keys in the body:
  // promptaKey: string
  // input: string

  const { chainAPI } = req.query;

  //check if the user provided the key
  if (!req.body.promptaKey) {
    res.status(400).json({ error: "No key provided" });
    return;
  }

  const user = await prisma.promptaKey.findUnique({
    where: {
      key: req.body.promptaKey,
    },
    select: {
      user: true,
    },
  });

  if (user === null) {
    res.status(400).json({ error: "Invalid key" });
    return;
  }

  //check if the user provided the input
  if (!req.body.input) {
    res.status(400).json({ error: "No input provided" });
    return;
  }

  //check if the user provided the chainID
  if (!chainAPI) {
    res.status(400).json({ error: "No chainID provided" });
    return;
  }

  const chain = await prisma.chain.findUnique({
    where: {
      id: chainAPI as string,
    },
  });

  if (chain === null) {
    res.status(400).json({ error: "Chain not found" });
    return;
  }

  // check if the user is the owner of the chain
  if (chain.userId !== user.user.id) {
    res.status(400).json({ error: "Chain not found" });
    return;
  }

  const model = req.body.model || "gpt-3.5-turbo";
  if (!user.user.hasGPT4Access) {
    if (model === "gpt-4") {
      res.status(400).json({ error: "You dont have access to GPT-4" });
      return;
    }
  }

  if (model !== "gpt-3.5-turbo" && model !== "gpt-4") {
    res.status(400).json({ error: "Invalid model" });
    return;
  }

  const time = new Date().getTime();

  // add the input to the messages
  const messages = chain.messages as {
    role: "user" | "system" | "assistant";
    content: string;
  }[];
  messages.push({
    role: "user",
    content: req.body.input,
  });

  const completion = await complete(messages, model, user.user.id);

  if (!completion) {
    res.status(400).json({
      error:
        "Something failed in the completion, check you have stripe billing set up",
    });
    return;
  }

  const time2 = new Date().getTime();

  console.log(time2 - time);

  if (!completion.data.choices[0])
    throw new Error("Completion did not generate");

  messages.push({
    role: "assistant",
    content: completion.data.choices[0].message?.content || "",
  });

  res.status(200).json({
    messages: completion.data.choices[0].message?.content || "",
    chainID: chain.id,
  });

  // save the conversation to the database
  await prisma.chain.update({
    where: {
      id: chain.id,
    },
    data: {
      messages: messages,
    },
  });
}
