"use client";

import type { Component } from "@/types/status-page";
import type { UptimeDataPoint } from "@/types/status-page";
import {
  COMPONENT_STATUS_LABELS,
} from "@/lib/monitoring/constants";
import { UptimeBar } from "./uptime-bar";

// Full Tailwind class maps to avoid dynamic class purging
const STATUS_DOT_CLASSES: Record<string, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  major_outage: "bg-red-500",
  maintenance: "bg-blue-500",
  unknown: "bg-gray-400",
};

const STATUS_TEXT_CLASSES: Record<string, string> = {
  operational: "text-green-600 dark:text-green-400",
  degraded: "text-yellow-600 dark:text-yellow-400",
  major_outage: "text-red-600 dark:text-red-400",
  maintenance: "text-blue-600 dark:text-blue-400",
  unknown: "text-gray-500 dark:text-gray-400",
};

interface ComponentWithUptime extends Component {
  uptime_data?: {
    uptime_percent: number;
    daily_uptime: UptimeDataPoint[];
  };
}

interface ComponentListProps {
  components: ComponentWithUptime[];
}

export function ComponentList({ components }: ComponentListProps) {
  if (components.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No components configured yet.</p>
      </div>
    );
  }

  // Group components by group_name
  const groups = new Map<string | null, ComponentWithUptime[]>();
  for (const component of components) {
    const group = component.group_name;
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(component);
  }

  const groupEntries = Array.from(groups.entries());

  return (
    <div className="space-y-4">
      {groupEntries.map(([groupName, groupComponents]) => (
        <div
          key={groupName ?? "__ungrouped"}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          {groupName && (
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {groupName}
              </h3>
            </div>
          )}
          <div className="divide-y divide-border">
            {groupComponents.map((component) => (
              <div key={component.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {component.name}
                      </span>
                      {component.description && (
                        <span className="text-xs text-muted-foreground">
                          {component.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_CLASSES[component.status] ?? STATUS_DOT_CLASSES.unknown}`}
                    />
                    <span
                      className={`text-sm font-medium ${STATUS_TEXT_CLASSES[component.status] ?? STATUS_TEXT_CLASSES.unknown}`}
                    >
                      {COMPONENT_STATUS_LABELS[component.status] ??
                        "Unknown"}
                    </span>
                  </div>
                </div>
                {component.uptime_data && component.uptime_data.daily_uptime.length > 0 && (
                  <div className="mt-3">
                    <UptimeBar
                      daily_data={component.uptime_data.daily_uptime}
                      uptime_percent={component.uptime_data.uptime_percent}
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      <span>90 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
