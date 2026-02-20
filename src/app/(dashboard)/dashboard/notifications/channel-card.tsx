"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  MessageSquare,
  Webhook,
  Smartphone,
  Trash2,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { NotificationChannelRow } from "@/types/database";

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  slack: MessageSquare,
  webhook: Webhook,
  sms: Smartphone,
};

interface ChannelCardProps {
  channel: NotificationChannelRow;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(channel.is_active);
  const [toggling, setToggling] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const Icon = channelIcons[channel.type] || Webhook;

  async function handleToggle(checked: boolean) {
    setToggling(true);
    const previous = isActive;
    setIsActive(checked); // Optimistic update

    try {
      const res = await fetch(`/api/notifications/channels/${channel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: checked }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update channel");
      }

      toast.success(checked ? "Channel enabled" : "Channel disabled");
      router.refresh();
    } catch (err) {
      setIsActive(previous); // Revert on error
      toast.error(
        err instanceof Error ? err.message : "Failed to update channel",
      );
    } finally {
      setToggling(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch(
        `/api/notifications/channels/${channel.id}/test`,
        { method: "POST" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Test failed");
      }

      toast.success("Test notification sent successfully");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send test notification",
      );
    } finally {
      setTesting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notifications/channels/${channel.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete channel");
      }

      toast.success("Channel deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete channel",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">{channel.name}</CardTitle>
          <CardDescription className="capitalize">
            {channel.type}
            {isActive ? (
              <span className="ml-2 text-green-600">&middot; Active</span>
            ) : (
              <span className="ml-2 text-gray-400">&middot; Disabled</span>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={toggling}
            aria-label={`Toggle ${channel.name}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={testing || !isActive}
            title={!isActive ? "Enable channel to send a test" : "Send test notification"}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-1">Test</span>
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete notification channel</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &ldquo;{channel.name}&rdquo;?
                  This action cannot be undone. All notification history for this
                  channel will also be removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
    </Card>
  );
}
