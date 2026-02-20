import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Pause, Play } from "lucide-react";
import Link from "next/link";

export default async function MonitorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitors</h1>
          <p className="mt-1 text-muted-foreground">
            Track the uptime and performance of your services.
          </p>
        </div>
        <Link href="/dashboard/monitors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Monitor
          </Button>
        </Link>
      </div>

      {!monitors || monitors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No monitors yet. Add your first monitor to start tracking uptime.
            </p>
            <Link href="/dashboard/monitors/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Monitor
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {monitors.map((monitor) => (
            <Card key={monitor.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      monitor.is_paused
                        ? "bg-gray-400"
                        : monitor.last_status === "healthy"
                          ? "bg-green-500"
                          : monitor.last_status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                  />
                  <div>
                    <CardTitle className="text-base">
                      <Link
                        href={`/dashboard/monitors/${monitor.id}`}
                        className="hover:underline"
                      >
                        {monitor.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {monitor.url}
                      <a
                        href={monitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{monitor.uptime_percentage.toFixed(1)}% uptime</span>
                  <span>
                    {monitor.is_paused ? (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Pause className="h-3 w-3" /> Paused
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600">
                        <Play className="h-3 w-3" /> Active
                      </span>
                    )}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
