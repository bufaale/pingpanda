import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChannelCard } from "./channel-card";

function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString();
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: channels } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get recent notification logs
  const channelIds = channels?.map((c) => c.id) ?? [];
  const { data: recentLogs } = channelIds.length > 0
    ? await supabase
        .from("notification_log")
        .select("*")
        .in("channel_id", channelIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  // Build a map of channel IDs to names for log display
  const channelNameMap = new Map<string, string>();
  channels?.forEach((c) => channelNameMap.set(c.id, c.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Configure how you get notified about incidents and status changes.
          </p>
        </div>
        <Link href="/dashboard/notifications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Channel
          </Button>
        </Link>
      </div>

      {/* Channels */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
        {!channels || channels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No notification channels configured yet.
              </p>
              <Link href="/dashboard/notifications/new">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Channel
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Notifications Log */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
        <Card>
          <CardContent className="pt-6">
            {!recentLogs || recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications sent yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => {
                  const channelName = log.channel_id
                    ? channelNameMap.get(log.channel_id)
                    : null;

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {(log.type ?? "notification").replace(/_/g, " ")}
                          {channelName && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              via {channelName}
                            </span>
                          )}
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          title={new Date(log.sent_at as string).toLocaleString()}
                        >
                          {relativeTime(log.sent_at as string)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          log.status === "sent"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : log.status === "failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
