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

// this code is from new.ts, it creates the chain and returns the id of the chain
//use this code for reference

// // the user should provide following keys in the body:
//   // promptaKey: string
//   // messages: { role: "user" | "system" | "assistant", content: string }[]?
//   // starterBlockID: string
//   // variables: { [key: string]: any }
//   // model: string?

//   // messages is optional, if not provided, the user should provide the starterBlockID and potentially variables
//   // if messages is provided, the starterBlockID and variables are ignored

//   //the purpose of this api route is to communicate with the openai api and return the response
//   //aswell as save the conversation to the database, so that they can continue the chat,
//   //without having to input the messages again, the messages would be retrieved from the database.
//   // although that will be in another api route named [chainAPI].ts

//   //begin writing the code

//   //check if the user provided the key
//   if (!req.body.promptaKey) {
//     res.status(400).json({ error: "No key provided" });
//     return;
//   }

//   const user = await prisma.promptaKey.findUnique({
//     where: {
//       key: req.body.promptaKey,
//     },
//     select: {
//       user: true,
//     },
//   });

//   if (user === null) {
//     res.status(400).json({ error: "Invalid key" });
//     return;
//   }

//   //check if the user provided the messages
//   if (!req.body.messages && !req.body.starterBlockID) {
//     res.status(400).json({ error: "No messages or starterBlockID provided" });
//     return;
//   }

//   let starterMessages = [];
//   //check if the user provided the messages
//   if (req.body.messages) {
//     if (!Array.isArray(req.body.messages)) {
//       res.status(400).json({ error: "Messages should be an array" });
//       return;
//     }

//     starterMessages = req.body.messages;
//   } else if (req.body.starterBlockID) {
//     const starterBlock = await prisma.block.findUnique({
//       where: {
//         id: req.body.starterBlockID,
//       },
//     });

//     if (starterBlock === null) {
//       res.status(400).json({ error: "Starter block not found" });
//       return;
//     }

//     starterMessages = starterBlock.messages as {
//       role: "user" | "system" | "assistant";
//       content: string;
//     }[];
//   }

//   //check if the user provided the variables
//   let variables = {};
//   if (req.body.variables) {
//     if (typeof req.body.variables !== "object") {
//       res.status(400).json({ error: "Variables should be an object" });
//       return;
//     }

//     variables = req.body.variables;
//   }

//   // check if we need to perform replacements
//   for (var i = 0; i < starterMessages.length; i++) {
//     const message = starterMessages[i];
//     if (message) {
//       for (const [keyz, value] of Object.entries(variables)) {
//         message.content = message.content.replace(`{${keyz}}`, value as string);
//       }
//     }
//   }

//   if (user.user.openaiKey === null) {
//     res.status(400).json({ error: "No openai key set in settings" });
//     return;
//   }

//   //perform the completion
//   const configuration = new Configuration({
//     apiKey: user.user.openaiKey,
//   });
//   const openai = new OpenAIApi(configuration);

//   const model = req.body.model || "gpt-3.5-turbo";
//   const time = new Date().getTime();
//   const completion = await openai.createChatCompletion({
//     model: model,
//     messages: starterMessages,
//   });

//   const time2 = new Date().getTime();
//   console.log(time2 - time);

//   if (!completion.data.choices[0])
//     throw new Error("Completion did not generate");

//   // save the conversation to the database
//   const createdChain = await prisma.chain.create({
//     data: {
//       user: {
//         connect: {
//           id: user.user.id,
//         },
//       },
//       messages: starterMessages,
//       model: model,
//     },
//   });

//   // return the response
//   res.status(200).json({
//     messages: completion.data.choices[0].message?.content || "",
//     chainID: createdChain.id,
//   });

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

  if (user.user.openaiKey === null) {
    res.status(400).json({ error: "No openai key set in settings" });
    return;
  }

  const configuration = new Configuration({
    apiKey: user.user.openaiKey,
  });

  const openai = new OpenAIApi(configuration);

  const model = req.body.model || "gpt-3.5-turbo";
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

  const completion = await openai.createChatCompletion({
    model: model,
    messages: messages,
  });

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
