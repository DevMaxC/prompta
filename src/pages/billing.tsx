import { Nav } from "~/components/NavBar";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Label } from "~/components/ui/label";

export default function billing() {
  const userQuery = api.user.getUser.useQuery();
  const { mutateAsync: createCheckoutSession } =
    api.stripe.createCheckoutSession.useMutation();

  const { mutateAsync: createBillingPortalSession } =
    api.stripe.createBillingPortalSession.useMutation();

  const usage = api.stripe.getSubscriptionItemUsage.useQuery();

  const { push } = useRouter();
  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav></Nav>
      </div>
      <div className="p-4">
        <h1>Billing</h1>
      </div>
      <div>
        <div className="p-4">
          {userQuery.data && (
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border  p-4">
                <h1>Payment</h1>

                {userQuery.data?.stripeSubscriptionStatus === "active" ? (
                  <div className="flex items-center justify-between gap-4">
                    <Label>
                      Use this portal to manage your billing information.
                    </Label>
                    <Button
                      onClick={async () => {
                        const session = await createBillingPortalSession();

                        if (session.billingPortalUrl)
                          push(session?.billingPortalUrl);
                      }}
                    >
                      Billing Information
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <Label>
                      To use the api you need to set up billing with stripe
                    </Label>
                    <Button
                      onClick={async () => {
                        const session = await createCheckoutSession();

                        if (session.checkoutUrl) push(session?.checkoutUrl);
                      }}
                    >
                      {" "}
                      Visit Stripe{" "}
                    </Button>
                  </div>
                )}
              </div>

              {usage.data && (
                <div className="rounded-lg border  p-4">
                  <h1>Usage</h1>
                  <div className="flex flex-col gap-2">
                    {usage.data &&
                      usage.data.turbo?.total_usage &&
                      usage.data.turbo?.total_usage > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <Label>GPT3.5 Turbo Tokens</Label>
                          <Label>{usage.data.turbo?.total_usage} Tokens</Label>
                        </div>
                      )}
                    {usage.data &&
                    usage.data.fourEightCompletion?.total_usage &&
                    usage.data.fourEightCompletion?.total_usage > 0 ? (
                      <div className="flex items-center justify-between gap-4">
                        <Label>GPT4 8K Completion Tokens</Label>
                        <Label>
                          {usage.data.fourEightCompletion?.total_usage} Tokens
                        </Label>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    {usage.data &&
                    usage.data.fourEightPrompt?.total_usage &&
                    usage.data.fourEightPrompt?.total_usage > 0 ? (
                      <div className="flex items-center justify-between gap-4">
                        <Label>GPT4 8K Prompt Tokens</Label>
                        <Label>
                          {usage.data.fourEightPrompt?.total_usage} Tokens
                        </Label>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    {usage.data &&
                    usage.data.fourThirtyTwoCompletion?.total_usage &&
                    usage.data.fourThirtyTwoCompletion?.total_usage > 0 ? (
                      <div className="flex items-center justify-between gap-4">
                        <Label>GPT4 32K Completion Tokens</Label>
                        <Label>
                          {usage.data.fourThirtyTwoCompletion?.total_usage}{" "}
                          Tokens
                        </Label>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    {usage.data &&
                    usage.data.fourThirtyTwoPrompt?.total_usage &&
                    usage.data.fourThirtyTwoPrompt?.total_usage > 0 ? (
                      <div className="flex items-center justify-between gap-4">
                        <Label>GPT4 32K Prompt Tokens</Label>
                        <Label>
                          {usage.data.fourThirtyTwoPrompt?.total_usage} Tokens
                        </Label>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
