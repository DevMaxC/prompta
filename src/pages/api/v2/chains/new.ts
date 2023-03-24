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
  // the user should provide following keys in the body:
  // promptaKey: string
  // messages: { role: "user" | "system" | "assistant", content: string }[]?
  // starterBlockID: string
  // variables: { [key: string]: any }
  // model: string?

  // messages is optional, if not provided, the user should provide the starterBlockID and potentially variables
  // if messages is provided, the starterBlockID and variables are ignored

  //the purpose of this api route is to communicate with the openai api and return the response
  //aswell as save the conversation to the database, so that they can continue the chat,
  //without having to input the messages again, the messages would be retrieved from the database.
  // although that will be in another api route named [chainAPI].ts

  //begin writing the code

  if (req.headers['content-type'] === 'application/json') {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
    }
  } else {
    console.error('Unexpected content type:', req.headers['content-type']);
    return res.status(400).json({ error: 'Unsupported content type' });
  }

  //check if the user provided the key
  console.log(req.body);

  req.body = JSON.parse(req.body);
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

  //check if the user provided the messages
  if (!req.body.messages && !req.body.starterBlockID) {
    res.status(400).json({ error: "No messages or starterBlockID provided" });
    return;
  }

  let starterMessages = [];
  //check if the user provided the messages
  if (req.body.messages) {
    if (!Array.isArray(req.body.messages)) {
      res.status(400).json({ error: "Messages should be an array" });
      return;
    }

    starterMessages = req.body.messages;
  } else if (req.body.starterBlockID) {
    const starterBlock = await prisma.block.findUnique({
      where: {
        id: req.body.starterBlockID,
      },
    });

    if (starterBlock === null) {
      res.status(400).json({ error: "Starter block not found" });
      return;
    }

    starterMessages = starterBlock.messages as {
      role: "user" | "system" | "assistant";
      content: string;
    }[];
  }

  //check if the user provided the variables
  let variables = {};
  if (req.body.variables) {
    if (typeof req.body.variables !== "object") {
      res.status(400).json({ error: "Variables should be an object" });
      return;
    }

    variables = req.body.variables;
  }

  // check if we need to perform replacements
  for (var i = 0; i < starterMessages.length; i++) {
    const message = starterMessages[i];
    if (message) {
      for (const [keyz, value] of Object.entries(variables)) {
        message.content = message.content.replace(`{${keyz}}`, value as string);
      }
    }
  }

  //perform the completion

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
  // const completion = await openai.createChatCompletion({
  //   model: model,
  //   messages: starterMessages,
  // });

  const completion = await complete(starterMessages, model, user.user.id);

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

  // save the conversation to the database
  const createdChain = await prisma.chain.create({
    data: {
      user: {
        connect: {
          id: user.user.id,
        },
      },
      messages: starterMessages,
      model: model,
    },
  });

  // return the response
  res.status(200).json({
    messages: completion.data.choices[0].message?.content || "",
    chainID: createdChain.id,
  });
}
