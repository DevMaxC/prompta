import { env } from "~/env.mjs";
import { getOrCreateStripeCustomerIdForUser } from "~/server/stripe/stripe-webhook-handlers";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req.headers.host ?? "localhost:3000"}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: session.user?.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: env.STRIPE_GPT3_TURBO_PRICE_ID,
        },
        {
          price: env.STRIPE_GPT4_32_COMPLETION_PRICE_ID,
        },
        {
          price: env.STRIPE_GPT4_32_PROMPT_PRICE_ID,
        },
        {
          price: env.STRIPE_GPT4_8_COMPLETION_PRICE_ID,
        },
        {
          price: env.STRIPE_GPT4_8_PROMPT_PRICE_ID,
        },
      ],
      success_url: `${baseUrl}/dashboard?checkoutSuccess=true`,
      cancel_url: `${baseUrl}/dashboard?checkoutCanceled=true`,
      subscription_data: {
        metadata: {
          userId: session.user?.id,
        },
      },
    });

    if (!checkoutSession) {
      throw new Error("Could not create checkout session");
    }

    return { checkoutUrl: checkoutSession.url };
  }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req.headers.host ?? "localhost:3000"}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const stripeBillingPortalSession =
      await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/dashboard`,
      });

    if (!stripeBillingPortalSession) {
      throw new Error("Could not create billing portal session");
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
  }),
  getBillingHistory: protectedProcedure.query(async ({ ctx }) => {
    const { stripe, session, prisma } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const stripeInvoices = await stripe.invoices.list({
      customer: customerId,
    });

    return stripeInvoices.data.map((invoice) => ({
      id: invoice.id,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountRemaining: invoice.amount_remaining,
      date: invoice.due_date,
      status: invoice.status,
      subscriptionId: invoice.subscription,
    }));
  }),
  getSubscriptionItemUsage: protectedProcedure.query(async ({ ctx }) => {
    const { stripe, session, prisma } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
    });

    if (!user) {
      throw new Error("Could not find user");
    }

    if (
      !user.stripeGptThreePointFiveTurboID ||
      !user.stripeGptFourEightKPromptID ||
      !user.stripeGptFourEightKCompletionID ||
      !user.stripeGptFourThirtyTwoKPromptID ||
      !user.stripeGptFourThirtyTwoKCompletionID
    ) {
      throw new Error("Could not find subscription");
    }

    // gpt-3.5-turbo
    const turbo = await stripe.subscriptionItems.listUsageRecordSummaries(
      user?.stripeGptThreePointFiveTurboID
    );

    const fourEightPrompt =
      await stripe.subscriptionItems.listUsageRecordSummaries(
        user?.stripeGptFourEightKPromptID
      );

    const fourEightCompletion =
      await stripe.subscriptionItems.listUsageRecordSummaries(
        user?.stripeGptFourEightKCompletionID
      );

    const fourThirtyTwoPrompt =
      await stripe.subscriptionItems.listUsageRecordSummaries(
        user?.stripeGptFourThirtyTwoKPromptID
      );

    const fourThirtyTwoCompletion =
      await stripe.subscriptionItems.listUsageRecordSummaries(
        user?.stripeGptFourThirtyTwoKCompletionID
      );

    const subscriptionItemUsage = {
      turbo: turbo.data[0],
      fourEightPrompt: fourEightPrompt.data[0],
      fourEightCompletion: fourEightCompletion.data[0],
      fourThirtyTwoPrompt: fourThirtyTwoPrompt.data[0],
      fourThirtyTwoCompletion: fourThirtyTwoCompletion.data[0],
    };

    return subscriptionItemUsage;
  }),
});
