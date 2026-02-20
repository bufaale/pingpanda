"use client";

import { useState } from "react";

interface UptimeBarProps {
  daily_data: Array<{ date: string; uptime_percentage: number }>;
  uptime_percent: number;
}

function getBarColor(uptime: number): string {
  if (uptime >= 100) return "bg-green-500";
  if (uptime >= 95) return "bg-yellow-500";
  return "bg-red-500";
}

function getBarHoverColor(uptime: number): string {
  if (uptime >= 100) return "bg-green-400";
  if (uptime >= 95) return "bg-yellow-400";
  return "bg-red-400";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Build a 90-day array with uptime data filled in. Days without data
 * are shown as gray (no monitoring data).
 */
function build90DayArray(
  dailyData: Array<{ date: string; uptime_percentage: number }>,
): Array<{ date: string; uptime_percentage: number | null }> {
  const dataMap = new Map(dailyData.map((d) => [d.date, d.uptime_percentage]));
  const days: Array<{ date: string; uptime_percentage: number | null }> = [];

  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      uptime_percentage: dataMap.get(dateStr) ?? null,
    });
  }

  return days;
}

export function UptimeBar({ daily_data, uptime_percent }: UptimeBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const days = build90DayArray(daily_data);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex flex-1 items-center gap-px">
        {days.map((day, index) => {
          const isHovered = hoveredIndex === index;
          const hasData = day.uptime_percentage !== null;
          const uptime = day.uptime_percentage ?? 0;

          let barClass = "bg-gray-200 dark:bg-gray-700";
          if (hasData) {
            barClass = isHovered
              ? getBarHoverColor(uptime)
              : getBarColor(uptime);
          }

          return (
            <div
              key={day.date}
              className="relative flex-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`h-8 min-w-[2px] rounded-sm transition-colors ${barClass} cursor-pointer`}
              />
              {isHovered && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2">
                  <div className="whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-popover-foreground">
                      {formatDate(day.date)}
                    </p>
                    <p className="text-muted-foreground">
                      {hasData ? `${uptime.toFixed(2)}% uptime` : "No data"}
                    </p>
                  </div>
                  <div className="absolute left-1/2 top-full -translate-x-1/2">
                    <div className="h-2 w-2 rotate-45 border-b border-r border-border bg-popover" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="shrink-0 text-right">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {uptime_percent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
