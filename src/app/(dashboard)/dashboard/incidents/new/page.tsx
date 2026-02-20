"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface StatusPageOption {
  id: string;
  name: string;
  components: Array<{ id: string; name: string }>;
}

export default function NewIncidentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusPages, setStatusPages] = useState<StatusPageOption[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    async function loadPages() {
      const supabase = createClient();

      // Fetch status pages
      const { data: pages } = await supabase
        .from("status_pages")
        .select("id, name")
        .order("name");

      if (!pages || pages.length === 0) return;

      // Fetch components for all pages
      const pageIds = pages.map((p) => p.id);
      const { data: components } = await supabase
        .from("components")
        .select("id, name, status_page_id")
        .in("status_page_id", pageIds)
        .order("position");

      // Group components by status page
      const result: StatusPageOption[] = pages.map((page) => ({
        id: page.id,
        name: page.name,
        components:
          components
            ?.filter((c) => c.status_page_id === page.id)
            .map((c) => ({ id: c.id, name: c.name })) ?? [],
      }));

      setStatusPages(result);
      setSelectedPage(pages[0].id);
    }
    loadPages();
  }, []);

  const currentPageComponents =
    statusPages.find((p) => p.id === selectedPage)?.components ?? [];

  function toggleComponent(id: string) {
    setSelectedComponents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_page_id: selectedPage,
          title: formData.get("title"),
          message: formData.get("message"),
          severity: formData.get("severity") || "minor",
          affected_components: selectedComponents,
          is_maintenance: isMaintenance,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create incident");
      }

      router.push("/dashboard/incidents");
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
        <Link href="/dashboard/incidents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Report Incident</h1>
          <p className="mt-1 text-muted-foreground">
            Create a new incident or schedule maintenance.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>
            Describe what happened and which components are affected.
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
              <Label>Status Page</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status page" />
                </SelectTrigger>
                <SelectContent>
                  {statusPages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="API server experiencing high latency"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Description</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe what's happening and what steps are being taken..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select name="severity" defaultValue="minor">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Affected Components */}
            {currentPageComponents.length > 0 && (
              <div className="space-y-2">
                <Label>Affected Components</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {currentPageComponents.map((comp) => (
                    <label
                      key={comp.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedComponents.includes(comp.id)}
                        onChange={() => toggleComponent(comp.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{comp.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                id="is_maintenance"
                checked={isMaintenance}
                onCheckedChange={setIsMaintenance}
              />
              <Label htmlFor="is_maintenance">Scheduled Maintenance</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/incidents">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedPage}>
                {loading ? "Creating..." : "Report Incident"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
