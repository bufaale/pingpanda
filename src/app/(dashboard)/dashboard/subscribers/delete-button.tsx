"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteSubscriberButtonProps {
  subscriberId: string;
  email: string;
}

export function DeleteSubscriberButton({
  subscriberId,
  email,
}: DeleteSubscriberButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove subscriber ${email}? They will stop receiving updates.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/subscribers/${subscriberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to remove subscriber");
        return;
      }

      router.refresh();
    } catch {
      alert("Failed to remove subscriber");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
      title="Remove subscriber"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
