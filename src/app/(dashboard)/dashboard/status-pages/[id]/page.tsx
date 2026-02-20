import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Plus, Settings } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  operational:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  degraded:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  major_outage:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  maintenance:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  unknown:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded",
  major_outage: "Major Outage",
  maintenance: "Maintenance",
  unknown: "Unknown",
};

export default async function StatusPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!statusPage) notFound();

  const { data: components } = await supabase
    .from("components")
    .select("*")
    .eq("status_page_id", id)
    .order("position", { ascending: true });

  // Count subscribers
  const { count: subscriberCount } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status_page_id", id)
    .eq("is_verified", true)
    .is("unsubscribed_at", null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/status-pages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{statusPage.name}</h1>
            <Badge variant="outline">
              {statusPage.is_public ? "Public" : "Private"}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {statusPage.description || "No description"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${appUrl}/s/${statusPage.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Page
            </Button>
          </a>
          <Link href={`/dashboard/status-pages/${id}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {components?.length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">URL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground truncate">
              {appUrl}/s/{statusPage.slug}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Components */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Components</h2>
          <Link href={`/dashboard/status-pages/${id}/components/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </Link>
        </div>

        {!components || components.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No components yet. Add components to represent your services.
              </p>
              <Link href={`/dashboard/status-pages/${id}/components/new`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Component
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {components.map((component) => (
              <Card key={component.id}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div>
                    <CardTitle className="text-base">
                      {component.name}
                    </CardTitle>
                    {component.description && (
                      <CardDescription>
                        {component.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      statusColors[component.status] || statusColors.unknown
                    }
                  >
                    {statusLabels[component.status] || component.status}
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
