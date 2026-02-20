import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function StatusPagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: statusPages } = await supabase
    .from("status_pages")
    .select("*, components:components(count), subscribers:subscribers(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Status Pages</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your public status pages.
          </p>
        </div>
        <Link href="/dashboard/status-pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Status Page
          </Button>
        </Link>
      </div>

      {!statusPages || statusPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No status pages yet. Create your first one to keep your users informed.
            </p>
            <Link href="/dashboard/status-pages/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Status Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusPages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/status-pages/${page.id}`}
                      className="hover:underline"
                    >
                      {page.name}
                    </Link>
                  </CardTitle>
                  {page.is_public ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  {page.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {(page as Record<string, unknown>).components
                      ? ((page as Record<string, unknown>).components as { count: number }[])?.[0]?.count ?? 0
                      : 0} components
                  </span>
                  <a
                    href={`${appUrl}/s/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    View page
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
