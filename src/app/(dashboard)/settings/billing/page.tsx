import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButtons } from "./upgrade-buttons";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isPurchased = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your purchase</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>License</CardTitle>
          <CardDescription>Your boilerplate license details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold capitalize">
              {isPurchased ? (profile?.subscription_plan || "Starter") : "No License"}
            </span>
            <Badge variant={isPurchased ? "default" : "secondary"}>
              {isPurchased ? "purchased" : "not purchased"}
            </Badge>
          </div>
          {isPurchased ? (
            <p className="text-sm text-muted-foreground">
              You have lifetime access to the boilerplate. Thank you for your purchase!
            </p>
          ) : (
            <UpgradeButtons />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
