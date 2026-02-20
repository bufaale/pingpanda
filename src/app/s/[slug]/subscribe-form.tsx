"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface SubscribeFormProps {
  status_page_id: string;
  accent_color: string;
}

export function SubscribeForm({
  status_page_id,
  accent_color,
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, status_page_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to subscribe. Please try again.");
        return;
      }

      toast.success("Subscribed! You'll receive incident updates via email.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Subscribe to Updates
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Get notified when incidents are created, updated, or resolved.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: accent_color }}
          className="shrink-0 text-white hover:opacity-90"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}
