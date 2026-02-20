"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { StatusPage } from "@/types/status-page";

type ChannelType = "slack" | "webhook" | "sms";

export default function NewNotificationChannelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelType, setChannelType] = useState<ChannelType>("slack");
  const [statusPages, setStatusPages] = useState<StatusPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");

  useEffect(() => {
    fetch("/api/status-pages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStatusPages(data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    let config: Record<string, unknown> = {};
    switch (channelType) {
      case "slack":
        config = { webhook_url: formData.get("webhook_url") };
        break;
      case "webhook":
        config = {
          url: formData.get("url"),
          secret: formData.get("secret") || null,
          headers: null,
        };
        // Parse custom headers if provided
        {
          const headersRaw = (formData.get("headers") as string) || "";
          if (headersRaw.trim()) {
            try {
              config.headers = JSON.parse(headersRaw);
            } catch {
              setError("Custom headers must be valid JSON (e.g., {\"X-Key\": \"value\"})");
              setLoading(false);
              return;
            }
          }
        }
        break;
      case "sms":
        config = {
          phone_number: formData.get("phone_number"),
          country_code: formData.get("country_code"),
        };
        break;
    }

    try {
      const response = await fetch("/api/notifications/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: channelType,
          config,
          status_page_id: selectedPageId && selectedPageId !== "all" ? selectedPageId : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create channel");
      }

      router.push("/dashboard/notifications");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Notification Channel</h1>
          <p className="mt-1 text-muted-foreground">
            Add a new way to get notified about incidents and status changes.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Channel Details</CardTitle>
          <CardDescription>
            Configure your notification channel settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Engineering Slack"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Channel Type</Label>
              <Select
                value={channelType}
                onValueChange={(v) => setChannelType(v as ChannelType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic config fields */}
            {channelType === "slack" && (
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Slack Webhook URL</Label>
                <Input
                  id="webhook_url"
                  name="webhook_url"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Create an incoming webhook in your Slack workspace settings.
                </p>
              </div>
            )}

            {channelType === "webhook" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com/webhook"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">
                    Secret <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="secret"
                    name="secret"
                    type="password"
                    placeholder="Used to sign webhook payloads"
                    maxLength={256}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headers">
                    Custom Headers <span className="text-muted-foreground">(optional, JSON)</span>
                  </Label>
                  <Input
                    id="headers"
                    name="headers"
                    placeholder='{"Authorization": "Bearer token"}'
                  />
                  <p className="text-xs text-muted-foreground">
                    JSON object of custom HTTP headers to include in webhook requests.
                  </p>
                </div>
              </>
            )}

            {channelType === "sms" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_code">Country Code</Label>
                  <Input
                    id="country_code"
                    name="country_code"
                    placeholder="+1"
                    required
                    maxLength={5}
                    defaultValue="+1"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="555-123-4567"
                    required
                  />
                </div>
              </div>
            )}

            {/* Optional: link to specific status page */}
            <div className="space-y-2">
              <Label htmlFor="status_page">
                Status Page <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Select
                value={selectedPageId}
                onValueChange={setSelectedPageId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All status pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status pages</SelectItem>
                  {statusPages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Optionally restrict notifications to a specific status page.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/notifications">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Channel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
