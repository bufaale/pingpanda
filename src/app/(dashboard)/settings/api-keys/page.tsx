"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="mt-1 text-muted-foreground">
          Use the PingPanda API to update your status pages programmatically.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            API key management is coming soon. You&apos;ll be able to update
            component statuses, create incidents, and manage monitors via API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
            <code>{`# Update component status
curl -X PATCH https://pingpanda.dev/api/v1/components/:id \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "operational"}'`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
