import { Configuration, OpenAIApi } from "openai";
import { stripe } from "~/server/stripe/client";
import { env } from "~/env.mjs";

import { prisma } from "~/server/db";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function complete(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  model: string,
  userID: string
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userID,
    },
  });

  if (
    user &&
    user.stripeSubscriptionStatus === "active" &&
    user.stripeSubscriptionId &&
    user.stripeGptThreePointFiveTurboID &&
    user.stripeGptFourThirtyTwoKCompletionID &&
    user.stripeGptFourThirtyTwoKPromptID &&
    user.stripeGptFourEightKCompletionID &&
    user.stripeGptFourEightKPromptID
  ) {
    const completion = await openai.createChatCompletion({
      model: model,
      messages: messages,
    });

    if (model == "gpt-3.5-turbo") {
      console.log(
        await stripe.subscriptionItems.createUsageRecord(
          user.stripeGptThreePointFiveTurboID,
          {
            quantity: completion.data.usage?.total_tokens || 0,
            timestamp: Math.floor(Date.now() / 1000),
            action: "increment",
          }
        )
      );
    }

    if (model == "gpt-4") {
      console.log(
        await stripe.subscriptionItems.createUsageRecord(
          user.stripeGptFourEightKPromptID,
          {
            quantity: completion.data.usage?.prompt_tokens || 0,
            timestamp: Math.floor(Date.now() / 1000),
            action: "increment",
          }
        )
      );
      console.log(
        await stripe.subscriptionItems.createUsageRecord(
          user.stripeGptFourEightKCompletionID,
          {
            quantity: completion.data.usage?.completion_tokens || 0,
            timestamp: Math.floor(Date.now() / 1000),
            action: "increment",
          }
        )
      );
    }
    return completion;
  }

  return null;
}
