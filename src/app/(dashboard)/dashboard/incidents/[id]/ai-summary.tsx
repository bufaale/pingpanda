"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AiSummaryData {
  summary: string;
  root_cause: string;
  duration: string;
  impact: string;
}

interface AiSummaryProps {
  incidentId: string;
  existingSummary: string | null;
}

export function AiSummary({ incidentId, existingSummary }: AiSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AiSummaryData | null>(
    existingSummary
      ? { summary: existingSummary, root_cause: "", duration: "", impact: "" }
      : null,
  );

  async function generateSummary() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/incident-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident_id: incidentId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.error || `Failed to generate summary (${res.status})`,
        );
      }

      const result: AiSummaryData = await res.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate summary",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Summary
            </CardTitle>
            <CardDescription>
              AI-generated incident summary for your status page
            </CardDescription>
          </div>
          <Button
            onClick={generateSummary}
            disabled={loading}
            variant={data ? "outline" : "default"}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : data ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {!data && !error && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click &ldquo;Generate Summary&rdquo; to create an AI-powered
            incident summary based on the timeline and updates.
          </p>
        )}

        {data && (
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium mb-1">Summary</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {data.summary}
              </p>
            </div>

            {/* Details grid */}
            {(data.root_cause || data.duration || data.impact) && (
              <div className="grid gap-3 sm:grid-cols-3">
                {data.root_cause && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-medium">Root Cause</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.root_cause}
                    </p>
                  </div>
                )}
                {data.duration && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.duration}
                    </p>
                  </div>
                )}
                {data.impact && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-medium">Impact</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.impact}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
