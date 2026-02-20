import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status Page",
  description: "Real-time system status and uptime monitoring",
};

export default function PublicStatusPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://pingpanda.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              PingPanda
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
