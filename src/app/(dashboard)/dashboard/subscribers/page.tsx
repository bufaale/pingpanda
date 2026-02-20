import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserPlanLimits } from "@/lib/monitoring/plan-limits";
import { DeleteSubscriberButton } from "./delete-button";

interface SubscriberRow {
  id: string;
  email: string;
  is_verified: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  status_page_id: string;
}

export default async function SubscribersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user's status pages
  const { data: statusPages } = await supabase
    .from("status_pages")
    .select("id, name, slug")
    .eq("user_id", user.id)
    .order("name");

  const pageIds = statusPages?.map((p) => p.id) ?? [];
  const pageMap = new Map(
    statusPages?.map((p) => [p.id, { name: p.name, slug: p.slug }]) ?? [],
  );

  // Get all subscribers across user's status pages
  const { data: subscribers } = pageIds.length > 0
    ? await supabase
        .from("subscribers")
        .select("id, email, is_verified, subscribed_at, unsubscribed_at, status_page_id")
        .in("status_page_id", pageIds)
        .is("unsubscribed_at", null)
        .order("subscribed_at", { ascending: false })
    : { data: [] as SubscriberRow[] };

  // Get plan limits
  const { limits } = await getUserPlanLimits(supabase, user.id);

  // Group subscribers by status page
  const grouped = new Map<string, SubscriberRow[]>();
  for (const sub of (subscribers ?? []) as SubscriberRow[]) {
    const existing = grouped.get(sub.status_page_id) ?? [];
    existing.push(sub);
    grouped.set(sub.status_page_id, existing);
  }

  // Count active (verified + not unsubscribed) subscribers total
  const activeCount = (subscribers ?? []).filter(
    (s) => (s as SubscriberRow).is_verified,
  ).length;
  const totalSubscribers = subscribers?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscribers</h1>
        <p className="mt-1 text-muted-foreground">
          Manage email subscribers across your status pages.
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscribers</CardDescription>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Verified and receiving updates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verification</CardDescription>
            <CardTitle className="text-2xl">
              {totalSubscribers - activeCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Waiting for email confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan Limit</CardDescription>
            <CardTitle className="text-2xl">
              {activeCount} / {limits.subscribers === Infinity ? "Unlimited" : limits.subscribers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Per status page
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped by status page */}
      {pageIds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Create a status page first to start accepting subscribers.
            </p>
          </CardContent>
        </Card>
      ) : grouped.size === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              No subscribers yet. Visitors can subscribe from your public status pages.
            </p>
          </CardContent>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([pageId, subs]) => {
          const page = pageMap.get(pageId);
          return (
            <div key={pageId} className="space-y-3">
              <h2 className="text-lg font-semibold">
                {page?.name ?? "Unknown Page"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({subs.length} subscriber{subs.length !== 1 ? "s" : ""})
                </span>
              </h2>

              <Card>
                <CardContent className="pt-4">
                  <div className="divide-y">
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium">{sub.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Subscribed{" "}
                              {new Date(sub.subscribed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.is_verified ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            >
                              Pending
                            </Badge>
                          )}
                          <DeleteSubscriberButton
                            subscriberId={sub.id}
                            email={sub.email}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}
